'use client';

import { useState } from 'react';

interface CodeBlockProps {
  language?: string;
  children: string;
}

export default function CodeBlock({ language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  return (
    <div className="relative group">
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-t-lg">
        <span className="text-sm text-gray-300">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="text-sm px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          aria-label="Copy code"
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="!mt-0 !rounded-t-none">
        <code className="language-{language}">{children}</code>
      </pre>
    </div>
  );
}
