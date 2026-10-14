import { useState } from 'react';
import { faqs } from '../../data/content';
import { Icon } from '../ui/Icon';
import { SectionHeading } from '../ui/SectionHeading';
import './Faq.css';

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="section section--alt" aria-labelledby="faq-title">
      <div className="container faq">
        <SectionHeading
          id="faq-title"
          eyebrow="FAQ"
          title={
            <>
              Questions, <em>answered</em>
            </>
          }
        />
        <div className="faq__list">
          {faqs.map((item, i) => {
            const open = openIndex === i;
            return (
              <div key={item.q} className={`faq__item ${open ? 'is-open' : ''}`}>
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={open}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpenIndex(open ? null : i)}
                  >
                    {item.q}
                    <span className="faq__icon">
                      <Icon name="plus" size={18} />
                    </span>
                  </button>
                </h3>
                <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="faq__answer" hidden={!open}>
                  <p>{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
