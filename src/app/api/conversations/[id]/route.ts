import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import { isValidObjectId } from '@/lib/utils';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid conversation ID format' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Fetch conversation
    const conversation = await Conversation.findById(id).lean();

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      conversation: {
        _id: conversation._id.toString(),
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid conversation ID format' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Delete conversation
    const deletedConversation = await Conversation.findByIdAndDelete(id);

    if (!deletedConversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Delete all messages in this conversation
    await Message.deleteMany({ conversationId: id });

    return NextResponse.json({
      success: true,
      message: 'Conversation and associated messages deleted successfully',
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
