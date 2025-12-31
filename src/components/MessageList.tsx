'use client';

import { useEffect, useRef } from 'react';
import Message from './Message';

interface MessageData {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date | string;
}

interface MessageListProps {
  messages: MessageData[];
  isLoading?: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto py-4">
      {messages.length === 0 && !isLoading && (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">AI Chatへようこそ！</p>
            <p className="text-sm">メッセージを入力して会話を始めましょう</p>
          </div>
        </div>
      )}

      {messages.map((msg, index) => (
        <Message
          key={msg._id || index}
          role={msg.role}
          content={msg.content}
          timestamp={msg.createdAt}
        />
      ))}

      {isLoading && (
        <div className="flex justify-start mb-4 px-4">
          <div className="bg-gray-100 rounded-lg px-4 py-3 border border-gray-200">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
