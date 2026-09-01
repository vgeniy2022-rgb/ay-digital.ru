import { Code2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export function DeveloperOverlay() {
  const location = useLocation();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem('sitevl-developer-mode') === 'true';
    document.body.classList.toggle('sitevl-developer-mode', stored);
    setEnabled(stored);
    const onChange = (event: Event) => setEnabled(Boolean((event as CustomEvent<boolean>).detail));
    window.addEventListener('sitevl:developer-mode', onChange);
    return () => window.removeEventListener('sitevl:developer-mode', onChange);
  }, []);

  if (!enabled) return null;

  return (
    <aside className="sitevl-developer-overlay" aria-live="polite">
      <Code2 aria-hidden="true" />
      <span>Режим разработчика</span>
      <code>{location.pathname}</code>
      <small>React · TypeScript · React Router · Framer Motion</small>
    </aside>
  );
}
