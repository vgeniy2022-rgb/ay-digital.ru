import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Check, Dices, FlaskConical, Keyboard, RotateCcw, Smartphone, Timer, Trophy } from 'lucide-react';
import { useMemo, useState, type PointerEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { labAchievements, labExperiments } from '../core/catalog';
import { LabShell } from '../core/LabShell';
import { resetLabProgress } from '../core/storage';
import { useLabState } from '../core/useLabState';
import type { LabExperiment } from '../core/types';
import { labRu } from '../i18n/ru';
import './labHome.css';

function LabPreview({ experiment }: { experiment: LabExperiment }) {
  if (experiment.id === 'builder') return <div className="lab-preview-builder"><i /><div><span /><span /><span /></div><b /></div>;
  if (experiment.id === 'game2d') return <div className="lab-preview-game"><div className="lab-preview-game__hero" /><span /><span /><span /><b>CORE</b></div>;
  if (experiment.id === 'game3d') return <div className="lab-preview-room"><i /><span /><span /><span /><b /></div>;
  if (experiment.id === 'physics') return <div className="lab-preview-physics"><i /><i /><i /><span /></div>;
  if (experiment.id === 'os') return <div className="lab-preview-os"><div><span>ФАЙЛЫ</span><span>ТЕРМИНАЛ</span></div><i /><b /><small /></div>;
  if (experiment.id === 'retro') return <div className="lab-preview-retro"><div>ФАЙЛ&nbsp;&nbsp;ПРАВКА&nbsp;&nbsp;ВИД</div><span>ПРОЧТИ.МЕНЯ</span><i>_</i></div>;
  return <div className="lab-preview-canvas"><span /><span /><span /><i /><b /></div>;
}

function Difficulty({ value }: { value: number }) {
  return <span className="lab-module__difficulty" aria-label={`${labRu.difficulty}: ${value} из 5`}>{Array.from({ length: 5 }, (_, index) => <i className={index < value ? 'is-on' : ''} key={index} />)}</span>;
}

function ExperimentModule({ experiment, explored, completed, index }: { experiment: LabExperiment; explored: boolean; completed: boolean; index: number }) {
  const reducedMotion = useReducedMotion();
  const [pointer, setPointer] = useState({ x: 50, y: 50 });
  const move = (event: PointerEvent<HTMLElement>) => {
    if (reducedMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setPointer({ x: ((event.clientX - bounds.left) / bounds.width) * 100, y: ((event.clientY - bounds.top) / bounds.height) * 100 });
  };
  return <motion.article className={`lab-module lab-module--${experiment.id} ${explored ? 'is-explored' : ''} ${completed ? 'is-completed' : ''}`} style={{ '--module-accent': experiment.accent, '--pointer-x': `${pointer.x}%`, '--pointer-y': `${pointer.y}%` } as React.CSSProperties} onPointerMove={move} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: reducedMotion ? 0 : .45, delay: index * .035 }}>
    <div className="lab-module__top"><span>{experiment.number}</span><div><i />{labRu.status[experiment.status]}</div>{explored ? <small><Check />{completed ? labRu.completed : labRu.explored}</small> : null}</div>
    <div className="lab-module__preview"><LabPreview experiment={experiment} /></div>
    <div className="lab-module__copy"><small className="lab-module__category">{experiment.category}</small><h2>{experiment.title}</h2><p>{experiment.description}</p><div>{experiment.technologies.map((technology) => <span key={technology}>{technology}</span>)}</div></div>
    <div className="lab-module__facts"><span><Difficulty value={experiment.difficulty} /></span><span><Timer />{experiment.duration}</span><span title={labRu.keyboard}>{experiment.keyboard ? <Keyboard /> : null}</span><span title={labRu.touch}>{experiment.touch ? <Smartphone /> : null}</span><span><Trophy />{experiment.achievementIds.length}</span></div>
    <Link to={experiment.href}>{explored && !completed ? labRu.continue : labRu.launch} <ArrowUpRight /></Link>
  </motion.article>;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return minutes < 60 ? `${minutes} мин` : `${Math.floor(minutes / 60)} ч ${minutes % 60} мин`;
}

export function LabHomePage() {
  const navigate = useNavigate();
  const { state, exploredCount, completedCount, level } = useLabState();
  const [resetNotice, setResetNotice] = useState(false);
  const unlocked = useMemo(() => labAchievements.filter((achievement) => state.achievements[achievement.id]), [state.achievements]);
  const lastExperiment = labExperiments.find((item) => item.id === state.lastExperiment);
  const surprise = () => {
    const unfinished = labExperiments.filter((item) => !state.completed.includes(item.id));
    const pool = unfinished.length ? unfinished : labExperiments;
    navigate(pool[Math.floor(Math.random() * pool.length)].href);
  };
  const reset = () => {
    if (!window.confirm(labRu.resetConfirm)) return;
    resetLabProgress();
    setResetNotice(true);
    window.setTimeout(() => setResetNotice(false), 2200);
  };
  const nextLevelXp = level === 10 ? state.xp : level * 250;
  return <LabShell title="Экспериментальная веб-среда" description="SITEVL LAB: интерактивные эксперименты с интерфейсами, играми, физикой, 3D и технологиями браузера." canonicalPath="/lab" backTo="/" backLabel="SITEVL">
    <section className="lab-home-hero">
      <div className="lab-home-hero__label"><FlaskConical /><span>{labRu.brand}</span><i /></div>
      <h1>ЭКСПЕРИМЕНТАЛЬНАЯ<br />ВЕБ-СРЕДА</h1>
      <p>{labRu.description}</p>
      <div className="lab-home-hero__actions"><button type="button" onClick={surprise}><Dices />{labRu.random}</button><span>{labRu.localProgress}</span></div>
      <div className="lab-home-signal" aria-hidden="true"><span /><span /><span /><span /><i /></div>
    </section>

    {lastExperiment ? <section className="lab-continue-panel"><div><small>{labRu.continueExperiment}</small><strong>{lastExperiment.title}</strong><span>{state.completed.includes(lastExperiment.id) ? 'Эксперимент завершён, можно пройти повторно.' : 'Локальный прогресс сохранён в этом браузере.'}</span></div><Link to={lastExperiment.href}>{labRu.continue}<ArrowUpRight /></Link></section> : null}

    <section className="lab-level-panel" aria-label={labRu.stats}>
      <div className="lab-level-panel__level"><small>{labRu.level}</small><strong>{level}</strong><span>{state.xp} XP · {level === 10 ? 'МАКСИМУМ' : `${nextLevelXp - state.xp} XP ДО СЛЕДУЮЩЕГО`}</span></div>
      <div className="lab-level-panel__stats">
        <span><small>{labRu.experiments}</small><strong>{completedCount}/{labExperiments.length}</strong></span>
        <span><small>{labRu.achievements}</small><strong>{unlocked.length}/{labAchievements.length}</strong></span>
        <span><small>{labRu.secrets}</small><strong>{state.secrets.length}/7</strong></span>
        <span><small>{labRu.playTime}</small><strong>{formatTime(state.stats.playTimeSeconds)}</strong></span>
        <span><small>{labRu.created}</small><strong>{state.stats.objectsCreated}</strong></span>
        <span><small>{labRu.broken}</small><strong>{state.stats.elementsBroken}</strong></span>
        <span><small>{labRu.rooms}</small><strong>{state.stats.roomsVisited}</strong></span>
      </div>
    </section>

    <section className="lab-progress-panel" aria-label="Прогресс LAB"><div><small>ЭКСПЕРИМЕНТЫ LAB</small><strong>{labRu.explored} {exploredCount}/{labExperiments.length}</strong></div><div className="lab-progress-track"><i style={{ width: `${(completedCount / labExperiments.length) * 100}%` }} /></div><div><small>{labRu.achievements}</small><strong>{unlocked.length}/{labAchievements.length}</strong></div><button type="button" onClick={reset} aria-label="Сбросить прогресс"><RotateCcw /></button></section>

    <section className="lab-modules" aria-label="Каталог экспериментов SITEVL LAB">{labExperiments.map((experiment, index) => <ExperimentModule key={experiment.id} experiment={experiment} explored={state.explored.includes(experiment.id)} completed={state.completed.includes(experiment.id)} index={index} />)}</section>

    <section className="lab-achievements-panel"><div><small>{labRu.achievementSystem}</small><h2>{labRu.achievementSignals}</h2></div><div>{labAchievements.map((achievement) => <article className={state.achievements[achievement.id] ? 'is-unlocked' : ''} key={achievement.id}><i>{state.achievements[achievement.id] ? <Check /> : null}</i><span><em>{achievement.category} · {achievement.xp} XP</em><strong>{achievement.title}</strong><small>{achievement.description}</small></span></article>)}</div></section>
    {resetNotice ? <div className="lab-toast" role="status">{labRu.resetDone}</div> : null}
  </LabShell>;
}
