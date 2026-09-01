import { Clock3, Moon, Power } from 'lucide-react';
import { useEffect, useState } from 'react';

function vladivostokTime() {
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Asia/Vladivostok',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}

export function StudioExperienceControls() {
  const [time, setTime] = useState(vladivostokTime);
  const [nightMode, setNightMode] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setTime(vladivostokTime()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('studio-vl-night', nightMode);
    return () => document.body.classList.remove('studio-vl-night');
  }, [nightMode]);

  return (
    <div className="studio-experience-controls">
      <span title="Локальное время по часовому поясу Asia/Vladivostok"><Clock3 aria-hidden="true" /> Владивосток {time}</span>
      <button type="button" aria-pressed={nightMode} onClick={() => setNightMode((value) => !value)}>
        {nightMode ? <Power aria-hidden="true" /> : <Moon aria-hidden="true" />}
        Ночной режим
      </button>
    </div>
  );
}
