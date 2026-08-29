import assert from 'node:assert/strict';
import test from 'node:test';
import { areMatchCellsAdjacent, collapseMatchBoard, createBlockPiece, createBlocksBoard, createMatchBoard, findMatchGroups, getGhostY, isBlockPositionValid, lockBlockPiece, rotateBlockPiece, swapMatchCells } from './modernGameLogic';

test('BLOCKS calculates collision, rotation, ghost and cleared lines', () => {
  const board = createBlocksBoard();
  const piece = createBlockPiece(0);
  assert.equal(isBlockPositionValid(board, piece), true);
  assert.equal(rotateBlockPiece(piece).shape.length, 4);
  assert.equal(getGhostY(board, piece), 19);
  const filled = board.map((row) => [...row]); filled[19] = Array(10).fill(1); filled[19][0] = 0;
  const result = lockBlockPiece(filled, { ...createBlockPiece(0), shape: [[1]], x: 0, y: 19 });
  assert.equal(result.cleared, 1);
});

test('MATCH starts without automatic matches and validates swaps', () => {
  const board = createMatchBoard(() => 0.2);
  assert.equal(findMatchGroups(board).length, 0);
  assert.equal(areMatchCellsAdjacent({ x: 0, y: 0 }, { x: 1, y: 0 }), true);
  assert.equal(areMatchCellsAdjacent({ x: 0, y: 0 }, { x: 2, y: 0 }), false);
  const swapped = swapMatchCells(board, { x: 0, y: 0 }, { x: 1, y: 0 });
  assert.equal(swapped[0][0].color, board[0][1].color);
});

test('MATCH collapse removes groups and keeps an 8 by 8 board', () => {
  const board = createMatchBoard(() => 0.42);
  const next = collapseMatchBoard(board, [[{ x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }]], () => 0.1);
  assert.equal(next.length, 8);
  assert.ok(next.every((row) => row.length === 8));
});

test('MATCH creates a special piece from a four-cell group', () => {
  const board = createMatchBoard(() => 0.61); const group = [{ x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }];
  group.forEach(({ x, y }) => { board[y][x] = { color: 2 }; });
  const next = collapseMatchBoard(board, [group], () => 0.3);
  assert.ok(next.flat().some((cell) => cell.special === 'row'));
});
