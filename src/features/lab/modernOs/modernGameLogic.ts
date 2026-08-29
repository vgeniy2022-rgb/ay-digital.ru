export const BLOCKS_WIDTH = 10;
export const BLOCKS_HEIGHT = 20;
export type BlockCell = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type BlockPiece = { shape: BlockCell[][]; x: number; y: number; color: BlockCell };

export const BLOCK_SHAPES: BlockCell[][][] = [
  [[1, 1, 1, 1]], [[2, 2], [2, 2]], [[0, 3, 0], [3, 3, 3]],
  [[4, 0, 0], [4, 4, 4]], [[0, 0, 5], [5, 5, 5]], [[0, 6, 6], [6, 6, 0]], [[7, 7, 0], [0, 7, 7]],
];

export const createBlocksBoard = (): BlockCell[][] => Array.from({ length: BLOCKS_HEIGHT }, () => Array<BlockCell>(BLOCKS_WIDTH).fill(0));
export function createBlockPiece(index = Math.floor(Math.random() * BLOCK_SHAPES.length)): BlockPiece {
  const shape = BLOCK_SHAPES[index % BLOCK_SHAPES.length].map((row) => [...row]);
  return { shape, x: Math.floor((BLOCKS_WIDTH - shape[0].length) / 2), y: 0, color: (index % 7 + 1) as BlockCell };
}
export function rotateBlockPiece(piece: BlockPiece): BlockPiece {
  return { ...piece, shape: piece.shape[0].map((_, x) => piece.shape.map((row) => row[x]).reverse()) };
}
export function isBlockPositionValid(board: BlockCell[][], piece: BlockPiece): boolean {
  return piece.shape.every((row, y) => row.every((cell, x) => !cell || (piece.x + x >= 0 && piece.x + x < BLOCKS_WIDTH && piece.y + y >= 0 && piece.y + y < BLOCKS_HEIGHT && !board[piece.y + y][piece.x + x])));
}
export function getGhostY(board: BlockCell[][], piece: BlockPiece): number {
  let y = piece.y;
  while (isBlockPositionValid(board, { ...piece, y: y + 1 })) y += 1;
  return y;
}
export function lockBlockPiece(board: BlockCell[][], piece: BlockPiece) {
  const merged = board.map((row) => [...row]);
  piece.shape.forEach((row, y) => row.forEach((cell, x) => { if (cell && merged[piece.y + y]?.[piece.x + x] !== undefined) merged[piece.y + y][piece.x + x] = piece.color; }));
  const remaining = merged.filter((row) => row.some((cell) => cell === 0));
  const cleared = BLOCKS_HEIGHT - remaining.length;
  return { board: [...Array.from({ length: cleared }, () => Array<BlockCell>(BLOCKS_WIDTH).fill(0)), ...remaining], cleared };
}

export type MatchSpecial = 'row' | 'column' | 'burst';
export type MatchCell = { color: number; special?: MatchSpecial };
export type MatchPoint = { x: number; y: number };
export const MATCH_SIZE = 8;

export function createMatchBoard(random = Math.random): MatchCell[][] {
  const board: MatchCell[][] = [];
  for (let y = 0; y < MATCH_SIZE; y += 1) {
    board[y] = [];
    for (let x = 0; x < MATCH_SIZE; x += 1) {
      const blocked = new Set<number>();
      if (x >= 2 && board[y][x - 1].color === board[y][x - 2].color) blocked.add(board[y][x - 1].color);
      if (y >= 2 && board[y - 1][x].color === board[y - 2][x].color) blocked.add(board[y - 1][x].color);
      const choices = [0, 1, 2, 3, 4, 5].filter((color) => !blocked.has(color));
      board[y][x] = { color: choices[Math.floor(random() * choices.length)] };
    }
  }
  return board;
}
export function findMatchGroups(board: MatchCell[][]): MatchPoint[][] {
  const groups: MatchPoint[][] = [];
  for (let y = 0; y < MATCH_SIZE; y += 1) {
    let start = 0;
    for (let x = 1; x <= MATCH_SIZE; x += 1) if (x === MATCH_SIZE || board[y][x].color !== board[y][start].color) { if (x - start >= 3) groups.push(Array.from({ length: x - start }, (_, i) => ({ x: start + i, y }))); start = x; }
  }
  for (let x = 0; x < MATCH_SIZE; x += 1) {
    let start = 0;
    for (let y = 1; y <= MATCH_SIZE; y += 1) if (y === MATCH_SIZE || board[y][x].color !== board[start][x].color) { if (y - start >= 3) groups.push(Array.from({ length: y - start }, (_, i) => ({ x, y: start + i }))); start = y; }
  }
  const expanded = groups.map((group) => {
    const points = new Map(group.map((point) => [`${point.x}:${point.y}`, point]));
    group.forEach((point) => {
      const special = board[point.y][point.x].special;
      if (special === 'row') for (let x = 0; x < MATCH_SIZE; x += 1) points.set(`${x}:${point.y}`, { x, y: point.y });
      if (special === 'column') for (let y = 0; y < MATCH_SIZE; y += 1) points.set(`${point.x}:${y}`, { x: point.x, y });
      if (special === 'burst') for (let y = Math.max(0, point.y - 1); y <= Math.min(MATCH_SIZE - 1, point.y + 1); y += 1) for (let x = Math.max(0, point.x - 1); x <= Math.min(MATCH_SIZE - 1, point.x + 1); x += 1) points.set(`${x}:${y}`, { x, y });
    });
    return [...points.values()];
  });
  return expanded;
}
export function swapMatchCells(board: MatchCell[][], a: MatchPoint, b: MatchPoint): MatchCell[][] {
  const next = board.map((row) => row.map((cell) => ({ ...cell })));
  [next[a.y][a.x], next[b.y][b.x]] = [next[b.y][b.x], next[a.y][a.x]];
  return next;
}
export function areMatchCellsAdjacent(a: MatchPoint, b: MatchPoint) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1; }
export function collapseMatchBoard(board: MatchCell[][], groups: MatchPoint[][], random = Math.random): MatchCell[][] {
  const specialByPoint = new Map<string, MatchSpecial>();
  groups.forEach((group) => { if (group.length < 4) return; const anchor = group[Math.floor(group.length / 2)]; const horizontal = group.every((point) => point.y === group[0].y); specialByPoint.set(`${anchor.x}:${anchor.y}`, group.length >= 5 ? 'burst' : horizontal ? 'row' : 'column'); });
  const removed = new Set(groups.flat().map(({ x, y }) => `${x}:${y}`).filter((key) => !specialByPoint.has(key)));
  const next = Array.from({ length: MATCH_SIZE }, () => Array<MatchCell>(MATCH_SIZE));
  for (let x = 0; x < MATCH_SIZE; x += 1) {
    const column: MatchCell[] = board.map((row, y) => ({ cell: row[x], y })).filter(({ y }) => !removed.has(`${x}:${y}`)).map(({ cell, y }) => ({ ...cell, special: specialByPoint.get(`${x}:${y}`) || cell.special }));
    while (column.length < MATCH_SIZE) column.unshift({ color: Math.floor(random() * 6) });
    column.forEach((cell, y) => { next[y][x] = cell; });
  }
  return next;
}

export function isSafeGameResult(value: number) { return Number.isFinite(value) && value >= 0; }
