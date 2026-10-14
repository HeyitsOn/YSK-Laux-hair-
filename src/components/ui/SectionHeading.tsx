import type { ReactNode } from 'react';
import { Reveal } from './Reveal';
import './SectionHeading.css';

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'center' | 'left';
  id?: string;
}

export function SectionHeading({ eyebrow, title, subtitle, align = 'center', id }: SectionHeadingProps) {
  return (
    <Reveal className={`section-heading section-heading--${align}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="section-heading__title">
        {title}
      </h2>
      <span className="section-heading__rule" aria-hidden="true" />
      {subtitle && <p className="section-heading__subtitle">{subtitle}</p>}
    </Reveal>
  );
}
