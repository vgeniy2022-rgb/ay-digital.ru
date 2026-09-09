import { createServer } from 'node:http';
import { createServer as createViteServer } from 'vite';
import { createRadarHandler } from '../../radar/server/handler';
import { fixtureFetch, TEST_ENV, TestRateGate } from '../../radar/tests/harness';

// Explicit, local-only UI test harness. Not imported by production; no environment credentials.
if (process.env.VERCEL || process.env.NODE_ENV === 'production') throw new Error('QA_SERVER_FORBIDDEN_IN_PRODUCTION');
const handler = createRadarHandler({ env: TEST_ENV, fetchImpl: fixtureFetch, rateGate: new TestRateGate() });
const vite = await createViteServer({ server: { middlewareMode: true, hmr: { port: 24886 } }, appType: 'spa' });
const server = createServer((request, response) => {
  if (request.url?.split('?')[0] === '/api/radar') {
    // Mark fixture evidence in response without changing the production handler.
    response.setHeader('X-Sitevl-QA-Fixture', 'true');
    void handler(request, response); return;
  }
  if (request.url?.startsWith('/api/')) { response.writeHead(503, { 'Content-Type': 'application/json' }); response.end('{"error":"QA_PUBLIC_API_DISABLED"}'); return; }
  vite.middlewares(request, response, () => { response.writeHead(404); response.end(); });
});
server.listen(4186, '127.0.0.1', () => console.log('QA FIXTURE ONLY: http://localhost:4186/radar — fake external auth/database, real Radar handler; zero production writes.'));
async function close() { server.close(); await vite.close(); }
process.once('SIGTERM', () => void close()); process.once('SIGINT', () => void close());
