import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

// Isolated disposable Postgres, no remote URLs/credentials. Unix socket only, directory mode 0700.
const root = mkdtempSync(join(tmpdir(), 'sitevl-radar-pg-'));
const port = '55479';
const run = (command, args, input) => execFileSync(command, args, { input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
const psql = sql => run('psql', ['-X', '-h', root, '-p', port, '-d', 'postgres', '-v', 'ON_ERROR_STOP=1'], sql);
let started = false;
try {
  run('initdb', ['-D', join(root, 'data'), '--auth=trust', '--no-locale', '--encoding=UTF8']);
  run('pg_ctl', ['-D', join(root, 'data'), '-l', join(root, 'postgres.log'), '-o', `-h '' -k ${root} -p ${port}`, '-w', 'start']); started = true;
  psql(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;`);
  const migration = readdirSync('supabase/migrations').find(name => name.endsWith('_radar_foundation.sql'));
  if (!migration) throw new Error('Missing Radar migration');
  psql(readFileSync(join('supabase/migrations', migration), 'utf8'));
  psql(readFileSync('radar/tests/database.sql', 'utf8'));
  console.log(JSON.stringify({ status: 'PASS', scope: 'isolated PostgreSQL migration + RLS + dedup + feedback + outbox; not hosted Supabase Auth', artifactDirectory: root }));
} catch (error) {
  // This subprocess has no secrets or remote data. Keep actionable SQL errors, not environment.
  console.error(error instanceof Error ? error.message : 'DATABASE_TEST_FAILED');
  process.exitCode = 1;
} finally {
  if (started) run('pg_ctl', ['-D', join(root, 'data'), '-m', 'fast', '-w', 'stop']);
}
