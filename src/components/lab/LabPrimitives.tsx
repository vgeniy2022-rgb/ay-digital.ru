import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Code2, MapPin } from 'lucide-react';
import type { PropsWithChildren, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/lab.css';

type LabHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  backTo?: string;
  actions?: ReactNode;
};

export function LabFrame({ children }: PropsWithChildren) {
  return <div className="lab-page">{children}</div>;
}

export function LabHero({ eyebrow = 'SITEVL LAB', title, description, backTo = '/lab', actions }: LabHeroProps) {
  return (
    <section className="lab-hero">
      <div className="lab-shell">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {backTo ? (
            <Link className="lab-back" to={backTo}>
              <ArrowLeft aria-hidden="true" /> Лаборатория
            </Link>
          ) : null}
          <p className="lab-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="lab-hero__description">{description}</p>
          {actions ? <div className="lab-hero__actions">{actions}</div> : null}
        </motion.div>
        <div className="lab-hero__signal" aria-hidden="true">
          <span className="lab-hero__signal-core"><Code2 /></span>
          <i /><i /><i />
          <strong>SITEVL</strong>
          <small><MapPin /> 43.1155° N / 131.8855° E</small>
        </div>
      </div>
    </section>
  );
}

export function LabSectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="lab-section-heading">
      <p className="lab-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

export function LabLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link className="lab-link" to={to}>
      <span>{children}</span>
      <ArrowRight aria-hidden="true" />
    </Link>
  );
}

export function HowMade({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <aside className="lab-how-made" aria-label="Как это сделано">
      <span><Code2 aria-hidden="true" /> Как это сделано</span>
      <dl>
        {items.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

export function DeveloperBadge({ children }: PropsWithChildren) {
  return <span className="lab-developer-badge">{children}</span>;
}
