import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import { getChatCompletionStream } from '@/lib/claude';
import { generateConversationTitle } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { conversationId, message } = body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    let currentConversationId = conversationId;
    let isNewConversation = false;

    // Create new conversation if conversationId is not provided
    if (!currentConversationId) {
      const title = generateConversationTitle(message);
      const newConversation = await Conversation.create({ title });
      currentConversationId = newConversation._id.toString();
      isNewConversation = true;
    }

    // Save user message
    const userMessage = await Message.create({
      conversationId: currentConversationId,
      role: 'user',
      content: message,
    });

    // Fetch conversation history
    const messages = await Message.find({
      conversationId: currentConversationId,
    })
      .sort({ createdAt: 1 })
      .lean();

    // Format messages for Claude API
    const chatHistory = messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // Create a ReadableStream for Server-Sent Events
    const encoder = new TextEncoder();
    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream response from Claude API
          await getChatCompletionStream(chatHistory, (token) => {
            fullResponse += token;
            const data = JSON.stringify({ type: 'token', content: token });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          });

          // Save assistant message
          const assistantMessage = await Message.create({
            conversationId: currentConversationId,
            role: 'assistant',
            content: fullResponse,
          });

          // Update conversation timestamp
          await Conversation.findByIdAndUpdate(currentConversationId, {
            updatedAt: new Date(),
          });

          // Send completion event
          const doneData = JSON.stringify({
            type: 'done',
            conversationId: currentConversationId,
            messageId: assistantMessage._id.toString(),
          });
          controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorData = JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    // Return streaming response
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
