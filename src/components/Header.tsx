'use client';

interface HeaderProps {
  onNewChat: () => void;
  onToggleHistory: () => void;
  onClear: () => void;
}

export default function Header({
  onNewChat,
  onToggleHistory,
  onClear,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">AI Chat</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={onNewChat}
            className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            新規会話
          </button>
          <button
            onClick={onToggleHistory}
            className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            履歴
          </button>
          <button
            onClick={onClear}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            クリア
          </button>
        </div>
      </div>
    </header>
  );
}
