'use client';

import { useState } from 'react';

interface InviteButtonProps {
  inviteUrl: string;
  shareText: string;
}

export default function InviteButton({ inviteUrl, shareText }: InviteButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleInvite = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ text: shareText });
        return;
      } catch {
        // cancelado o no soportado: caer al portapapeles
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt('Copia tu enlace de invitación:', inviteUrl);
    }
  };

  return (
    <button
      onClick={handleInvite}
      className="w-full rounded-full bg-gray-900 py-3 font-semibold text-white transition hover:bg-gray-800 active:scale-[0.99]"
    >
      {copied ? '¡Enlace copiado!' : 'Invitar amigos'}
    </button>
  );
}
