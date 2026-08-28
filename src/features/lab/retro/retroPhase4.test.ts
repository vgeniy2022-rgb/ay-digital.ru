import assert from 'node:assert/strict';
import test from 'node:test';
import { authenticateLabServer, chatReply, connectRetroNetwork, createRetroBackup, installRetroApp, openRetroMail, parseBasic, parseRetroBackup, sanitizeRetroCss, sanitizeRetroHtml, saveMailAttachment, uninstallRetroApp } from './retroAdventure';
import { defaultRetroState, normalizeRetroState, renameRetroFile, trashRetroFile } from './retroState';

test('Phase 3 state migrates to schema 4 without losing files or systems', () => {
  const migrated = normalizeRetroState({ version: 3, files: defaultRetroState.files, selectedSystem: 'classic', visitedSystems: ['desk95', 'classic'] });
  assert.equal(migrated.version, 4); assert.equal(migrated.selectedSystem, 'classic'); assert.ok(migrated.files.some((item) => item.id === 'welcome')); assert.deepEqual(migrated.visitedSystems, ['desk95', 'classic']);
});

test('readonly system files resist rename and trash', () => {
  const renamed = renameRetroFile(defaultRetroState, 'classified', 'HACK.TXT'); const trashed = trashRetroFile(renamed, 'classified');
  assert.equal(trashed.files.find((item) => item.id === 'classified')?.name, 'OLD_LOG.TXT'); assert.equal(trashed.files.find((item) => item.id === 'classified')?.deletedAt, undefined);
});

test('virtual network connects and LAB-SERVER validates game credentials', () => {
  const connected = connectRetroNetwork(defaultRetroState); assert.equal(connected.network.connected, true);
  assert.equal(authenticateLabServer(connected, 'sysop', 'wrong').ok, false);
  const result = authenticateLabServer(connected, 'SYSOP', '1998'); assert.equal(result.ok, true); assert.equal(result.state.network.labServerUnlocked, true); assert.ok(result.state.files.some((item) => item.id === 'server-storage'));
});

test('Retro Mail tracks reads and saves attachments into Documents', () => {
  let state = openRetroMail(defaultRetroState, 'mail-core'); state = saveMailAttachment(state, 'mail-core');
  assert.ok(state.mail.readIds.includes('mail-core')); assert.ok(state.mail.savedAttachmentIds.includes('mail-core')); assert.ok(state.files.some((item) => item.name === 'ARCHIVE.SVA' && item.parentId === 'documents'));
});

test('IRC discovers #core and advances quest through a local reply', () => {
  let result = chatReply(defaultRetroState, 'general', '/join #core'); assert.equal(result.state.chat.discoveredCore, true);
  result = chatReply(result.state, 'core', 'NULL, где сервер?'); assert.ok(result.reply.includes('SYSOP')); assert.ok(result.state.quest.step >= 6);
});

test('virtual installer installs and removes only non-system applications', () => {
  const installed = installRetroApp(defaultRetroState, 'tracker'); assert.ok(installed.installedApps.includes('tracker'));
  assert.ok(uninstallRetroApp(installed, 'tracker', ['files']).installedApps.every((item) => item !== 'tracker'));
  assert.ok(uninstallRetroApp(installed, 'files', ['files']).installedApps.includes('files'));
});

test('SITEVL BASIC parser accepts safe DSL and rejects code-like commands', () => {
  assert.equal(parseBasic('PRINT "HELLO"\nWAIT 10\nLET X 1\nADD X 2').ok, true);
  const unsafe = parseBasic('EVAL alert(1)'); assert.equal(unsafe.ok, false); if (!unsafe.ok) assert.match(unsafe.error, /СТРОКА 1/);
  assert.equal(parseBasic('WAIT 50000').ok, false);
});

test('HTML LAB strips scripts, handlers, javascript URLs and remote CSS URLs', () => {
  const html = sanitizeRetroHtml('<button onclick="hack()">X</button><script>alert(1)</script><a href="javascript:bad()">A</a>');
  assert.doesNotMatch(html, /script|onclick|javascript:/i);
  assert.doesNotMatch(sanitizeRetroCss('@import "x"; body{background:url(https://x)}'), /@import|url\s*\(/i);
});

test('backup exports schema 4 and rejects incompatible input', () => {
  const backup = createRetroBackup(defaultRetroState); const parsed = parseRetroBackup(backup); assert.equal(parsed.ok, true);
  assert.equal(parseRetroBackup({ kind: 'sitevl-retro-backup', schemaVersion: 99 }).ok, false);
});
