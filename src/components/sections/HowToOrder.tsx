import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';
import './HowToOrder.css';

const steps = [
  { title: 'Browse & choose', text: 'Explore the collection and pick your texture and length.' },
  { title: 'Build your bag', text: 'Add pieces to your bag and adjust quantities as you go.' },
  { title: 'Send on WhatsApp', text: 'Tap “Order on WhatsApp” — your full order is written for you.' },
  { title: 'Confirm & receive', text: 'We confirm stock, delivery and payment details personally.' },
];

export function HowToOrder() {
  return (
    <section id="how-to-order" className="section" aria-labelledby="order-title">
      <div className="container">
        <SectionHeading
          id="order-title"
          eyebrow="How to Order"
          title={
            <>
              Effortless, <em>personal</em> ordering
            </>
          }
          subtitle="No accounts, no checkout forms. Just your bag and a conversation with us."
        />
        <ol className="steps">
          {steps.map((step, i) => (
            <Reveal as="li" key={step.title} className="steps__item" delay={i * 120}>
              <span className="steps__num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
