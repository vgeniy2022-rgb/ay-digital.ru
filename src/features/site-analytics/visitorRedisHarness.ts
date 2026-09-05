import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, rmdir, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { TestContext } from 'node:test';

const exec = promisify(execFile);

// Disposable real Redis: private Unix socket, no TCP, no persistence, no production env.
export async function createRedisHarness(t: TestContext) {
  const binary = process.env.REDIS_SERVER_BIN || 'redis-server';
  const cli = process.env.REDIS_CLI_BIN || 'redis-cli';
  try { await exec(binary, ['--version']); await exec(cli, ['--version']); }
  catch { t.skip('Real Redis integration requires redis-server and redis-cli on PATH.'); return null; }
  const directory = await mkdtemp(join(tmpdir(), 'sv-v2-'));
  const socket = join(directory, 'redis.sock');
  const server = spawn(binary, ['--port', '0', '--unixsocket', socket, '--unixsocketperm', '700', '--save', '', '--appendonly', 'no'], { stdio: 'ignore' });
  t.after(async () => {
    if (server.exitCode === null) { const ended = new Promise<void>((resolve) => server.once('exit', () => resolve())); server.kill('SIGTERM'); await ended; }
    await unlink(socket).catch(() => {});
    await rmdir(directory);
  });
  const command = async (args: string[]) => {
    const result = await exec(cli, ['--json', '-s', socket, ...args], { maxBuffer: 1024 * 1024 });
    return JSON.parse(result.stdout.trim());
  };
  let ready = false;
  for (let index = 0; index < 100; index++) {
    try { ready = await command(['PING']) === 'PONG'; } catch { /* socket not ready */ }
    if (ready) break;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  if (!ready) throw new Error('Isolated Redis did not start');
  const telegram: string[] = [];
  const fetchImpl = async (input: string | URL | Request, init?: RequestInit) => {
    if (String(input).includes('api.telegram.org')) {
      telegram.push(JSON.parse(String(init?.body)).text);
      return Response.json({ ok: true, result: { message_id: telegram.length } });
    }
    const commands = JSON.parse(String(init?.body)) as string[][];
    const results = [];
    for (const args of commands) {
      try { results.push({ result: await command(args.map(String)) }); }
      catch { results.push({ error: 'isolated Redis command failed' }); }
    }
    return Response.json(results);
  };
  return { command, telegram, options: { fetchImpl, environment: { KV_REST_API_URL: 'https://redis.test', KV_REST_API_TOKEN: 'test-only', TELEGRAM_BOT_TOKEN: 'test-only', TELEGRAM_CHAT_ID: 'test-only' }, now: () => Date.parse('2026-09-06T01:00:00Z') } };
}
