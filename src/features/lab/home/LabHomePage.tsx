import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Check, Dices, FlaskConical, RotateCcw } from 'lucide-react';
import { useMemo, useState, type PointerEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { labAchievements, labExperiments } from '../core/catalog';
import { LabShell } from '../core/LabShell';
import { resetLabProgress } from '../core/storage';
import { useLabState } from '../core/useLabState';
import type { LabExperiment } from '../core/types';
import './labHome.css';

function LabPreview({ experiment }: { experiment: LabExperiment }) {
  if (experiment.id === 'builder') return <div className="lab-preview-builder"><i /><div><span /><span /><span /></div><b /></div>;
  if (experiment.id === 'game2d') return <div className="lab-preview-game"><div className="lab-preview-game__hero" /><span /><span /><span /><b>CORE</b></div>;
  if (experiment.id === 'game3d') return <div className="lab-preview-room"><i /><span /><span /><span /><b /></div>;
  if (experiment.id === 'physics') return <div className="lab-preview-physics"><i /><i /><i /><span /></div>;
  if (experiment.id === 'os') return <div className="lab-preview-os"><div><span>FILES</span><span>TERMINAL</span></div><i /><b /><small /></div>;
  if (experiment.id === 'retro') return <div className="lab-preview-retro"><div>FILE&nbsp;&nbsp;EDIT&nbsp;&nbsp;VIEW</div><span>README.TXT</span><i>_</i></div>;
  return <div className="lab-preview-canvas"><span /><span /><span /><i /><b /></div>;
}

function ExperimentModule({ experiment, explored, index }: { experiment: LabExperiment; explored: boolean; index: number }) {
  const reducedMotion = useReducedMotion();
  const [pointer, setPointer] = useState({ x: 50, y: 50 });
  const move = (event: PointerEvent<HTMLElement>) => {
    if (reducedMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setPointer({ x: ((event.clientX - bounds.left) / bounds.width) * 100, y: ((event.clientY - bounds.top) / bounds.height) * 100 });
  };
  return (
    <motion.article
      className={`lab-module lab-module--${experiment.id} ${explored ? 'is-explored' : ''}`}
      style={{ '--module-accent': experiment.accent, '--pointer-x': `${pointer.x}%`, '--pointer-y': `${pointer.y}%` } as React.CSSProperties}
      onPointerMove={move}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: .2 }}
      transition={{ duration: reducedMotion ? 0 : .45, delay: index * .035 }}
    >
      <div className="lab-module__top"><span>{experiment.number}</span><div><i />{experiment.status}</div>{explored ? <small><Check />EXPLORED</small> : null}</div>
      <div className="lab-module__preview"><LabPreview experiment={experiment} /></div>
      <div className="lab-module__copy"><h2>{experiment.title}</h2><p>{experiment.description}</p><div>{experiment.technologies.map((technology) => <span key={technology}>{technology}</span>)}</div></div>
      <Link to={experiment.href}>ENTER <ArrowUpRight /></Link>
    </motion.article>
  );
}

export function LabHomePage() {
  const navigate = useNavigate();
  const { state, exploredCount } = useLabState();
  const [resetNotice, setResetNotice] = useState(false);
  const unlocked = useMemo(() => labAchievements.filter((achievement) => state.achievements[achievement.id]), [state.achievements]);
  const surprise = () => navigate(labExperiments[Math.floor(Math.random() * labExperiments.length)].href);
  const reset = () => {
    if (!window.confirm('Сбросить прогресс и достижения SITEVL LAB?')) return;
    resetLabProgress();
    setResetNotice(true);
    window.setTimeout(() => setResetNotice(false), 2200);
  };
  return (
    <LabShell title="Experimental Web Environment" description="SITEVL LAB: интерактивные эксперименты с интерфейсами, играми, физикой, 3D и браузерными технологиями." canonicalPath="/lab" backTo="/" backLabel="SITEVL">
      <section className="lab-home-hero">
        <div className="lab-home-hero__label"><FlaskConical /><span>SITEVL LAB</span><i /></div>
        <h1>EXPERIMENTAL<br />WEB ENVIRONMENT</h1>
        <p>Interactive experiments with physics, games, interfaces and browser technologies.</p>
        <div className="lab-home-hero__actions"><button type="button" onClick={surprise}><Dices />SURPRISE ME</button><span>NO LOGIN · LOCAL PROGRESS · SEVEN SYSTEMS</span></div>
        <div className="lab-home-signal" aria-hidden="true"><span /><span /><span /><span /><i /></div>
      </section>

      <section className="lab-progress-panel" aria-label="Прогресс LAB">
        <div><small>LAB EXPERIMENTS</small><strong>{exploredCount}/{labExperiments.length} EXPLORED</strong></div>
        <div className="lab-progress-track"><i style={{ width: `${(exploredCount / labExperiments.length) * 100}%` }} /></div>
        <div><small>ACHIEVEMENTS</small><strong>{unlocked.length}/{labAchievements.length}</strong></div>
        <button type="button" onClick={reset} aria-label="Сбросить прогресс"><RotateCcw /></button>
      </section>

      <section className="lab-modules" aria-label="Эксперименты SITEVL LAB">
        {labExperiments.map((experiment, index) => <ExperimentModule key={experiment.id} experiment={experiment} explored={state.explored.includes(experiment.id)} index={index} />)}
      </section>

      <section className="lab-achievements-panel">
        <div><small>LOCAL ACHIEVEMENT SYSTEM</small><h2>Signals collected in this browser</h2></div>
        <div>{labAchievements.map((achievement) => <article className={state.achievements[achievement.id] ? 'is-unlocked' : ''} key={achievement.id}><i>{state.achievements[achievement.id] ? <Check /> : null}</i><span><strong>{achievement.title}</strong><small>{achievement.description}</small></span></article>)}</div>
      </section>
      {resetNotice ? <div className="lab-toast" role="status">LAB progress reset.</div> : null}
    </LabShell>
  );
}
