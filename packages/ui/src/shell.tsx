'use client';
// App shell: 64px top bar, 256px left menu, content on #F9F9F9 (ICW OS; Company Core is the reference).
import { useEffect, useState, type ReactNode } from 'react';
import { LOCALE_COOKIE, _t, getLocale } from '@tkg/i18n';
import { UiLink, useUi } from './context';
import { Icon, type IconName } from './icon';
import { cx, fmt } from './format';

export interface ShellUser {
  name: string;
  role?: string;
  initials: string;
}

export interface TopBarProps {
  /** Module name next to the logo; empty on the launcher. */
  moduleName?: string;
  user?: ShellUser;
  logoSrc?: string;
  homeHref?: string;
  onMenu?: () => void;
}

export function TopBar({ moduleName, user, logoSrc = '/tkg-logo.png', homeHref = '/', onMenu }: TopBarProps) {
  return (
    <header className="top">
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
        {moduleName && onMenu ? (
          <button className="ibtn menu-btn" onClick={onMenu} aria-label={_t('เปิดเมนู')}>
            <Icon name="menu" />
          </button>
        ) : null}
        <UiLink className="brand" href={homeHref} aria-label={_t('กลับหน้าหลัก')}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt={_t('ต้นเครื่อง group')} />
          {moduleName ? (
            <>
              <span className="sep" />
              <span className="mod">{moduleName}</span>
            </>
          ) : null}
        </UiLink>
      </div>
      <div className="tr">
        <LanguageSwitch />
        <button className="ibtn" aria-label={_t('การแจ้งเตือน')}>
          <Icon name="bell" />
        </button>
        <UiLink className="ibtn" href={homeHref} aria-label={_t('แอปทั้งหมด')}>
          <Icon name="grid" />
        </UiLink>
        {user ? (
          <div className="me">
            <span className="av">{user.initials}</span>
            <span className="me-t">
              <b>{user.name}</b>
              {user.role ? <span>{user.role}</span> : null}
            </span>
          </div>
        ) : null}
      </div>
    </header>
  );
}

/** TH / EN switch (ICW convention). Saves the choice in a cookie and reloads, so server pages render in it too. */
export function LanguageSwitch() {
  const locale = getLocale();
  const pick = (next: 'th' | 'en') => {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  };
  return (
    <div className="lang" role="group" aria-label={_t('ภาษา')}>
      <button type="button" className={cx(locale === 'th' && 'on')} aria-pressed={locale === 'th'} onClick={() => pick('th')}>
        TH
      </button>
      <button type="button" className={cx(locale === 'en' && 'on')} aria-pressed={locale === 'en'} onClick={() => pick('en')}>
        EN
      </button>
    </div>
  );
}

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  count?: number | null;
  warn?: boolean;
  /** Highlight for sub-pages too (pathname starts with href). Default: exact match. */
  prefix?: boolean;
}
export interface NavSection {
  heading?: string;
  items: NavItem[];
  /** Pinned to the bottom of the menu (settings). */
  footer?: boolean;
}

export function Sidebar({
  sections,
  label,
  open = true,
  badge,
  onNavigate,
}: {
  sections: NavSection[];
  label: string;
  open?: boolean;
  /** Small pill under the footer section, e.g. a draft-data notice. */
  badge?: string;
  onNavigate?: () => void;
}) {
  const pathname = useUi().usePathname();
  const isOn = (it: NavItem) => pathname === it.href || (!!it.prefix && pathname.startsWith(`${it.href}/`));
  return (
    <nav className="side" aria-label={label} data-open={String(open)}>
      {sections.map((sec, i) => (
        <div key={i} className={sec.footer ? 'side-foot' : 'sec'}>
          {!sec.footer && sec.heading ? <div className="sh">{sec.heading}</div> : null}
          {sec.items.map((it) => {
            const on = isOn(it);
            return (
              <UiLink
                key={it.href}
                className={cx('nav', on && 'on')}
                href={it.href}
                aria-current={on ? 'page' : undefined}
                onClick={onNavigate}
              >
                <Icon name={it.icon} />
                {it.label}
                {it.count != null ? <span className={cx('cnt', it.warn && 'warn')}>{fmt(it.count)}</span> : null}
              </UiLink>
            );
          })}
          {sec.footer && badge ? <span className="proto">{badge}</span> : null}
        </div>
      ))}
    </nav>
  );
}

/** Top bar + left menu + content. The menu collapses behind a button below 860px. */
export function ModuleShell({
  moduleName,
  nav,
  navLabel,
  user,
  badge,
  children,
}: {
  moduleName: string;
  nav: NavSection[];
  navLabel: string;
  user?: ShellUser;
  badge?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = useUi().usePathname();
  useEffect(() => setOpen(false), [pathname]);
  return (
    <>
      <TopBar moduleName={moduleName} user={user} onMenu={() => setOpen((o) => !o)} />
      <div className="shell">
        <Sidebar sections={nav} label={navLabel} open={open} badge={badge} onNavigate={() => setOpen(false)} />
        <main>{children}</main>
      </div>
    </>
  );
}

export function AppFooter({ company }: { company: string }) {
  return (
    <footer className="foot">
      © 2026 <b>{company}</b> · Powered by <b>ICW.OS</b>
    </footer>
  );
}

// ---------------------------------------------------------------- launcher

export interface LauncherTile {
  title: string;
  subtitle: string;
  description: string;
  icon: IconName;
  href?: string;
  isNew?: boolean;
  badge?: ReactNode;
}

export function Tile({ tile }: { tile: LauncherTile }) {
  const inner = (
    <>
      <span className="ti">
        <Icon name={tile.icon} size={22} />
      </span>
      <span style={{ minWidth: 0 }}>
        <b>{tile.title}</b>
        <span className="th">{tile.subtitle}</span>
        <span className="d">{tile.description}</span>
        {tile.badge ? <span style={{ display: 'block', marginTop: 8 }}>{tile.badge}</span> : null}
      </span>
    </>
  );
  return tile.href ? (
    <UiLink className={cx('tile', tile.isNew && 'new')} href={tile.href}>
      {inner}
    </UiLink>
  ) : (
    <div className="tile off">{inner}</div>
  );
}

export function LauncherGroup({ title, tiles }: { title: string; tiles: LauncherTile[] }) {
  return (
    <section className="grp">
      <h2>
        {title}
        <span className="cnt">{_t('{n} แอป', { n: tiles.length })}</span>
      </h2>
      <div className="tiles">
        {tiles.map((t) => (
          <Tile key={t.title} tile={t} />
        ))}
      </div>
    </section>
  );
}
