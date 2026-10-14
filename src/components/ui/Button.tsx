import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

type Variant = 'gold' | 'outline' | 'ghost';
type Size = 'md' | 'lg' | 'sm';

interface BaseProps {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  children: ReactNode;
}

const classes = ({ variant = 'gold', size = 'md', block }: Omit<BaseProps, 'children'>, extra?: string) =>
  ['btn', `btn--${variant}`, `btn--${size}`, block && 'btn--block', extra].filter(Boolean).join(' ');

export function Button({
  variant,
  size,
  block,
  className,
  children,
  type = 'button',
  ...rest
}: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={classes({ variant, size, block }, className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  block,
  className,
  children,
  external,
  ...rest
}: BaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { external?: boolean }) {
  const externalProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <a className={classes({ variant, size, block }, className)} {...externalProps} {...rest}>
      {children}
    </a>
  );
}
