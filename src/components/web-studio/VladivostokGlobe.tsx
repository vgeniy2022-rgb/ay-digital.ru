import { useEffect, useRef, useState } from 'react';

export function VladivostokGlobe() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const useStaticScene = window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)').matches;
    if (useStaticScene || !window.WebGLRenderingContext) return undefined;

    let cancelled = false;
    let disposeScene: (() => void) | undefined;

    async function setupScene() {
      const { mountVladivostokGlobe } = await import('./globeScene');
      if (cancelled || !mount) return;
      disposeScene = mountVladivostokGlobe(mount, () => setIsReady(true));
    }

    setupScene().catch((error) => {
      if (import.meta.env.DEV) console.warn('[WebStudio] Three.js scene fallback:', error);
    });

    return () => {
      cancelled = true;
      disposeScene?.();
    };
  }, []);

  return (
    <div className={`studio-globe ${isReady ? 'is-ready' : ''}`} aria-label="Стилизованная ночная карта связей Владивостока с Москвой, Пекином, Сеулом, Токио, Шанхаем и Гонконгом" role="img">
      <div className="studio-globe__fallback" aria-hidden="true">
        <span className="studio-globe__latitude studio-globe__latitude--one" />
        <span className="studio-globe__latitude studio-globe__latitude--two" />
        <span className="studio-globe__longitude studio-globe__longitude--one" />
        <span className="studio-globe__longitude studio-globe__longitude--two" />
        <span className="studio-globe__light studio-globe__light--one" />
        <span className="studio-globe__light studio-globe__light--two" />
        <span className="studio-globe__light studio-globe__light--three" />
      </div>
      <div className="studio-globe__canvas" ref={mountRef} aria-hidden="true" />
      <div className="studio-globe__marker" aria-hidden="true">
        <span />
        <strong>Владивосток</strong>
      </div>
      <div className="studio-globe__network" aria-hidden="true">
        <span className="studio-globe__node studio-globe__node--moscow"><i />Москва</span>
        <span className="studio-globe__node studio-globe__node--beijing"><i />Пекин</span>
        <span className="studio-globe__node studio-globe__node--seoul"><i />Сеул</span>
        <span className="studio-globe__node studio-globe__node--tokyo"><i />Токио</span>
        <span className="studio-globe__node studio-globe__node--shanghai"><i />Шанхай</span>
        <span className="studio-globe__node studio-globe__node--hong-kong"><i />Гонконг</span>
      </div>
      <div className="studio-globe__geo" aria-hidden="true">
        <span>Россия</span><i /> <span>Дальний Восток</span><i /> <strong>Владивосток</strong><i /> <span>Восточная Азия</span>
      </div>
    </div>
  );
}
