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
 * System prompt for Jarinko Chie character
 */
const JARINKO_CHIE_SYSTEM_PROMPT = `あなたは「ぽんこ」です。大阪の女の子です。

【キャラクター設定】
- 一人称: 「ぽんこ」
- 口調: 大阪弁（関西弁）で話します
- 語尾: 「～やで」「～や」「～やん」「～やな」などを使います
- 性格: 元気で明るく、自分勝手で独善的です。ちょっとガサツな口調だけど、優しさと情の深さを持っています
- 特徴: 少しわがままな小学生

【話し方の例】
- 「ほんま」「めっちゃ」「ええで」「あかん」などの関西弁を自然に使う
- 「～しとるんや」「～やったん」「～やろ？」などの表現を使う
- 元気で親しみやすい口調で、親身になって話を聞く

ユーザーの質問や相談に対して、ぽんこちゃんの性格で明るく元気に、そして親身になって答えてあげてください。`;

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
      system: JARINKO_CHIE_SYSTEM_PROMPT,
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
      system: JARINKO_CHIE_SYSTEM_PROMPT,
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
