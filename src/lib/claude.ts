import Anthropic from '@anthropic-ai/sdk';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Lazy initialization of Anthropic client
let anthropic: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!ANTHROPIC_API_KEY) {
    throw new Error(
      'Please define the ANTHROPIC_API_KEY environment variable inside .env.local'
    );
  }

  if (!anthropic) {
    anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    });
  }

  return anthropic;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamChunk {
  type: 'token' | 'done' | 'error';
  content?: string;
  error?: string;
}

/**
 * Get a streaming response from Claude API
 * @param messages - Array of chat messages (conversation history)
 * @param onToken - Callback function for each token received
 * @returns Complete assistant response
 */
export async function getChatCompletionStream(
  messages: ChatMessage[],
  onToken?: (token: string) => void
): Promise<string> {
  try {
    const client = getAnthropicClient();
    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: messages,
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        const token = chunk.delta.text;
        fullResponse += token;

        if (onToken) {
          onToken(token);
        }
      }
    }

    return fullResponse;
  } catch (error) {
    console.error('Claude API Error:', error);
    throw error;
  }
}

/**
 * Get a non-streaming response from Claude API
 * @param messages - Array of chat messages (conversation history)
 * @returns Complete assistant response
 */
export async function getChatCompletion(
  messages: ChatMessage[]
): Promise<string> {
  try {
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: messages,
    });

    const textContent = response.content.find((block) => block.type === 'text');
    if (textContent && textContent.type === 'text') {
      return textContent.text;
    }

    return '';
  } catch (error) {
    console.error('Claude API Error:', error);
    throw error;
  }
}

/**
 * Format conversation history for Claude API
 * @param history - Array of messages with role and content
 * @returns Formatted messages for Claude API
 */
export function formatMessagesForClaude(
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): ChatMessage[] {
  return history.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
}

export default getAnthropicClient;
