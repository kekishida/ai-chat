import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import InviteCode from '@/models/InviteCode';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    await connectDB();

    const invite = await InviteCode.findOne({
      code,
      isUsed: false,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } },
      ],
    });

    return NextResponse.json({ valid: !!invite });
  } catch (error) {
    console.error('Invite validation error:', error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
