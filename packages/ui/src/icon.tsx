import type { CSSProperties } from 'react';
import { ICON_PATHS, type IconName } from './icon-paths';

export type { IconName };

/** A Lucide icon from the prototype's set. Decorative: hidden from screen readers. */
export function Icon({ name, size, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return (
    <svg
      className="ic"
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={size ? { width: size, height: size, ...style } : style}
      dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] }}
    />
  );
}
