import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, FlaskConical, Volume2, VolumeX } from 'lucide-react';
import type { PropsWithChildren, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { SeoHead } from '../../../components/SeoHead';
import { labExperiments } from './catalog';
import { labRu } from '../i18n/ru';
import type { LabExperimentId } from './types';
import { useLabState } from './useLabState';
import '../styles/labCore.css';

type LabShellProps = PropsWithChildren<{
  experimentId?: LabExperimentId;
  title: string;
  description: string;
  canonicalPath: string;
  status?: string;
  actions?: ReactNode;
  className?: string;
  immersive?: boolean;
  backTo?: string;
  backLabel?: string;
}>;

export function LabShell({ experimentId, title, description, canonicalPath, status, actions, className = '', immersive = false, backTo = '/lab', backLabel = 'LAB', children }: LabShellProps) {
  const { state, exploredCount, toggleSound } = useLabState(experimentId);
  return (
    <div className={`lab-system ${immersive ? 'lab-system--immersive' : ''} ${className}`.trim()}>
      <SeoHead title={`${title} — SITEVL LAB`} description={description} canonicalPath={canonicalPath} noindex />
      <header className="lab-system-bar">
        <Link className="lab-system-back" to={backTo} aria-label={backTo === '/lab' ? labRu.backToLab : labRu.backToSite}><ArrowLeft /><span>{backLabel}</span></Link>
        <div className="lab-system-identity"><FlaskConical /><strong>{labRu.brand}</strong><small>{status || labRu.environment}</small></div>
        <div className="lab-system-meta"><span>{labRu.explored} {exploredCount}/{labExperiments.length}</span>{actions}<button type="button" onClick={toggleSound} aria-label={state.soundEnabled ? labRu.soundOn : labRu.soundOff}>{state.soundEnabled ? <Volume2 /> : <VolumeX />}</button></div>
      </header>
      <AnimatePresence mode="wait">
        <motion.main key={canonicalPath} className="lab-system-main" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .3 }}>{children}</motion.main>
      </AnimatePresence>
    </div>
  );
}

export function LabExperimentIntro({ number, eyebrow, title, description, controls }: { number: string; eyebrow: string; title: string; description: string; controls?: ReactNode }) {
  return <section className="lab-experiment-intro"><div className="lab-experiment-number">{number}</div><div><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{controls ? <aside>{controls}</aside> : null}</section>;
}
