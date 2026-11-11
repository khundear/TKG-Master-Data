'use client';
// Right-hand detail drawer with scrim. Closes on Escape or scrim click; focus moves into it when it opens.
import { useEffect, useRef, type ReactNode } from 'react';
import { _t } from '@tkg/i18n';
import { Icon } from './icon';

export function Drawer({
  open,
  onClose,
  code,
  title,
  subtitle,
  chips,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  /** Small mono code above the title (Material ID, Master Record Key). */
  code?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  chips?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="dr-t" tabIndex={-1} ref={ref}>
        <div className="dr-h">
          <div style={{ minWidth: 0 }}>
            {code ? <span className="mono">{code}</span> : null}
            <h2 id="dr-t">{title}</h2>
            {subtitle ? <div style={{ color: 'var(--ink-2)', marginTop: 2 }}>{subtitle}</div> : null}
            {chips ? <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>{chips}</div> : null}
          </div>
          <button className="ibtn" onClick={onClose} aria-label={_t('ปิด')}>
            <Icon name="x" />
          </button>
        </div>
        <div className="dr-b">{children}</div>
        {footer ? <div className="dr-f">{footer}</div> : null}
      </aside>
    </>
  );
}

export function DrawerSection({ title, children, last }: { title: string; children: ReactNode; last?: boolean }) {
  return (
    <div className="dr-s" style={last ? { border: 0 } : undefined}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

/** Label / value list. Empty values show a grey dash. */
export function KeyValues({ items }: { items: [label: string, value: ReactNode][] }) {
  return (
    <dl className="kv">
      {items.map(([k, v]) => (
        <div key={k} style={{ display: 'contents' }}>
          <dt>{k}</dt>
          <dd>{v == null || v === '' ? <span style={{ color: 'var(--ink-4)' }}>—</span> : v}</dd>
        </div>
      ))}
    </dl>
  );
}
