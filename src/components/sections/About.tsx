import { business } from '../../config/business';
import { Icon, type IconName } from '../ui/Icon';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';
import './About.css';

const pillars: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'sparkle',
    title: 'Hand-selected hair',
    text: 'Every bundle and unit is checked for softness, density and minimal shedding before it reaches you.',
  },
  {
    icon: 'shield',
    title: 'Made to last',
    text: 'Raw and virgin hair that can be coloured, curled and restyled — with the right care, for a year and more.',
  },
  {
    icon: 'heart',
    title: 'Personal service',
    text: 'Real people on WhatsApp to help you choose the right texture, length and lace for your look.',
  },
];

export function About() {
  return (
    <section id="about" className="section section--alt" aria-labelledby="about-title">
      <div className="container about">
        <div className="about__story">
          <SectionHeading
            id="about-title"
            align="left"
            eyebrow="Our Story"
            title={
              <>
                Confidence, <em>beautifully</em> crowned
              </>
            }
          />
          {/* PLACEHOLDER — replace with the founder's real story. */}
          <Reveal>
            <p className="about__lead">
              {business.name} was born from a simple belief: every woman deserves hair that feels as luxurious as it
              looks.
            </p>
            <p className="about__text">
              We source premium human hair and curate every piece with care — so whether it's your first wig or your
              fiftieth install, you can wear it with complete confidence. From sleek bone-straight to soft body waves,
              our collection is designed to elevate your everyday and your most special moments.
            </p>
            <p className="about__signature">— Founder, {business.name}</p>
          </Reveal>
        </div>

        <ul className="about__pillars">
          {pillars.map((p, i) => (
            <Reveal as="li" key={p.title} className="about__pillar" delay={i * 120}>
              <span className="about__icon">
                <Icon name={p.icon} size={22} />
              </span>
              <div>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
