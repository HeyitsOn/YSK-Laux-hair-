import { careTips } from '../../data/content';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';
import './HairCare.css';

export function HairCare() {
  return (
    <section id="care" className="section section--alt" aria-labelledby="care-title">
      <div className="container">
        <SectionHeading
          id="care-title"
          eyebrow="Hair Care Ritual"
          title={
            <>
              Keep it <em>luxurious</em>
            </>
          }
          subtitle="A few simple habits keep your hair soft, full and flawless for longer."
        />
        <ul className="care__grid">
          {careTips.map((tip, i) => (
            <Reveal as="li" key={tip.title} className="care__card" delay={i * 100}>
              <span className="care__index">{String(i + 1).padStart(2, '0')}</span>
              <h3>{tip.title}</h3>
              <p>{tip.text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
