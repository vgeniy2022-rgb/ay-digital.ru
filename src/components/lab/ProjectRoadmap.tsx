import { projectAvailability, projectQueue, projectRoadmap } from '../../data/lab';

export function ProjectRoadmap({ activeStep = 0 }: { activeStep?: number }) {
  return (
    <div className="lab-roadmap" aria-label="Этапы проекта">
      {projectRoadmap.map((step, index) => (
        <div className="lab-roadmap__step" key={step} aria-current={index === activeStep ? 'step' : undefined}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <strong>{step}</strong>
        </div>
      ))}
    </div>
  );
}

export function ProjectAvailability() {
  if (!projectAvailability.isVisible) return null;

  const labels = {
    accepting: 'Принимаю новые проекты',
    limited: 'Ограниченная доступность',
    busy: 'Сейчас занят',
    window: `Свободное окно${projectAvailability.windowDate ? ` с ${projectAvailability.windowDate}` : ''}`,
  };

  return (
    <aside className="lab-card" aria-label="Доступность для новых проектов">
      <p className="lab-eyebrow">Доступность</p>
      <h3>{projectAvailability.title || labels[projectAvailability.status]}</h3>
      <p>{projectAvailability.text}</p>
      {projectAvailability.activeProjects !== null ? <p>Проектов в работе: {projectAvailability.activeProjects}</p> : null}
    </aside>
  );
}

export function ProjectQueue() {
  if (!projectQueue.isVisible || projectQueue.items.length === 0) return null;

  return (
    <aside className="lab-card" aria-label={projectQueue.title}>
      <p className="lab-eyebrow">Очередь</p>
      <h3>{projectQueue.title}</h3>
      <ol className="mt-4 grid gap-2 text-sm font-semibold text-muted">
        {projectQueue.items.map((item, index) => <li key={`${item}-${index}`}>{String(index + 1).padStart(2, '0')} · {item}</li>)}
      </ol>
    </aside>
  );
}
