'use client';

import { useState, useEffect } from 'react';
import Header from './Header';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ConversationList from './ConversationList';

interface Message {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date | string;
}

interface Conversation {
  _id: string;
  title: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages`
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        setCurrentConversationId(conversationId);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      setError('会話の読み込みに失敗しました');
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    setError(null);

    // Add user message to UI
    const userMessage: Message = {
      role: 'user',
      content: message,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: currentConversationId,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.type === 'token') {
                  assistantMessage += data.content;
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];

                    if (lastMessage && lastMessage.role === 'assistant') {
                      lastMessage.content = assistantMessage;
                    } else {
                      newMessages.push({
                        role: 'assistant',
                        content: assistantMessage,
                      });
                    }

                    return newMessages;
                  });
                } else if (data.type === 'done') {
                  setCurrentConversationId(data.conversationId);
                  fetchConversations();
                } else if (data.type === 'error') {
                  throw new Error(data.error);
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('メッセージの送信に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
  };

  const handleClear = () => {
    if (confirm('現在の会話をクリアしてもよろしいですか？')) {
      setMessages([]);
      setCurrentConversationId(null);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchConversations();
        if (currentConversationId === conversationId) {
          handleNewChat();
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      setError('会話の削除に失敗しました');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header
        onNewChat={handleNewChat}
        onToggleHistory={() => setIsHistoryOpen(true)}
        onClear={handleClear}
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4 mt-4 rounded">
          {error}
        </div>
      )}

      <MessageList messages={messages} isLoading={isLoading} />

      <MessageInput onSend={handleSendMessage} disabled={isLoading} />

      <ConversationList
        conversations={conversations}
        onSelect={loadConversation}
        onDelete={handleDeleteConversation}
        onClose={() => setIsHistoryOpen(false)}
        isOpen={isHistoryOpen}
      />
    </div>
  );
}
