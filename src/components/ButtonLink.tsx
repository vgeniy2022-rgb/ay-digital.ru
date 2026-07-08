import { ArrowRight } from 'lucide-react';
import { AnchorHTMLAttributes, PropsWithChildren } from 'react';
import { Link, LinkProps } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'ghost';

const classes: Record<Variant, string> = {
  primary: 'bg-ink text-white shadow-soft hover:-translate-y-0.5 hover:bg-graphite',
  secondary: 'border border-line bg-white/78 text-ink shadow-glass hover:-translate-y-0.5 hover:border-slate-300',
  ghost: 'text-ink hover:bg-slate-100',
};

type ButtonLinkProps = PropsWithChildren<
  {
    variant?: Variant;
    showArrow?: boolean;
  } & (LinkProps | AnchorHTMLAttributes<HTMLAnchorElement>)
>;

export function ButtonLink({ children, variant = 'primary', showArrow = true, ...props }: ButtonLinkProps) {
  const className = `inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition duration-300 ${classes[variant]} ${
    'className' in props && props.className ? props.className : ''
  }`;

  if ('to' in props) {
    return (
      <Link {...props} className={className}>
        {children}
        {showArrow && <ArrowRight className="h-4 w-4" />}
      </Link>
    );
  }

  return (
    <a {...props} className={className}>
      {children}
      {showArrow && <ArrowRight className="h-4 w-4" />}
    </a>
  );
}
