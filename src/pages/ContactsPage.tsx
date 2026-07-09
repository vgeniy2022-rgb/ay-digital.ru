import { MessageCircle, Phone, Send } from 'lucide-react';
import { ButtonLink } from '../components/ButtonLink';
import { ContactForm } from '../components/ContactForm';
import { Container } from '../components/Container';
import { PageHero } from '../components/PageHero';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { SpecialistStatus } from '../components/SpecialistStatus';
import { pageMeta } from '../data/pageMeta';
import { useSiteData } from '../hooks/useSiteData';

export function ContactsPage() {
  const { data } = useSiteData();
  const { contacts, site } = data;

  return (
    <PageTransition>
      <PageHero {...pageMeta.contacts} />
      <section className="pb-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <Reveal>
              <div className="grid gap-5">
                <SpecialistStatus compact />
                <div className="rounded-premium border border-line bg-white/84 p-7 shadow-soft sm:p-8">
                  <h2 className="text-2xl font-extrabold">Контакты</h2>
                  <div className="mt-6 grid gap-4">
                    {contacts.map((contact) => (
                      <a
                        className="flex gap-4 rounded-3xl bg-slate-50 p-4 transition hover:bg-blue-50"
                        href={contact.href}
                        key={`${contact.label}-${contact.value}`}
                      >
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-accent shadow-glass">
                          <Phone className="h-5 w-5" />
                        </span>
                        <span>
                          <span className="block text-xs font-bold uppercase tracking-[0.14em] text-muted">
                            {contact.label}
                          </span>
                          <span className="mt-1 block text-lg font-extrabold text-ink">{contact.value}</span>
                        </span>
                      </a>
                    ))}
                  </div>
                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    <ButtonLink href={site.telegramUrl} showArrow={false}>
                      <MessageCircle className="h-4 w-4" />
                      Telegram
                    </ButtonLink>
                    <ButtonLink href={site.whatsappUrl} variant="secondary" showArrow={false}>
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp основной
                    </ButtonLink>
                    <ButtonLink href={site.whatsappSecondaryUrl} variant="secondary" showArrow={false}>
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp дополнительный
                    </ButtonLink>
                    <ButtonLink href={site.smsUrl} variant="secondary" showArrow={false}>
                      <Send className="h-4 w-4" />
                      SMS
                    </ButtonLink>
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <ContactForm />
            </Reveal>
          </div>
        </Container>
      </section>
    </PageTransition>
  );
}
