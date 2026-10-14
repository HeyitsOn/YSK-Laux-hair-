import { business } from '../../config/business';
import { buildWhatsAppUrl } from '../../utils/whatsapp';
import { ButtonLink } from '../ui/Button';
import { Icon, type IconName } from '../ui/Icon';
import { Reveal } from '../ui/Reveal';
import './Contact.css';

const channels: { icon: IconName; label: string; value: string; href?: string; external?: boolean }[] = [
  {
    icon: 'whatsapp',
    label: 'WhatsApp',
    value: business.whatsappDisplay,
    href: buildWhatsAppUrl(`Hi ${business.name}!`),
    external: true,
  },
  { icon: 'instagram', label: 'Instagram', value: business.instagramHandle, href: business.instagramUrl, external: true },
  { icon: 'mail', label: 'Email', value: business.email, href: `mailto:${business.email}` },
  { icon: 'pin', label: 'Based in', value: business.location },
];

export function Contact() {
  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <div className="container">
        <Reveal className="contact">
          <div className="contact__cta">
            <p className="eyebrow">Get in touch</p>
            <h2 id="contact-title">
              Let’s find your <em className="gold-text">perfect</em> hair
            </h2>
            <p>
              Not sure which texture, length or lace is right for you? Message us — we’ll guide you personally, from
              choosing your unit to caring for it.
            </p>
            <ButtonLink
              href={buildWhatsAppUrl(`Hi ${business.name}! I'd like some help choosing hair.`)}
              size="lg"
              external
            >
              <Icon name="whatsapp" size={20} />
              Chat on WhatsApp
            </ButtonLink>
          </div>

          <div className="contact__details">
            <ul className="contact__channels">
              {channels.map((c) => {
                const content = (
                  <>
                    <span className="contact__icon">
                      <Icon name={c.icon} size={20} />
                    </span>
                    <span>
                      <span className="contact__label">{c.label}</span>
                      <span className="contact__value">{c.value}</span>
                    </span>
                  </>
                );
                return (
                  <li key={c.label}>
                    {c.href ? (
                      <a
                        href={c.href}
                        className="contact__channel"
                        {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      >
                        {content}
                      </a>
                    ) : (
                      <div className="contact__channel">{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="contact__hours">
              <p className="contact__label">
                <Icon name="clock" size={16} /> Hours
              </p>
              <dl>
                {business.hours.map((h) => (
                  <div key={h.days}>
                    <dt>{h.days}</dt>
                    <dd>{h.time}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
