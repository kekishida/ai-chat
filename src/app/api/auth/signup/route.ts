import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import InviteCode from '@/models/InviteCode';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, email, inviteCode } = body;

    // Validation
    if (!username || !password || !inviteCode) {
      return NextResponse.json(
        { error: 'Username, password, and invite code required' },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { error: 'Username must be 3-30 characters' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if username exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }

    // Validate invite code
    const invite = await InviteCode.findOne({
      code: inviteCode,
      isUsed: false,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } },
      ],
    });

    if (!invite) {
      return NextResponse.json(
        { error: 'Invalid or expired invite code' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      username,
      email,
      passwordHash,
      inviteCodeUsed: inviteCode,
    });

    // Mark invite code as used
    invite.isUsed = true;
    invite.usedBy = user._id;
    await invite.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        userId: user._id.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
