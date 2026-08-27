import { ArrowRight } from 'lucide-react';
import type { AnchorHTMLAttributes, PropsWithChildren } from 'react';

type StudioButtonProps = PropsWithChildren<
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    tone?: 'primary' | 'secondary';
  }
>;

export function StudioButton({ children, className = '', tone = 'primary', ...props }: StudioButtonProps) {
  return (
    <a
      {...props}
      className={`studio-button studio-button--${tone} ${className}`}
    >
      <span>{children}</span>
      <ArrowRight aria-hidden="true" className="h-4 w-4" />
    </a>
  );
}

export function StudioEyebrow({ children }: PropsWithChildren) {
  return <p className="studio-eyebrow">{children}</p>;
}

type StudioHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  titleId?: string;
};

export function StudioHeading({ eyebrow, title, description, align = 'left', titleId }: StudioHeadingProps) {
  return (
    <div className={`studio-heading studio-heading--${align}`} data-studio-reveal>
      <StudioEyebrow>{eyebrow}</StudioEyebrow>
      <h2 id={titleId}>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

export function StudioTag({ children }: PropsWithChildren) {
  return <span className="studio-tag">{children}</span>;
}
