# SITEVL LAB — final implementation report

Date: 2026-08-28

## Result

SITEVL LAB has been rebuilt as one isolated experimental environment with seven
functional modules. The commercial SITEVL application, its public layout, CMS,
SEO generation and deployment configuration remain in place. LAB routes use a
separate shell and are loaded only when a visitor enters the laboratory.

## What was removed from the active LAB

The previous Admin Demo, Architecture Explorer, Web Evolution and SEO Visualizer
are no longer shown in the LAB navigation or generated as LAB landing pages.
Their old URLs redirect to `/lab`, so existing bookmarks do not end on a broken
page. The previous website-builder URL redirects to `/lab/builder`.

Old source files were not destructively deleted. They remain available for
reference while the public route surface contains only the requested modules.

## What was preserved

- Existing React/Vite/TypeScript architecture and React Router setup.
- Public SITEVL pages, header, footer, CMS integration and contact flows.
- Existing Website Builder and its saved IndexedDB projects.
- Existing SEO generator, audit and Vercel SPA rewrite.
- `/lab/builder-legacy` as an explicit compatibility route.

## Public LAB routes

| Route | Experiment | Functional interaction |
| --- | --- | --- |
| `/lab` | Experimental Web Environment | Seven asymmetric previews, progress, achievements, `SURPRISE ME` |
| `/lab/builder` | Website Builder | Existing Studio projects and editor inside the LAB system |
| `/lab/2d` | Break the Website | Movement, jumping, breaking, grabbing, switches, CORE and restore |
| `/lab/3d` | The Room | First-person room, four modules, EXIT and procedural final scene |
| `/lab/physics` | Physics Lab | Create, drag, throw and tune physical objects and gravity |
| `/lab/os` | SITEVL OS | Windows, Files, Terminal, Notes, Browser and Settings |
| `/lab/retro` | Retro Computing | Two original period styles, Notes, Paint, Calculator and Files |
| `/lab/canvas` | Infinite Canvas | Pan, zoom, pinch, objects, multi-select, resize and connections |

## Shared architecture

The implementation lives under `src/features/lab/` and is split into `core`,
`home`, `builder`, `game2d`, `game3d`, `physics`, `os`, `retro` and
`infiniteCanvas`. There is no monolithic LAB component.

The shared state uses the versioned `sitevl-lab-state-v1` localStorage record.
It tracks explored experiments, seven achievements and shared sound preference.
Malformed or obsolete values are filtered when read, and storage failures do not
break an experiment. Notes, retro preferences and canvas content are also local.
No account, backend or API change was introduced.

Cross-experiment links include achievements from 2D, 3D, physics, retro and
canvas, an experiment catalogue inside SITEVL OS, hidden canvas portals, a LAB
badge in Builder and `README.TXT` in Retro Computing.

## Rendering and interaction

- 2D game: one controlled Canvas 2D scene, keyboard and touch controls, particles,
  shake, optional WebAudio and vibration.
- 3D game: procedural Three.js scene with no downloaded models or copyrighted
  assets, raycast interactions, desktop and touch controls.
- Physics: lightweight local simulation with object families, gravity presets,
  material controls, optional haptics and device-orientation fallback.
- OS and Retro: DOM applications with draggable/focusable windows and locally
  persisted user content.
- Infinite Canvas: one Canvas 2D renderer rather than an unbounded DOM tree.

Animation loops, observers, audio contexts and event listeners are stopped or
removed on unmount. The 3D renderer disposes scene resources and explicitly
releases its WebGL context. Hidden tabs pause realtime scenes.

## Performance impact

Every LAB page is a React lazy route and a separate Vite chunk. Three.js is not
part of the commercial homepage bundle and is fetched only for `/lab/3d`.

Final minified JavaScript sizes (gzip in parentheses):

- LAB home: 6.01 kB (2.33 kB)
- Website Builder LAB wrapper: 0.85 kB (0.48 kB), plus existing Studio chunks
- Break the Website: 12.17 kB (5.11 kB)
- The Room: 22.51 kB (9.43 kB)
- Three renderer: 33.42 kB (10.67 kB)
- Physics Lab: 11.66 kB (4.81 kB)
- OS Simulator: 12.97 kB (4.63 kB)
- Retro Computing: 12.24 kB (4.70 kB)
- Infinite Canvas: 14.87 kB (5.71 kB)

The Room caps device pixel ratio, provides `AUTO`, `LOW`, `MEDIUM` and `HIGH`
quality modes, and lowers quality through an FPS guard. The only Vite size warning
is the pre-existing isolated Studio chunk (650.69 kB, 184.88 kB gzip); it is not
downloaded by the ordinary commercial homepage or by unrelated LAB experiments.

## Mobile and accessibility

- Responsive layouts and dedicated breakpoints exist for all seven modules.
- 2D and 3D provide touch controls; canvas supports touch and pinch zoom.
- Game surfaces use safe-area-aware controls and prevent accidental game scroll.
- The Room keeps portrait functional and displays a landscape recommendation.
- Buttons have accessible names, keyboard focus remains visible, and the normal
  LAB interface supports keyboard navigation.
- `prefers-reduced-motion` reduces non-essential movement and shake.
- Shared sound mute and Physics haptics toggles are available.
- Unsupported WebGL and unavailable device sensors receive readable fallbacks,
  never stack traces.

## SEO and routing

All eight public LAB routes have unique titles and descriptions and use `noindex`
because they are interactive technical experiences rather than search landing
pages. Direct route loading and Vercel SPA fallback remain supported. LAB did not
change the set of 61 indexable SITEVL URLs.

## Verification completed

- `npm test`: passed, 21/21 tests.
- `npm run lint`: passed with no errors.
- `npx tsc -b --pretty false`: passed with no errors.
- `npm run build`: passed.
- SEO generation: 61 sitemap URLs and 74 prerendered HTML files.
- SEO audit: passed for all 61 indexable URLs.
- `git diff --check`: passed.
- Desktop runtime checks: `/`, `/lab` and all seven experiment routes opened.
- Visual runtime checks: LAB home, 2D, 3D/WebGL, Physics, OS, Retro, Canvas and
  Builder rendered without horizontal overflow at the tested 1280 px viewport.
- Compatibility redirects `/lab/admin-demo` and `/lab/website-builder` worked.

## Known limitations

Physical iPhone/iPad Safari testing was not available in this run. Sensor
permission, device orientation and vibration therefore have implemented fallback
paths but are not claimed as verified on physical hardware. Full game completion
was covered by state/model tests and desktop rendering checks; a complete manual
playthrough with every keyboard and touch combination remains a device QA task.

No production deployment, commit or push was performed as part of this work.
