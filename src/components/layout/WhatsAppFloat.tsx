import { business } from '../../config/business';
import { buildWhatsAppUrl } from '../../utils/whatsapp';
import { Icon } from '../ui/Icon';
import './WhatsAppFloat.css';

export function WhatsAppFloat() {
  return (
    <a
      className="wa-float"
      href={buildWhatsAppUrl(`Hi ${business.name}! I have a question.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
    >
      <Icon name="whatsapp" size={26} />
    </a>
  );
}
