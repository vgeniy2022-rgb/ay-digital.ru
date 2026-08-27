import { MessageCircle, Phone, Send } from 'lucide-react';
import { StudioEyebrow, StudioHeading } from './StudioPrimitives';

type WebsiteContactsProps = {
  telegramUrl: string;
  telegramUsername: string;
  whatsappUrl: string;
  phoneUrl: string;
  phone: string;
};

export function WebsiteContacts({ telegramUrl, telegramUsername, whatsappUrl, phoneUrl, phone }: WebsiteContactsProps) {
  const contacts = [
    { label: 'Telegram', value: `@${telegramUsername}`, href: telegramUrl, icon: Send },
    { label: 'WhatsApp', value: phone, href: whatsappUrl, icon: MessageCircle },
    { label: 'Телефон', value: phone, href: phoneUrl, icon: Phone },
  ];

  return (
    <section className="studio-contacts" id="contacts" data-progress="contacts" aria-labelledby="studio-contacts-title">
      <div className="studio-shell studio-contacts__layout">
        <div>
          <StudioHeading
            eyebrow="Контакты"
            title="Обсудим проект"
            description="Можно написать, даже если пока непонятно, какой тип сайта нужен. Сначала разберём задачу, затем определим формат и ориентир стоимости."
          />
          <div className="studio-contacts__facts" data-studio-reveal>
            <span><b>Лично</b> Александр ведёт обсуждение и разработку</span>
            <span><b>Владивосток</b> встреча по договорённости или удалённая работа</span>
            <span><b>Без длинной анкеты</b> достаточно описать бизнес и желаемый результат</span>
          </div>
        </div>

        <div className="studio-contacts__cards" data-studio-reveal>
          <StudioEyebrow>Выберите удобный способ</StudioEyebrow>
          {contacts.map(({ label, value, href, icon: Icon }) => (
            <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined} key={label}>
              <i><Icon aria-hidden="true" /></i>
              <span><small>{label}</small><strong>{value}</strong></span>
              <b aria-hidden="true">↗</b>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
