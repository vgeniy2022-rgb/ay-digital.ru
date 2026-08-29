import { Expand, Pause, Play, RotateCcw, Sparkles, Trophy, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { areMatchCellsAdjacent, collapseMatchBoard, createMatchBoard, findMatchGroups, swapMatchCells, type MatchCell, type MatchPoint } from './modernGameLogic';
import type { ModernGameProps } from './modernGameTypes';

const colors = ['cyan', 'violet', 'coral', 'lime', 'amber', 'blue'];
const colorLabels = ['бирюзовый', 'фиолетовый', 'коралловый', 'лаймовый', 'янтарный', 'синий'];

export function ModernMatchGame({ haptics, progress, onExit, onRestart, onResult, onFullscreen }: ModernGameProps) {
  const level = Math.max(1, Math.min(12, Math.round(progress.progress || 1)));
  const target = 1200 + (level - 1) * 420;
  const [board, setBoard] = useState<MatchCell[][]>(createMatchBoard);
  const [selected, setSelected] = useState<MatchPoint | null>(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(22);
  const [combo, setCombo] = useState(0);
  const [paused, setPaused] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [particles, setParticles] = useState<Array<MatchPoint & { id: number }>>([]);
  const [finished, setFinished] = useState<'win' | 'lose' | null>(null);
  const startedAt = useRef(performance.now());
  const audio = useRef<AudioContext | null>(null);

  const sound = useCallback((frequency: number) => {
    try { const context = audio.current || new AudioContext(); audio.current = context; const oscillator = context.createOscillator(); const gain = context.createGain(); oscillator.frequency.value = frequency; gain.gain.setValueAtTime(.04, context.currentTime); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .12); oscillator.connect(gain).connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + .13); } catch { /* Audio feedback is optional. */ }
  }, []);
  useEffect(() => () => { void audio.current?.close(); audio.current = null; }, []);

  const finish = useCallback((kind: 'win' | 'lose', finalScore: number) => {
    setFinished(kind);
    onResult('match', { score: finalScore, completed: true, playTime: (performance.now() - startedAt.current) / 1000, achievement: kind === 'win' ? 'Мастер цепочек' : undefined, progress: kind === 'win' ? Math.min(12, level + 1) : level });
  }, [level, onResult]);

  const resolve = useCallback(async (initial: MatchCell[][], firstGroups = findMatchGroups(initial)) => {
    let next = initial; let groups = firstGroups; let chain = 0; let gained = 0;
    setResolving(true);
    while (groups.length) {
      chain += 1; const points = groups.flat(); gained += points.length * 60 * chain;
      setParticles(points.map((point, index) => ({ ...point, id: Date.now() + index })));
      await new Promise((resolveDelay) => window.setTimeout(resolveDelay, 130));
      next = collapseMatchBoard(next, groups); setBoard(next); groups = findMatchGroups(next);
    }
    setParticles([]); setCombo(chain); setScore((value) => value + gained); setResolving(false); sound(380 + chain * 85);
    if (haptics && navigator.vibrate) navigator.vibrate(chain > 1 ? [8, 25, 12] : 8);
    return gained;
  }, [haptics, sound]);

  const choose = useCallback(async (point: MatchPoint) => {
    if (paused || resolving || finished) return;
    if (!selected) { setSelected(point); return; }
    if (selected.x === point.x && selected.y === point.y) { setSelected(null); return; }
    if (!areMatchCellsAdjacent(selected, point)) { setSelected(point); return; }
    const swapped = swapMatchCells(board, selected, point); const groups = findMatchGroups(swapped); setSelected(null);
    if (!groups.length) { setBoard(swapped); sound(130); window.setTimeout(() => setBoard(board), 130); return; }
    setBoard(swapped); setMoves((value) => value - 1); const gained = await resolve(swapped, groups); const finalScore = score + gained; const remaining = moves - 1;
    if (finalScore >= target) finish('win', finalScore); else if (remaining <= 0) finish('lose', finalScore);
  }, [board, finish, finished, moves, paused, resolve, resolving, score, selected, sound, target]);

  return <div className="nova-game nova-match">
    <header><span>Уровень {level}</span><span><strong>{score}</strong> / {target}</span><b>SITEVL MATCH</b><span>{moves} ходов</span>{combo > 1 ? <span>Цепочка ×{combo}</span> : null}<button type="button" onClick={() => setPaused(!paused)} aria-label={paused ? 'Продолжить' : 'Пауза'}>{paused ? <Play /> : <Pause />}</button><button type="button" onClick={onRestart} aria-label="Начать заново"><RotateCcw /></button><button type="button" onClick={onFullscreen} aria-label="Играть на весь экран"><Expand /></button><button type="button" onClick={onExit} aria-label="Выйти в библиотеку"><X /></button></header>
    <main className="nova-match-board" aria-label="Поле SITEVL MATCH">{board.flatMap((row, y) => row.map((cell, x) => <button type="button" className={`is-${colors[cell.color]} ${selected?.x === x && selected.y === y ? 'is-selected' : ''} ${cell.special ? `is-${cell.special}` : ''}`} onClick={() => void choose({ x, y })} aria-label={`Элемент ${colorLabels[cell.color]}, строка ${y + 1}, столбец ${x + 1}`} key={`${x}-${y}`}><i /></button>))}{particles.map((particle) => <span className="nova-match-particle" style={{ '--particle-x': particle.x, '--particle-y': particle.y } as React.CSSProperties} key={particle.id}><Sparkles /></span>)}</main>
    <footer><span>Соединяйте 3 элемента. Серии из 4 и 5 приносят усиленный бонус.</span><strong>{resolving ? 'Считаю цепочку…' : `Цель: ${target} очков`}</strong></footer>
    {paused ? <div className="nova-game-result"><Pause /><h2>Пауза</h2><button type="button" onClick={() => setPaused(false)}>Продолжить</button></div> : null}
    {finished ? <div className="nova-game-result">{finished === 'win' ? <Trophy /> : <Sparkles />}<h2>{finished === 'win' ? 'Уровень пройден' : 'Ходы закончились'}</h2><strong>{score} очков</strong><div><button type="button" onClick={onRestart}>{finished === 'win' ? 'Следующий уровень' : 'Повторить'}</button><button type="button" onClick={onExit}>В библиотеку</button></div></div> : null}
  </div>;
}
