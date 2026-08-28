import assert from 'node:assert/strict';
import test from 'node:test';
import { createCanvasItem, hitCanvasItem, initialCanvasDocument, normalizeCanvasDocument } from './canvasModel';

test('initial infinite canvas contains valid hidden LAB portals', () => {
  const portals = initialCanvasDocument.items.filter((item) => item.type === 'portal');
  assert.equal(portals.length, 3);
  assert.ok(portals.every((item) => item.href?.startsWith('/lab/')));
});

test('canvas normalization removes broken items and dangling connections', () => {
  const normalized = normalizeCanvasDocument({
    items: [initialCanvasDocument.items[0], { id: 'broken' }],
    connections: [{ id: 'valid', from: 'welcome', to: 'welcome' }, { id: 'dangling', from: 'welcome', to: 'missing' }],
  });
  assert.equal(normalized.items.length, 1);
  assert.deepEqual(normalized.connections, [{ id: 'valid', from: 'welcome', to: 'welcome' }]);
});

test('new canvas objects are editable and hit-tested from top to bottom', () => {
  const first = createCanvasItem('note', 10, 20);
  const second = createCanvasItem('rect', 20, 30);
  assert.notEqual(first.id, second.id);
  assert.equal(hitCanvasItem([first, second], 30, 40)?.id, second.id);
});
