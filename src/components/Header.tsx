'use client';

import { signOut, useSession } from 'next-auth/react';

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
  const { data: session } = useSession();

  const handleLogout = async () => {
    if (confirm('ログアウトしますか？')) {
      await signOut({ callbackUrl: '/login' });
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-800">Ponko Chat</h1>
          {session?.user && (
            <span className="text-sm text-gray-600">
              {session.user.name}
            </span>
          )}
        </div>
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
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
}
