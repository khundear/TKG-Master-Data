// Page content pieces. No hooks: usable from server and client components.
import type { ReactNode } from 'react';
import { _t } from '@tkg/i18n';
import { UiLink } from './context';
import { Icon, type IconName } from './icon';
import { cx } from './format';

export interface Crumb {
  label: string;
  href?: string;
}

export function PageHeader({
  title,
  description,
  crumbs,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  crumbs?: Crumb[];
  actions?: ReactNode;
}) {
  return (
    <div className="ph">
      <div style={{ minWidth: 0 }}>
        {crumbs?.length ? (
          <div className="crumb">
            {crumbs.map((c, i) => (
              <span key={i}>
                {i > 0 ? ' / ' : null}
                {c.href ? <UiLink href={c.href}>{c.label}</UiLink> : c.label}
              </span>
            ))}
          </div>
        ) : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="acts">{actions}</div> : null}
    </div>
  );
}

export function Card({ title, action, children, className }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx('card', className)}>
      {title ? (
        <div className="card-h">
          <h2>{title}</h2>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/** Metric card: label, big number, small line. Optional link and warning tone. */
export function MetricCard({
  label,
  value,
  sub,
  href,
  warn,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  href?: string;
  warn?: boolean;
}) {
  const inner = (
    <>
      <span className="l">
        {label}
        {warn ? <Icon name="warn" /> : null}
      </span>
      <span className="v">{value}</span>
      {sub ? <span className="s">{sub}</span> : null}
    </>
  );
  const cls = cx('card', 'metric', warn && 'warn');
  return href ? (
    <UiLink className={cls} href={href}>
      {inner}
    </UiLink>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export function Metrics({ children }: { children: ReactNode }) {
  return <div className="metrics">{children}</div>;
}

export type ChipTone = 'ok' | 'info' | 'warn' | 'mute' | 'bad';

/** Status chip with a coloured dot. */
export function StatusChip({ tone, children }: { tone: ChipTone; children: ReactNode }) {
  return <span className={cx('chip', tone)}>{children}</span>;
}

export function Tag({ children, isNew }: { children: ReactNode; isNew?: boolean }) {
  return <span className={cx('tag', isNew && 'new')}>{children}</span>;
}

export function Note({ children, tone = 'warn', icon }: { children: ReactNode; tone?: 'warn' | 'info'; icon?: IconName }) {
  return (
    <div className={cx('note', tone === 'info' && 'info')}>
      <Icon name={icon ?? (tone === 'info' ? 'info' : 'warn')} />
      <span>{children}</span>
    </div>
  );
}

export function EmptyState({ icon = 'inbox', title, children }: { icon?: IconName; title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <span className="ei">
        <Icon name={icon} />
      </span>
      <b>{title}</b>
      {children ? <p>{children}</p> : null}
    </div>
  );
}

export const BRAND_ORDER = ['TK', 'HK', 'NT', 'OK'] as const;

/**
 * Brand badges. With `showAll`, brands not in the list are drawn dashed: "not specified", never "not allowed".
 */
export function BrandCodes({ brands, showAll, names }: { brands: string[]; showAll?: boolean; names?: Record<string, string> }) {
  const shown = BRAND_ORDER.filter((c) => brands.includes(c) || showAll);
  if (!shown.length) return <span className="t2" style={{ margin: 0 }}>{_t('ยังไม่ระบุ')}</span>;
  return (
    <>
      {shown.map((c) =>
        brands.includes(c) ? (
          <span key={c} className="bc" title={names?.[c]}>
            {c}
          </span>
        ) : (
          <span key={c} className="bc dim" title={_t('ยังไม่ระบุ')}>
            {c}
          </span>
        ),
      )}
    </>
  );
}

/** Horizontal bar, value 0–100. */
export function Bar({ pct, warn }: { pct: number; warn?: boolean }) {
  return (
    <span className={cx('bar', warn && 'w')}>
      <span style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </span>
  );
}

export function Button({
  children,
  href,
  primary,
  small,
  icon,
  ...rest
}: {
  children: ReactNode;
  href?: string;
  primary?: boolean;
  small?: boolean;
  icon?: IconName;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
}) {
  const cls = cx('btn', primary && 'pri', small && 'sm');
  const inner = (
    <>
      {icon ? <Icon name={icon} /> : null}
      {children}
    </>
  );
  return href ? (
    <UiLink className={cls} href={href}>
      {inner}
    </UiLink>
  ) : (
    <button className={cls} type={rest.type ?? 'button'} disabled={rest.disabled} onClick={rest.onClick}>
      {inner}
    </button>
  );
}
