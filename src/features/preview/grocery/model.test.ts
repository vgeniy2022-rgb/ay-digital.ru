import assert from 'node:assert/strict';
import test from 'node:test';
import { changeQuantity, concepts, estimate, fulfillment, intervals, products, total, type Amount } from './model';
test('five apples retain weight and price ranges, not a promised final price', () => {
    const apple = products.find(p => p.id === 'apples')!;
    assert.deepEqual(estimate(apple, { mode: 'pieces', quantity: 5 }), { minGrams: 800, maxGrams: 1100, min: 200, max: 275 });
    assert.equal(estimate(apple, { mode: 'kg', quantity: 1.08 }).min, 270);
});
test('cart totals add ranges and ignore unknown product keys', () => {
    assert.deepEqual(total({ apples: { mode: 'pieces', quantity: 5 }, rice: { mode: 'kg', quantity: .5 }, unknown: { mode: 'kg', quantity: 999 } }), { min: 285, max: 360 });
    assert.deepEqual(total({}), { min: 0, max: 0 });
});
test('quantity controls cannot create negative quantities or exceed demo limits', () => {
    assert.equal(changeQuantity({ mode: 'kg', quantity: 0 }, -.25).quantity, 0);
    assert.equal(changeQuantity({ mode: 'kg', quantity: 20 }, .25).quantity, 20);
    assert.equal(changeQuantity({ mode: 'pieces', quantity: 50 }, 1).quantity, 50);
    let amount: Amount = { mode: 'kg', quantity: 0 };
    for (let i = 0; i < 8; i++)
        amount = changeQuantity(amount, .25);
    assert.equal(amount.quantity, 2);
});
test('demo routing maps both dispatch points and requires manual suburb confirmation', () => {
    assert.equal(fulfillment('second'), 'Бородинская, 26');
    assert.equal(fulfillment('churkin'), 'Шоссейная, 41');
    assert.equal(fulfillment('suburb'), null);
    assert.equal(fulfillment('unknown'), null);
    assert.deepEqual(intervals, [{ id: 'evening', label: '17:00–20:00' }]);
});
test('catalog has stable unique products, local images and five distinct concepts', () => {
    assert.equal(new Set(products.map(p => p.id)).size, products.length);
    assert.deepEqual(concepts.map(c => c.id), [1, 2, 3, 4, 5]);
    assert.equal(new Set(concepts.map(c => c.name)).size, 5);
    assert.ok(products.every(p => p.price > 0 && p.image.startsWith('/preview-grocery/photos/')));
    for (const p of products)
        if (p.pieceGrams)
            assert.ok(p.pieceGrams[0] > 0 && p.pieceGrams[1] >= p.pieceGrams[0]);
});
