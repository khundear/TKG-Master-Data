// Table with pager, filter pills, search and select. Works with links (server) or callbacks (client).
import type { CSSProperties, ReactNode } from 'react';
import { _t } from '@tkg/i18n';
import { UiLink } from './context';
import { EmptyState } from './content';
import { Icon } from './icon';
import { cx, fmt } from './format';

export const PER_PAGE = 50;

export interface Column<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  /** 'mono' for codes, 'r' for right-aligned numbers. */
  className?: string;
  style?: CSSProperties;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  empty,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
}) {
  return (
    <div className="tbl-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={c.className?.includes('r') ? 'r' : undefined}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((r) => (
              <tr
                key={rowKey(r)}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                onKeyDown={onRowClick ? (e) => (e.key === 'Enter' ? onRowClick(r) : undefined) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                style={onRowClick ? undefined : { cursor: 'default' }}
              >
                {columns.map((c) => (
                  <td key={c.key} className={c.className} style={c.style}>
                    {c.render(r)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} style={{ cursor: 'default' }}>
                {empty ?? <EmptyState icon="search" title={_t('ไม่พบรายการ')}>{_t('ลองเปลี่ยนคำค้นหรือล้างตัวกรอง')}</EmptyState>}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/** "แสดง 1–50 จาก 1,192 รายการ" with previous / next. Give `hrefFor` (links) or `onPage` (buttons). */
export function Pager({
  total,
  page,
  perPage = PER_PAGE,
  hrefFor,
  onPage,
}: {
  total: number;
  page: number;
  perPage?: number;
  hrefFor?: (page: number) => string;
  onPage?: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  const a = (page - 1) * perPage + 1;
  const b = Math.min(total, page * perPage);
  const nav = (to: number, label: string, disabled: boolean) =>
    hrefFor && !disabled ? (
      <UiLink className="btn sm" href={hrefFor(to)}>
        {label}
      </UiLink>
    ) : (
      <button className="btn sm" disabled={disabled} onClick={onPage ? () => onPage(to) : undefined}>
        {label}
      </button>
    );
  return (
    <div className="pager">
      <span>
        {total ? _t('แสดง {a}–{b} จาก {total} รายการ', { a: fmt(a), b: fmt(b), total: fmt(total) }) : _t('ไม่พบรายการ')}
      </span>
      <span className="acts">
        {nav(page - 1, _t('ก่อนหน้า'), page <= 1)}
        <span className="num" style={{ alignSelf: 'center', padding: '0 6px' }}>
          {page} / {pages}
        </span>
        {nav(page + 1, _t('ถัดไป'), page >= pages)}
      </span>
    </div>
  );
}

export interface PillOption {
  value: string;
  label: string;
  count?: number;
}

/** Single-choice pills (brand filter etc.). The selected pill is dark. */
export function FilterPills({
  options,
  value,
  onChange,
  hrefFor,
  label,
}: {
  options: PillOption[];
  value: string;
  onChange?: (value: string) => void;
  hrefFor?: (value: string) => string;
  label?: string;
}) {
  return (
    <div className="pills" role="group" aria-label={label}>
      {options.map((o) => {
        const on = o.value === value;
        const inner = (
          <>
            {o.label}
            {o.count != null ? <span className="c">{fmt(o.count)}</span> : null}
          </>
        );
        return hrefFor ? (
          <UiLink key={o.value} className={cx('pill', on && 'on')} href={hrefFor(o.value)} aria-current={on ? 'page' : undefined}>
            {inner}
          </UiLink>
        ) : (
          <button key={o.value} className={cx('pill', on && 'on')} aria-pressed={on} onClick={onChange ? () => onChange(o.value) : undefined}>
            {inner}
          </button>
        );
      })}
    </div>
  );
}

/** Toggle pill (e.g. มีหมู). */
export function TogglePill({ on, onToggle, children, title }: { on: boolean; onToggle: () => void; children: ReactNode; title?: string }) {
  return (
    <button className={cx('pill', on && 'on')} aria-pressed={on} onClick={onToggle} title={title}>
      {children}
    </button>
  );
}

/** Search box. Uncontrolled by default; give `name` to submit it in a GET form. */
export function SearchBox({
  placeholder,
  defaultValue,
  value,
  onChange,
  name = 'q',
  label,
}: {
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (v: string) => void;
  name?: string;
  label: string;
}) {
  return (
    <label className="search">
      <Icon name="search" />
      <span className="sr-only">{label}</span>
      <input
        type="search"
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      />
    </label>
  );
}

export function Select({
  label,
  options,
  value,
  defaultValue,
  onChange,
  name,
}: {
  label: string;
  options: { value: string; label: string }[];
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  name?: string;
}) {
  return (
    <select
      className="sel"
      aria-label={label}
      name={name}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Filter bar above a table. */
export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="tools">{children}</div>;
}
