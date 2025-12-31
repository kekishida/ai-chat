'use client';

import { formatRelativeTime } from '@/lib/utils';

interface Conversation {
  _id: string;
  title: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface ConversationListProps {
  conversations: Conversation[];
  onSelect: (conversationId: string) => void;
  onDelete: (conversationId: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function ConversationList({
  conversations,
  onSelect,
  onDelete,
  onClose,
  isOpen,
}: ConversationListProps) {
  if (!isOpen) return null;

  const handleDelete = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (confirm('この会話を削除してもよろしいですか？')) {
      onDelete(conversationId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-800">会話履歴</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {conversations.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              会話履歴がありません
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <div
                  key={conv._id}
                  onClick={() => {
                    onSelect(conv._id);
                    onClose();
                  }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {conv.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatRelativeTime(conv.updatedAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, conv._id)}
                    className="ml-4 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
