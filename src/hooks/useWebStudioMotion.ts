import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect } from 'react';
import type { RefObject } from 'react';

gsap.registerPlugin(ScrollTrigger);

export function useWebStudioMotion(rootRef: RefObject<HTMLElement | null>, onChapterChange: (chapter: string) => void) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    let chapterTriggers: ReturnType<typeof ScrollTrigger.create>[] = [];
    const media = gsap.matchMedia();
    let refreshFrame = 0;

    const context = gsap.context(() => {
      const chapterSections = gsap.utils.toArray<HTMLElement>('[data-progress]', root);
      chapterTriggers = chapterSections.map((section) => ScrollTrigger.create({
        trigger: section,
        start: 'top 52%',
        end: 'bottom 52%',
        onEnter: () => onChapterChange(section.dataset.progress || 'vladivostok'),
        onEnterBack: () => onChapterChange(section.dataset.progress || 'vladivostok'),
      }));

      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray<HTMLElement>('[data-studio-reveal]', root).forEach((element) => {
          gsap.fromTo(
            element,
            { autoAlpha: 0, y: 28 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.9,
              delay: Number.parseInt(element.style.getPropertyValue('--studio-delay') || '0', 10) / 1000,
              ease: 'power3.out',
              scrollTrigger: { trigger: element, start: 'top 88%', once: true },
            },
          );
        });

        gsap.fromTo(
          '[data-digital-transition] .studio-digital-route',
          { scaleX: 0 },
          {
            scaleX: 1,
            stagger: 0.08,
            ease: 'power2.inOut',
            scrollTrigger: {
              trigger: '[data-digital-transition]',
              start: 'top 78%',
              end: 'center 48%',
              scrub: 0.8,
            },
          },
        );
        gsap.fromTo(
          '[data-code-symbol]',
          { autoAlpha: 0, scale: 0.7, rotate: -6 },
          {
            autoAlpha: 1,
            scale: 1,
            rotate: 0,
            ease: 'power3.out',
            scrollTrigger: { trigger: '[data-digital-transition]', start: '35% 68%', end: '65% 52%', scrub: 0.8 },
          },
        );
        gsap.fromTo(
          '.studio-digital-transition__cargo span',
          { autoAlpha: 0, x: -34, rotate: -3 },
          {
            autoAlpha: 1,
            x: 0,
            rotate: 0,
            stagger: 0.08,
            scrollTrigger: { trigger: '[data-digital-transition]', start: 'top 82%', end: '45% 55%', scrub: 0.7 },
          },
        );
        gsap.fromTo(
          '.studio-digital-transition__interface span',
          { autoAlpha: 0, y: 24, scale: 0.9 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            stagger: 0.06,
            scrollTrigger: { trigger: '[data-digital-transition]', start: '28% 68%', end: '72% 48%', scrub: 0.8 },
          },
        );

        gsap.fromTo(
          '.studio-asia-map__route-line',
          { strokeDashoffset: 180 },
          {
            strokeDashoffset: 0,
            stagger: 0.08,
            ease: 'none',
            scrollTrigger: { trigger: '.studio-asia-map', start: 'top 78%', end: 'center 52%', scrub: 0.8 },
          },
        );

        const whyNodes = gsap.utils.toArray<HTMLElement>('[data-why-node]', root);
        gsap.fromTo(
          whyNodes,
          { autoAlpha: 0.3, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            stagger: 0.12,
            scrollTrigger: { trigger: '[data-why-system]', start: 'top 76%', end: 'bottom 70%', scrub: 0.7 },
          },
        );
        gsap.fromTo(
          '[data-why-core]',
          { scale: 0.88, opacity: 0.5 },
          {
            scale: 1,
            opacity: 1,
            scrollTrigger: { trigger: '[data-why-system]', start: 'top 72%', end: 'center 55%', scrub: 0.8 },
          },
        );

        gsap.fromTo(
          '[data-process-line]',
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: '[data-process-scroll]', start: 'top 70%', end: 'bottom 72%', scrub: 0.7 },
          },
        );
        gsap.utils.toArray<HTMLElement>('[data-process-step]', root).forEach((step) => {
          gsap.fromTo(
            step,
            { autoAlpha: 0.28, x: -16 },
            {
              autoAlpha: 1,
              x: 0,
              scrollTrigger: { trigger: step, start: 'top 82%', end: 'center 62%', scrub: 0.5 },
            },
          );
        });

        const processPreviewLayers = gsap.utils.toArray<HTMLElement>('[data-process-preview]', root);
        gsap.set(processPreviewLayers, { autoAlpha: 0, y: 16, scale: 0.96 });
        processPreviewLayers.forEach((layer, index) => {
          const step = root.querySelector<HTMLElement>(`[data-process-step]:nth-of-type(${index + 1})`);
          if (!step) return;
          gsap.to(layer, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            scrollTrigger: { trigger: step, start: 'top 76%', end: 'center 58%', scrub: 0.55 },
          });
        });

      });

      media.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const heroTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: '.studio-hero-story',
            start: 'top top+=88',
            end: 'bottom top+=88',
            scrub: 1,
          },
        });
        heroTimeline
          .to('[data-globe-stage]', { scale: 1.55, yPercent: -22, opacity: 0.42, ease: 'none' }, 0)
          .to('[data-hero-copy]', { y: -72, opacity: 0.12, ease: 'none' }, 0.08)
          .fromTo('[data-city-horizon]', { yPercent: 22, opacity: 0.18 }, { yPercent: 0, opacity: 1, ease: 'none' }, 0.28);

        const eras = gsap.utils.toArray<HTMLElement>('[data-era]', root);
        const eraSteps = gsap.utils.toArray<HTMLElement>('.studio-era-stage__timeline i', root);
        gsap.set(eras.slice(1), { autoAlpha: 0, y: 50 });
        gsap.set(eraSteps, { opacity: 0.28, scale: 0.8 });
        gsap.set(eraSteps[0], { opacity: 1, scale: 1 });

        const eraTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: '[data-era-scroll]',
            start: 'top top+=80',
            end: 'bottom bottom',
            scrub: 0.9,
          },
        });
        eraTimeline.fromTo(
          '[data-city-cinematic]',
          { scale: 1.08, xPercent: 1.8, yPercent: 0.6 },
          { scale: 1, xPercent: -1.1, yPercent: -0.8, ease: 'none', duration: 4 },
          0,
        );
        eraTimeline.to('[data-city-cinematic-dim]', { opacity: 0.52, ease: 'none', duration: 1.25 }, 2.65);
        eraTimeline.fromTo(
          '[data-city-route-transition]',
          { autoAlpha: 0, scaleY: 0.22 },
          { autoAlpha: 0.88, scaleY: 1, ease: 'power1.inOut', duration: 1.35 },
          2.55,
        );
        gsap.utils.toArray<HTMLElement>('[data-city-reflection]', root).forEach((reflection, index) => {
          eraTimeline.fromTo(
            reflection,
            { xPercent: index === 0 ? -18 : 14, opacity: index === 0 ? 0.18 : 0.12 },
            { xPercent: index === 0 ? 34 : -22, opacity: index === 0 ? 0.42 : 0.28, ease: 'none', duration: 4 },
            0,
          );
        });
        eraTimeline.to('[data-era-progress]', { scaleY: 1, ease: 'none', duration: 4 }, 0);

        eras.forEach((era, index) => {
          if (index === 0) return;
          const position = index;
          eraTimeline
            .to(eras[index - 1], { autoAlpha: 0, y: -34, duration: 0.34 }, position - 0.16)
            .to(era, { autoAlpha: 1, y: 0, duration: 0.5 }, position)
            .to(eraSteps[index - 1], { opacity: 0.45, scale: 0.9, duration: 0.2 }, position)
            .to(eraSteps[index], { opacity: 1, scale: 1, duration: 0.2 }, position);
        });

        const portContainers = gsap.utils.toArray<HTMLElement>('[data-port-container]', root);
        const portTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: '[data-port-scroll]',
            start: 'top top+=80',
            end: 'bottom bottom',
            scrub: 0.9,
          },
        });
        portTimeline
          .to('[data-port-copy]', { autoAlpha: 0.15, y: -44, duration: 1 }, 0.4)
          .to('[data-port-hook]', { x: 90, y: 54, duration: 0.7, ease: 'power1.inOut' }, 0.08)
          .fromTo('[data-port-transfer]', { autoAlpha: 0, y: -80 }, { autoAlpha: 1, y: 34, duration: 0.8, ease: 'power1.inOut' }, 0.28)
          .to(portContainers, {
            x: (index) => ((index % 4) - 1.5) * 44,
            y: (index) => -80 - Math.floor(index / 4) * 26,
            scale: 0.72,
            opacity: 0.32,
            stagger: 0.025,
            duration: 1.2,
            ease: 'power2.inOut',
          }, 0.5)
          .fromTo('[data-port-truck]', { xPercent: -130, autoAlpha: 0.2 }, { xPercent: 235, autoAlpha: 1, duration: 1.4, ease: 'none' }, 0.52)
          .fromTo('[data-catalogue-mockup]', { autoAlpha: 0, y: 70, scale: 0.86 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out' }, 1.05);

        const priceScenes = gsap.utils.toArray<HTMLElement>('[data-price-scene]', root);
        const builderLayers = gsap.utils.toArray<HTMLElement>('[data-builder-layer]', root);
        const complexitySteps = gsap.utils.toArray<HTMLElement>('[data-complexity-step]', root);
        const complexityLabel = root.querySelector<HTMLElement>('[data-complexity-label]');

        gsap.set(priceScenes.slice(1), { autoAlpha: 0, y: 44 });
        gsap.set(builderLayers.slice(1), { autoAlpha: 0, y: 22, scale: 0.95 });
        gsap.set(complexitySteps, { opacity: 0.24, scaleX: 0.75, transformOrigin: 'left center' });
        gsap.set(complexitySteps[0], { opacity: 1, scaleX: 1 });

        let activeComplexityIndex = 0;
        ScrollTrigger.create({
          trigger: '[data-complexity-scroll]',
          start: 'top top+=72',
          end: 'bottom bottom',
          onUpdate: (self) => {
            const nextIndex = Math.min(priceScenes.length - 1, Math.round(self.progress * (priceScenes.length - 1)));
            if (nextIndex === activeComplexityIndex) return;
            activeComplexityIndex = nextIndex;

            priceScenes.forEach((scene, index) => {
              gsap.to(scene, {
                autoAlpha: index === nextIndex ? 1 : 0,
                y: index === nextIndex ? 0 : index < nextIndex ? -22 : 22,
                duration: 0.22,
                overwrite: true,
                ease: 'power2.out',
              });
            });
            builderLayers.forEach((layer, index) => {
              gsap.to(layer, {
                autoAlpha: index <= nextIndex ? 1 : 0,
                y: index <= nextIndex ? 0 : 18,
                scale: index <= nextIndex ? 1 : 0.96,
                duration: 0.28,
                overwrite: true,
                ease: 'power2.out',
              });
            });
            complexitySteps.forEach((step, index) => {
              gsap.to(step, {
                opacity: index === nextIndex ? 1 : index < nextIndex ? 0.5 : 0.24,
                scaleX: index <= nextIndex ? 1 : 0.75,
                duration: 0.2,
                overwrite: true,
              });
            });
            if (complexityLabel) complexityLabel.textContent = `${String(nextIndex + 1).padStart(2, '0')} / 06`;
          },
        });

      });

      refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
    }, root);

    return () => {
      cancelAnimationFrame(refreshFrame);
      chapterTriggers.forEach((trigger) => trigger.kill());
      media.revert();
      context.revert();
    };
  }, [onChapterChange, rootRef]);
}
