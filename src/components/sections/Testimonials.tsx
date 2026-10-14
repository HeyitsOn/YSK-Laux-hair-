import { testimonials } from '../../data/content';
import { Icon } from '../ui/Icon';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';
import './Testimonials.css';

export function Testimonials() {
  if (testimonials.length === 0) return null;

  return (
    <section className="section" aria-labelledby="reviews-title">
      <div className="container">
        <SectionHeading
          id="reviews-title"
          eyebrow="Kind Words"
          title={
            <>
              Loved by our <em>clients</em>
            </>
          }
        />
        <ul className="reviews">
          {testimonials.map((t, i) => (
            <Reveal as="li" key={i} className="review" delay={i * 120}>
              <div className="review__stars" aria-hidden="true">
                {Array.from({ length: 5 }, (_, s) => (
                  <Icon key={s} name="star" size={15} fill="currentColor" />
                ))}
              </div>
              <blockquote>
                <p>“{t.quote}”</p>
              </blockquote>
              <div className="review__author">
                <p>{t.author}</p>
                <span>{t.detail}</span>
                {t.isSample && <span className="review__sample">Sample</span>}
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
