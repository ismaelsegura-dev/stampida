'use client';

import { useState } from 'react';

export default function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-3 flex items-center gap-2">
      <p className="min-w-0 flex-1 truncate rounded-lg bg-stone-100 px-3 py-2 text-xs text-stone-500">
        {url}
      </p>
      <button
        onClick={copy}
        className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
          copied ? 'bg-green-600 text-white' : 'bg-ink text-white hover:bg-stone-800'
        }`}
      >
        {copied ? '¡Copiado!' : 'Copiar'}
      </button>
    </div>
  );
}
