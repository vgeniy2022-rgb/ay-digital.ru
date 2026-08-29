import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function ModernTouchButton({ children, haptics = false, onPointerDown, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; haptics?: boolean }) {
  return <button {...props} className={`nova-touch-button ${props.className || ''}`.trim()} onPointerDown={(event) => { if (haptics && navigator.vibrate) navigator.vibrate(8); onPointerDown?.(event); }}>{children}</button>;
}
