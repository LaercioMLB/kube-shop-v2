import assert from 'node:assert/strict';
const base = (process.argv[2] || 'http://frontend:8080').replace(/\/$/, '');
const get = async (route) => {
  const response = await fetch(base + route, { signal: AbortSignal.timeout(10000) });
  assert.equal(response.status, 200, route);
  return response.json();
};
const html = await fetch(base, { signal: AbortSignal.timeout(10000) });
assert.equal(html.status, 200);
assert.match(await html.text(), /KubeShop/);
await get('/api/health/ready');
const { products } = await get('/api/products');
assert.equal(products.length, 6);
const created = await fetch(base + '/api/orders', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ items: [{ productId: products[0].id, quantity: 1 }] }),
  signal: AbortSignal.timeout(10000),
});
assert.equal(created.status, 201);
const { order } = await created.json();
assert.ok((await get('/api/orders')).orders.some(row => row.id === order.id));
for (const route of ['/api/metrics', '/api/lab/cpu']) {
  assert.equal((await fetch(base + route)).status, 404);
}
console.log(JSON.stringify({ result: 'PASS', orderId: order.id, checks: 'frontend, proxy, saúde, catálogo, criação e consulta de pedido' }));
