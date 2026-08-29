import { Blocks, Clock3, Crosshair, Flag, Gamepad2, Gem, Play, Sprout, Trophy } from 'lucide-react';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import type { ModernFarmState } from './modernFarmModel';
import type { ModernGameId, ModernOsState } from './modernOsModel';
import type { ModernGameResult } from './modernGameTypes';

const ModernCoreShooter = lazy(() => import('./ModernCoreShooter').then((module) => ({ default: module.ModernCoreShooter })));
const ModernBlocksGame = lazy(() => import('./ModernBlocksGame').then((module) => ({ default: module.ModernBlocksGame })));
const ModernCircuitGame = lazy(() => import('./ModernCircuitGame').then((module) => ({ default: module.ModernCircuitGame })));
const ModernMatchGame = lazy(() => import('./ModernMatchGame').then((module) => ({ default: module.ModernMatchGame })));
const ModernFarmGame = lazy(() => import('./ModernFarmGame').then((module) => ({ default: module.ModernFarmGame })));

type Props = { state: ModernOsState; haptics: boolean; onLaunch: (id: ModernGameId) => void; onState: (id: ModernGameId, result: ModernGameResult) => void; onFarmChange: (farm: ModernFarmState) => void; onFullscreen: () => void };
const gameCopy: Array<{ id: ModernGameId; title: string; genre: string; description: string; controls: string; icon: typeof Gamepad2 }> = [
  { id: 'core-shooter', title: 'CORE SHOOTER', genre: 'FPS / КАМПАНИЯ', description: 'Связанные секторы, двери, три класса противников и два вида импульсного оружия.', controls: 'WASD · мышь · Пробел · R · E', icon: Crosshair },
  { id: 'blocks', title: 'BLOCKS', genre: 'АРКАДНАЯ ЛОГИКА', description: 'Падающие блоки с очередью, удержанием, призрачной проекцией, уровнями и цепочками линий.', controls: 'Стрелки · Пробел · C', icon: Blocks },
  { id: 'racing', title: 'NOVA CIRCUIT', genre: 'АРКАДНАЯ ГОНКА', description: 'Три круга по двум трассам с контрольными точками, столкновениями и лучшим временем.', controls: 'WASD / стрелки', icon: Flag },
  { id: 'match', title: 'SITEVL MATCH', genre: 'ГОЛОВОЛОМКА 3-В-РЯД', description: 'Поле 8×8, каскады, серии, ограниченные ходы и последовательность уровней.', controls: 'Мышь / касание', icon: Gem },
  { id: 'farm', title: 'SITEVL FARM', genre: 'ФЕРМА / МЕНЕДЖМЕНТ', description: 'Живая изометрическая ферма: выращивайте урожай, запускайте производство, выполняйте заказы и открывайте земли.', controls: 'Мышь · перетаскивание · жест масштаба', icon: Sprout },
];
const formatTime = (seconds: number) => seconds < 60 ? `${Math.round(seconds)} с` : `${Math.floor(seconds / 60)} ч ${String(Math.round(seconds % 60)).padStart(2, '0')} мин`;

export function ModernGames({ state, haptics, onLaunch, onState, onFarmChange, onFullscreen }: Props) {
  const [game, setGame] = useState<ModernGameId | null>(null); const [session, setSession] = useState(0); const [gameFullscreen, setGameFullscreen] = useState(false); const startedAt = useRef(0); const activeMs = useRef(0); const reported = useRef(false);
  const activePlayTime = () => (activeMs.current + (!document.hidden && startedAt.current ? performance.now() - startedAt.current : 0)) / 1000;
  const start = (id: ModernGameId) => { onLaunch(id); activeMs.current = 0; startedAt.current = document.hidden ? 0 : performance.now(); reported.current = false; setGame(id); setSession((value) => value + 1); };
  const recordAbandonedSession = () => { if (game && !reported.current) onState(game, { score: 0, playTime: activePlayTime() }); };
  const restart = () => { if (game) { recordAbandonedSession(); onLaunch(game); activeMs.current = 0; startedAt.current = document.hidden ? 0 : performance.now(); reported.current = false; setSession((value) => value + 1); } };
  const exit = () => { recordAbandonedSession(); if (gameFullscreen) onFullscreen(); setGameFullscreen(false); setGame(null); };
  const toggleFullscreen = () => { setGameFullscreen((value) => !value); onFullscreen(); };
  const reportResult = (id: ModernGameId, result: ModernGameResult) => { if (result.completed) reported.current = true; onState(id, result); };
  useEffect(() => { const visibility = () => { if (document.hidden && startedAt.current) { activeMs.current += performance.now() - startedAt.current; startedAt.current = 0; } else if (!document.hidden && game && !startedAt.current) startedAt.current = performance.now(); }; document.addEventListener('visibilitychange', visibility); return () => document.removeEventListener('visibilitychange', visibility); }, [game]);
  const props = game ? { haptics, progress: state.games[game], onExit: exit, onRestart: restart, onResult: reportResult, onFullscreen: toggleFullscreen } : null;
  if (game && props) return <Suspense fallback={<div className="nova-app-loading nova-game-loading"><Gamepad2 /><span>Загружаю игровой модуль…</span></div>}>{game === 'core-shooter' ? <ModernCoreShooter key={session} {...props} /> : game === 'blocks' ? <ModernBlocksGame key={session} {...props} /> : game === 'racing' ? <ModernCircuitGame key={session} {...props} /> : game === 'match' ? <ModernMatchGame key={session} {...props} /> : <ModernFarmGame key={session} {...props} farm={state.farm} lowPowerMode={state.lowPowerMode} onFarmChange={onFarmChange} />}</Suspense>;
  return <GameLibrary state={state} onStart={start} />;
}

function GameLibrary({ state, onStart }: { state: ModernOsState; onStart: (id: ModernGameId) => void }) {
  const totalTime = useMemo(() => Object.values(state.games).reduce((sum, game) => sum + game.playTime, 0), [state.games]);
  const farmReady = state.farm.plots.filter((plot) => plot.readyAt && plot.readyAt <= Date.now()).length + state.farm.processes.filter((process) => process.readyAt <= Date.now()).length + state.farm.animals.filter((animal) => animal.readyAt && animal.readyAt <= Date.now()).length;
  return <div className="nova-game-library"><header><div><small>ИГРОВАЯ СИСТЕМА SITEVL</small><h2>Игровой центр</h2><p>Пять самостоятельных игр с локальным прогрессом. Результаты остаются только в этой виртуальной системе.</p></div><dl><span><dt>Время в играх</dt><dd>{formatTime(totalTime)}</dd></span><span><dt>Достижения</dt><dd>{Object.values(state.games).reduce((sum, item) => sum + item.achievements.length, 0)}</dd></span></dl></header><section>{gameCopy.map(({ id, title, genre, description, controls, icon: Icon }) => { const progress = state.games[id]; const canContinue = (id === 'match' && progress.progress > 1) || (id === 'farm' && progress.launches > 0); return <article className={`is-${id}`} key={id}><div className="nova-game-cover"><Icon /><span>{title}</span><i /></div><small>{genre}</small><h3>{title}</h3><p>{description}</p><div className="nova-game-controls-copy"><Gamepad2 /><span>{controls}</span></div><dl><span><dt>{id === 'farm' ? 'Ферма' : 'Рекорд'}</dt><dd>{id === 'farm' ? `Ур. ${state.farm.level}${farmReady ? ` · ${farmReady} готово` : ''}` : progress.highScore.toLocaleString('ru-RU')}</dd></span><span><dt>{id === 'racing' ? 'Лучший круг' : 'Время'}</dt><dd>{id === 'racing' && progress.bestTime ? `${progress.bestTime.toFixed(2)} с` : formatTime(progress.playTime)}</dd></span></dl><div className="nova-game-achievements"><Trophy /><span>{progress.achievements.length ? progress.achievements.join(' · ') : 'Достижения ещё впереди'}</span></div><button type="button" onClick={() => onStart(id)}><Play />{canContinue ? id === 'farm' ? 'Продолжить ферму' : `Продолжить с уровня ${Math.round(progress.progress)}` : progress.launches ? 'Играть снова' : 'Играть'}</button></article>; })}</section><footer><Clock3 /><span>Состояние игр и фермы сохраняется локально в Modern OS.</span></footer></div>;
}
