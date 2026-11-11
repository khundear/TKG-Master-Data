'use client';
// A table row that opens a link (prototype rows with data-go). The first cell should also hold a real link.
import type { ReactNode } from 'react';
import { useNavigate } from '../navigate';

export function LinkRow({ href, children }: { href: string; children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <tr
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest('a')) navigate(href);
      }}
    >
      {children}
    </tr>
  );
}
