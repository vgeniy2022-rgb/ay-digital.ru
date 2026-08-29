import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function ModernTouchButton({ children, haptics = false, onPointerDown, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; haptics?: boolean }) {
  const fallbackLabel = props.className?.includes('is-accelerate') ? 'Ускорение' : typeof children === 'string' ? children : 'Игровое действие';
  return <button {...props} aria-label={props['aria-label'] || fallbackLabel} className={`nova-touch-button ${props.className || ''}`.trim()} onPointerDown={(event) => { if (haptics && navigator.vibrate) navigator.vibrate(8); onPointerDown?.(event); }}>{children}</button>;
}
