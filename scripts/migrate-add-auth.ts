/**
 * Migration script to add authentication to existing data
 *
 * This script:
 * 1. Creates an initial admin user
 * 2. Migrates all existing conversations to the admin user
 * 3. Creates the initial invite code
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register scripts/migrate-add-auth.ts
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Import models (ensure models are defined before running)
import User from '../src/models/User';
import Conversation from '../src/models/Conversation';
import InviteCode from '../src/models/InviteCode';

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_INVITE_CODE = process.env.ADMIN_INVITE_CODE || 'INITIAL_INVITE';

async function migrate() {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI not set in .env.local');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Step 1: Create admin user
    console.log('\nStep 1: Creating admin user...');

    const existingAdmin = await User.findOne({ username: 'admin' });
    let adminUser;
    if (existingAdmin) {
      console.log('Admin user already exists. Using existing user.');
      adminUser = existingAdmin;
    } else {
      const passwordHash = await bcrypt.hash('admin123', 12);
      adminUser = await User.create({
        username: 'admin',
        email: ADMIN_EMAIL,
        passwordHash,
        inviteCodeUsed: ADMIN_INVITE_CODE,
      });
      console.log(`✓ Admin user created: ${adminUser.username}`);
    }

    // Step 2: Migrate existing conversations
    console.log('\nStep 2: Migrating existing conversations...');

    const conversationsWithoutUser = await Conversation.find({
      userId: { $exists: false },
    });

    console.log(`Found ${conversationsWithoutUser.length} conversations without userId`);

    if (conversationsWithoutUser.length > 0) {
      await Conversation.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: adminUser._id } }
      );
      console.log(`✓ Migrated ${conversationsWithoutUser.length} conversations to admin user`);
    } else {
      console.log('No conversations to migrate');
    }

    // Step 3: Create initial invite codes
    console.log('\nStep 3: Creating initial invite codes...');

    const existingInvite = await InviteCode.findOne({ code: ADMIN_INVITE_CODE });
    if (!existingInvite) {
      await InviteCode.create({
        code: ADMIN_INVITE_CODE,
        isUsed: true,
        usedBy: adminUser._id,
        createdBy: adminUser._id,
      });
      console.log(`✓ Created initial invite code: ${ADMIN_INVITE_CODE}`);
    } else {
      console.log('Initial invite code already exists');
    }

    // Create additional invite codes for new users
    const unusedInvites = await InviteCode.find({ isUsed: false });
    if (unusedInvites.length === 0) {
      const newInvites = [
        'INVITE_CODE_001',
        'INVITE_CODE_002',
        'INVITE_CODE_003',
      ];

      for (const code of newInvites) {
        await InviteCode.create({
          code,
          isUsed: false,
          createdBy: adminUser._id,
        });
      }
      console.log(`✓ Created ${newInvites.length} new invite codes`);
      console.log('  Codes:', newInvites.join(', '));
    } else {
      console.log(`${unusedInvites.length} unused invite codes already exist`);
    }

    console.log('\n✓ Migration completed successfully!');
    console.log('\nAdmin credentials:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('  (Please change this password after first login)');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

migrate();
