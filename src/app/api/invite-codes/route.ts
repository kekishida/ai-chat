import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import InviteCode from '@/models/InviteCode';
import { getCurrentUser } from '@/lib/auth-utils';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { expiresInDays } = await request.json();

    await connectDB();

    // Generate random invite code
    const code = crypto.randomBytes(16).toString('hex');

    const inviteData: any = {
      code,
      createdBy: user.id,
      isUsed: false,
    };

    if (expiresInDays) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
      inviteData.expiresAt = expiresAt;
    }

    const inviteCode = await InviteCode.create(inviteData);

    return NextResponse.json({
      code: inviteCode.code,
      expiresAt: inviteCode.expiresAt,
    });
  } catch (error) {
    console.error('Create invite code error:', error);
    return NextResponse.json(
      { error: 'Failed to create invite code' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const inviteCodes = await InviteCode.find({ createdBy: user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ inviteCodes });
  } catch (error) {
    console.error('Get invite codes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invite codes' },
      { status: 500 }
    );
  }
}
