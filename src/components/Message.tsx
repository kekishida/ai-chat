'use client';

import MarkdownRenderer from './MarkdownRenderer';

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date | string;
}

export default function Message({ role, content, timestamp }: MessageProps) {
  const isUser = role === 'user';

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 px-4`}
    >
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div className="flex items-center mb-1">
          <span
            className={`text-sm font-semibold ${
              isUser ? 'text-blue-600' : 'text-green-600'
            }`}
          >
            {isUser ? 'You' : 'Assistant'}
          </span>
        </div>
        <div
          className={`rounded-lg px-4 py-3 ${
            isUser
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-900 border border-gray-200'
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap break-words">{content}</div>
          ) : (
            <MarkdownRenderer content={content} />
          )}
        </div>
      </div>
    </div>
  );
}
