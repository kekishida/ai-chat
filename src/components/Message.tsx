'use client';

import MarkdownRenderer from './MarkdownRenderer';
import Image from 'next/image';

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
      <div className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Image
            src={isUser ? '/avatars/user.svg' : '/avatars/ponko_40x40.gif'}
            alt={isUser ? 'ユーザー' : 'チエちゃん'}
            width={40}
            height={40}
            className="rounded-full w-10 h-10 md:w-10 md:h-10 sm:w-8 sm:h-8"
          />
        </div>

        {/* Message content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-1">
            <span
              className={`text-sm font-semibold ${
                isUser ? 'text-blue-600' : 'text-green-600'
              }`}
            >
              {isUser ? 'あなた' : 'ぽんこちゃん'}
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
    </div>
  );
}
