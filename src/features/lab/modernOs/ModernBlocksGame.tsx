import { ArrowDown, Box, Expand, Pause, Play, RotateCcw, RotateCw, Trophy, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BLOCKS_WIDTH, createBlockPiece, createBlocksBoard, getGhostY, isBlockPositionValid, lockBlockPiece, rotateBlockPiece, type BlockCell, type BlockPiece } from './modernGameLogic';
import type { ModernGameProps } from './modernGameTypes';
import { ModernTouchButton } from './ModernTouchButton';

const palette = ['', '#65e8ff', '#ffe164', '#bd76ff', '#ff6f8d', '#54dfa6', '#ff9f55', '#6b83ff'];
const randomPiece = () => createBlockPiece();

export function ModernBlocksGame({ haptics, onExit, onRestart, onResult, onFullscreen }: ModernGameProps) {
  const [board, setBoard] = useState<BlockCell[][]>(createBlocksBoard);
  const [piece, setPiece] = useState<BlockPiece>(randomPiece);
  const [queue, setQueue] = useState<BlockPiece[]>(() => [randomPiece(), randomPiece(), randomPiece()]);
  const [held, setHeld] = useState<BlockPiece | null>(null);
  const [canHold, setCanHold] = useState(true);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [combo, setCombo] = useState(-1);
  const [paused, setPaused] = useState(false);
  const [over, setOver] = useState(false);
  const startedAt = useRef(performance.now());
  const scoreRef = useRef(score);
  useEffect(() => { scoreRef.current = score; }, [score]);
  const level = Math.floor(lines / 10) + 1;

  const finish = useCallback((finalScore: number) => {
    setOver(true);
    onResult('blocks', { score: finalScore, completed: true, playTime: (performance.now() - startedAt.current) / 1000, achievement: finalScore >= 2500 ? 'Архитектор блоков' : undefined, progress: Math.min(100, Math.floor(lines / 2)) });
  }, [lines, onResult]);

  const spawn = useCallback((sourceBoard: BlockCell[][], candidate = queue[0]) => {
    const nextPiece = { ...candidate, shape: candidate.shape.map((row) => [...row]), x: Math.floor((BLOCKS_WIDTH - candidate.shape[0].length) / 2), y: 0 };
    setPiece(nextPiece);
    setQueue((current) => [...current.slice(1), randomPiece()]);
    setCanHold(true);
    if (!isBlockPositionValid(sourceBoard, nextPiece)) finish(scoreRef.current);
  }, [finish, queue]);

  const lock = useCallback((target = piece) => {
    if (over) return;
    const result = lockBlockPiece(board, target);
    const nextCombo = result.cleared ? combo + 1 : -1;
    const linePoints = [0, 100, 300, 500, 800][result.cleared] * level;
    const gained = 18 + linePoints + Math.max(0, nextCombo) * 50;
    setBoard(result.board); setLines((value) => value + result.cleared); setCombo(nextCombo); setScore((value) => value + gained);
    spawn(result.board);
  }, [board, combo, level, over, piece, spawn]);

  const move = useCallback((dx: number, dy: number, soft = false) => {
    if (paused || over) return;
    const candidate = { ...piece, x: piece.x + dx, y: piece.y + dy };
    if (isBlockPositionValid(board, candidate)) { setPiece(candidate); if (soft && dy > 0) setScore((value) => value + 1); }
    else if (dy > 0) lock(piece);
  }, [board, lock, over, paused, piece]);

  const rotate = useCallback(() => {
    if (paused || over) return;
    const rotated = rotateBlockPiece(piece);
    for (const kick of [0, -1, 1, -2, 2]) { const candidate = { ...rotated, x: rotated.x + kick }; if (isBlockPositionValid(board, candidate)) { setPiece(candidate); return; } }
  }, [board, over, paused, piece]);

  const hardDrop = useCallback(() => {
    if (paused || over) return;
    const y = getGhostY(board, piece); setScore((value) => value + Math.max(0, y - piece.y) * 2); lock({ ...piece, y });
    if (haptics && navigator.vibrate) navigator.vibrate(10);
  }, [board, haptics, lock, over, paused, piece]);

  const hold = useCallback(() => {
    if (!canHold || paused || over) return;
    if (held) {
      const incoming = { ...held, x: Math.floor((BLOCKS_WIDTH - held.shape[0].length) / 2), y: 0 };
      setHeld({ ...piece, x: 0, y: 0 }); setPiece(incoming);
    } else { setHeld({ ...piece, x: 0, y: 0 }); spawn(board); }
    setCanHold(false);
  }, [board, canHold, held, over, paused, piece, spawn]);

  useEffect(() => { if (paused || over) return; const timer = window.setInterval(() => move(0, 1), Math.max(90, 720 - (level - 1) * 62)); return () => window.clearInterval(timer); }, [level, move, over, paused]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(event.key)) event.preventDefault();
      if (event.key === 'ArrowLeft') move(-1, 0); if (event.key === 'ArrowRight') move(1, 0); if (event.key === 'ArrowDown') move(0, 1, true); if (event.key === 'ArrowUp') rotate(); if (event.key === ' ') hardDrop(); if (event.key.toLowerCase() === 'c') hold(); if (event.key.toLowerCase() === 'p') setPaused((value) => !value);
    };
    window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler);
  }, [hardDrop, hold, move, rotate]);

  const rendered = useMemo(() => {
    const cells = board.map((row) => row.map((value) => ({ value, ghost: false })));
    const ghostY = getGhostY(board, piece);
    piece.shape.forEach((row, y) => row.forEach((cell, x) => { if (!cell) return; const gx = piece.x + x; const gy = ghostY + y; if (cells[gy]?.[gx] && !cells[gy][gx].value) cells[gy][gx] = { value: piece.color, ghost: true }; }));
    piece.shape.forEach((row, y) => row.forEach((cell, x) => { if (!cell) return; const px = piece.x + x; const py = piece.y + y; if (cells[py]?.[px]) cells[py][px] = { value: piece.color, ghost: false }; }));
    return cells;
  }, [board, piece]);

  return <div className="nova-game nova-blocks">
    <header><span><strong>{score}</strong><small> очков</small></span><span>Уровень {level}</span><b>BLOCKS</b><span>{lines} линий</span>{combo > 0 ? <span>Комбо ×{combo + 1}</span> : null}<button type="button" onClick={() => setPaused(!paused)} aria-label={paused ? 'Продолжить' : 'Пауза'}>{paused ? <Play /> : <Pause />}</button><button type="button" onClick={onRestart} aria-label="Начать заново"><RotateCcw /></button><button type="button" onClick={onFullscreen} aria-label="Играть на весь экран"><Expand /></button><button type="button" onClick={onExit} aria-label="Выйти в библиотеку"><X /></button></header>
    <div className="nova-blocks-stage"><aside><small>УДЕРЖАНО</small><BlockPreview piece={held} /><button type="button" onClick={hold} disabled={!canHold}><Box />Удержать</button></aside><main aria-label="Игровое поле BLOCKS">{rendered.flatMap((row, y) => row.map((cell, x) => <i className={`${cell.value ? 'is-filled' : ''} ${cell.ghost ? 'is-ghost' : ''}`} style={{ '--block-color': palette[cell.value] } as React.CSSProperties} key={`${x}-${y}`} />))}</main><aside><small>ДАЛЕЕ</small>{queue.map((next, index) => <BlockPreview piece={next} key={index} />)}</aside></div>
    <div className="nova-game-touch nova-blocks-controls"><ModernTouchButton haptics={haptics} onPointerDown={() => move(-1, 0)} aria-label="Сдвинуть влево">◀</ModernTouchButton><ModernTouchButton haptics={haptics} onPointerDown={rotate} aria-label="Повернуть блок"><RotateCw /></ModernTouchButton><ModernTouchButton haptics={haptics} onPointerDown={() => move(0, 1, true)} aria-label="Мягко опустить"><ArrowDown /></ModernTouchButton><ModernTouchButton haptics={haptics} onPointerDown={() => move(1, 0)} aria-label="Сдвинуть вправо">▶</ModernTouchButton><ModernTouchButton className="is-wide" haptics={haptics} onPointerDown={hardDrop} aria-label="Быстро опустить блок">СБРОС</ModernTouchButton></div>
    {paused ? <div className="nova-game-result"><Pause /><h2>Пауза</h2><button type="button" onClick={() => setPaused(false)}>Продолжить</button></div> : null}
    {over ? <div className="nova-game-result"><Trophy /><h2>Башня остановлена</h2><strong>{score} очков · {lines} линий</strong><div><button type="button" onClick={onRestart}>Новая игра</button><button type="button" onClick={onExit}>В библиотеку</button></div></div> : null}
  </div>;
}

function BlockPreview({ piece }: { piece: BlockPiece | null }) {
  return <div className="nova-block-preview">{piece ? piece.shape.flatMap((row, y) => row.map((cell, x) => <i className={cell ? 'is-filled' : ''} style={{ '--block-color': palette[piece.color] } as React.CSSProperties} key={`${x}-${y}`} />)) : <span>—</span>}</div>;
}
