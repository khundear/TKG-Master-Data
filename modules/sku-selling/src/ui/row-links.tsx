'use client';
// Server-rendered tables and lists whose rows open a filtered page: rows carry data-href (prototype data-go).
// One click handler on the wrapper; Enter on a focused row works too.
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { useNavigate } from './navigate';

export function RowLinks({ children }: { children: ReactNode }) {
  const { go } = useNavigate();
  const follow = (e: MouseEvent | KeyboardEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-href]');
    if (!el || (e.target as HTMLElement).closest('a')) return;
    e.preventDefault();
    go(el.dataset.href!);
  };
  return (
    <div
      onClick={follow}
      onKeyDown={(e) => {
        if (e.key === 'Enter') follow(e);
      }}
    >
      {children}
    </div>
  );
}
