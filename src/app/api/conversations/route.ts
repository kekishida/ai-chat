import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/Conversation';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Fetch all conversations, sorted by most recent first
    const conversations = await Conversation.find({})
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      conversations: conversations.map((conv) => ({
        _id: conv._id.toString(),
        title: conv.title,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
