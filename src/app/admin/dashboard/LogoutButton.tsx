'use client';

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="rounded-full border border-line px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:border-ink hover:text-ink"
    >
      Salir
    </button>
  );
}
