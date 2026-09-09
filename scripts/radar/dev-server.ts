import { createServer } from 'node:http';
import { createServer as createViteServer, loadEnv } from 'vite';
import { createRadarHandler } from '../../radar/server/handler';

// Local only. No remote secret pulls. No fixture fallback in this server.
const env = { ...loadEnv('development', process.cwd(), ''), ...process.env };
const port = 4185;
const handler = createRadarHandler({ env: { ...env, RADAR_ORIGIN: `http://localhost:${port}` } });
const vite = await createViteServer({ server: { middlewareMode: true, hmr: { port: 24885 } }, appType: 'spa' });
const server = createServer((request, response) => {
  if (request.url?.split('?')[0] === '/api/radar') { void handler(request, response); return; }
  if (request.url?.startsWith('/api/')) { response.writeHead(503, { 'Content-Type': 'application/json' }); response.end('{"error":"LOCAL_PUBLIC_API_DISABLED"}'); return; }
  vite.middlewares(request, response, () => { response.writeHead(404); response.end(); });
});
server.listen(port, '127.0.0.1', () => console.log(`Radar local development: http://localhost:${port}/radar (no production API proxy)`));
async function close() { server.close(); await vite.close(); }
process.once('SIGTERM', () => void close()); process.once('SIGINT', () => void close());
