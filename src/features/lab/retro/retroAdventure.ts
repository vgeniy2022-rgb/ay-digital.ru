import { createRetroFile, normalizeRetroState, saveTextFile, type RetroFile, type RetroState } from './retroState';

export const retroComputers = [
  { id: 'desk95', name: 'DESK95-PC', status: 'В СЕТИ', shareId: 'shared' },
  { id: 'classic', name: 'CLASSIC-DESK', status: 'В СЕТИ', shareId: 'shared' },
  { id: 'mono', name: 'MONO-STATION', status: 'В СЕТИ', shareId: 'shared' },
  { id: 'server', name: 'LAB-SERVER', status: 'ЗАЩИЩЁН', shareId: 'server-storage' },
] as const;

export const retroMail = [
  { id: 'mail-welcome', from: 'sysop@sitevl.local', subject: 'Добро пожаловать в сеть', body: 'Три станции используют общий диск. Сетевое окружение покажет, кто сейчас доступен.', attachment: { name: 'NETWORK.TXT', content: 'LAB-SERVER отвечает только после авторизации. Начните с OLD_LOG.TXT.' } },
  { id: 'mail-core', from: 'admin@lab.local', subject: 'Не открывай CORE', body: 'Если вы это читаете, сервер снова доступен. Код разделён между MONO-STATION и дискетой.', attachment: { name: 'ARCHIVE.SVA', content: 'VIRTUAL ARCHIVE\nPASSWORD HINT: YEAR OF THE WEB' } },
  { id: 'mail-null', from: 'null@irc.local', subject: 'канал #core', body: 'В чате спросите NULL о сервере. Не ждите прямого ответа.', attachment: null },
];

export function connectRetroNetwork(state: RetroState): RetroState { return { ...state, network: { ...state.network, connected: true }, quest: advanceQuest(state.quest, 'NETWORK_CONNECTED', 1) }; }
export function authenticateLabServer(state: RetroState, user: string, password: string): { ok: boolean; state: RetroState } {
  const ok = user.trim().toLowerCase() === 'sysop' && password.trim() === '1998';
  if (!ok) return { ok: false, state };
  let next = { ...state, network: { ...state.network, connected: true, labServerUnlocked: true }, quest: advanceQuest(state.quest, 'LAB_SERVER_UNLOCKED', 7) };
  if (!next.files.some((item) => item.id === 'server-storage')) {
    const timestamp = new Date().toISOString();
    const additions: RetroFile[] = [
      { id: 'server-storage', parentId: null, name: 'LAB SERVER STORAGE', kind: 'folder', readonly: true, createdAt: timestamp, updatedAt: timestamp },
      { id: 'server-archive', parentId: 'server-storage', name: 'ARCHIVE', kind: 'folder', readonly: true, createdAt: timestamp, updatedAt: timestamp },
      { id: 'server-logs', parentId: 'server-storage', name: 'LOGS', kind: 'folder', readonly: true, createdAt: timestamp, updatedAt: timestamp },
      { id: 'server-projects', parentId: 'server-storage', name: 'PROJECTS', kind: 'folder', readonly: true, createdAt: timestamp, updatedAt: timestamp },
      { id: 'server-core', parentId: 'server-storage', name: 'CORE', kind: 'folder', hidden: true, readonly: true, createdAt: timestamp, updatedAt: timestamp },
      { id: 'server-final', parentId: 'server-core', name: 'FINAL.LOG', kind: 'text', content: 'CORE CONNECTION READY. RUN DIAGNOSTIC: SYNC THREE SYSTEMS.', readonly: true, createdAt: timestamp, updatedAt: timestamp },
    ];
    next = { ...next, files: [...next.files, ...additions] };
  }
  return { ok: true, state: next };
}

export function openRetroMail(state: RetroState, id: string): RetroState { return { ...state, mail: { ...state.mail, readIds: [...new Set([...state.mail.readIds, id])] }, quest: advanceQuest(state.quest, `MAIL_OPENED:${id}`, id === 'mail-core' ? 2 : state.quest.step) }; }
export function saveMailAttachment(state: RetroState, mailId: string): RetroState {
  const mail = retroMail.find((item) => item.id === mailId); if (!mail?.attachment || state.mail.savedAttachmentIds.includes(mailId)) return state;
  const next = createRetroFile(state, 'documents', mail.attachment.name, 'text', mail.attachment.content);
  return { ...next, mail: { ...next.mail, savedAttachmentIds: [...next.mail.savedAttachmentIds, mailId] }, quest: advanceQuest(next.quest, `ATTACHMENT_SAVED:${mailId}`, 3) };
}

export function chatReply(state: RetroState, channel: string, text: string): { reply: string; state: RetroState } {
  const command = text.trim();
  if (command === '/help') return { reply: '/join #channel · /leave · /users · /clear · /me действие', state };
  if (command === '/users') return { reply: 'SYSOP, GUEST42, MONO, NULL, ADMIN', state };
  if (command.startsWith('/join ')) { const target = command.slice(6); const allowed = ['#general', '#retro', '#lab', '#help', '#core']; if (!allowed.includes(target)) return { reply: 'Канал не найден.', state }; const discoveredCore = target === '#core' || state.chat.discoveredCore; return { reply: `Вы вошли в ${target}`, state: { ...state, chat: { joinedChannels: [...new Set([...state.chat.joinedChannels, target.replace('#', '')])], discoveredCore }, quest: advanceQuest(state.quest, `CHAT_JOINED:${target}`, target === '#core' ? 5 : state.quest.step) } }; }
  if (/null|сервер|core/i.test(command) && channel === 'core') return { reply: 'NULL: SYSOP помнит год, когда сеть должна была измениться. MONO хранит имя.', state: { ...state, quest: advanceQuest(state.quest, 'NULL_HINT', 6) } };
  if (command.startsWith('/me ')) return { reply: `* GUEST42 ${command.slice(4)}`, state };
  return { reply: 'SYSOP: Сообщение принято локальной сетью.', state };
}

export type BasicLine = { command: 'PRINT' | 'CLEAR' | 'COLOR' | 'BEEP' | 'WAIT' | 'LET' | 'ADD'; args: string[]; line: number };
export function parseBasic(source: string): { ok: true; program: BasicLine[] } | { ok: false; error: string } {
  const program: BasicLine[] = [];
  const lines = source.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index].trim(); if (!raw) continue;
    const [word, ...rest] = raw.match(/"[^"]*"|\S+/g) || [];
    const command = word?.toUpperCase() as BasicLine['command'];
    if (!['PRINT', 'CLEAR', 'COLOR', 'BEEP', 'WAIT', 'LET', 'ADD'].includes(command)) return { ok: false, error: `СТРОКА ${index + 1}: НЕИЗВЕСТНАЯ КОМАНДА` };
    if (command === 'WAIT' && (!/^\d+$/.test(rest[0] || '') || Number(rest[0]) > 3000)) return { ok: false, error: `СТРОКА ${index + 1}: WAIT ДОПУСКАЕТ 0–3000 МС` };
    program.push({ command, args: rest.map((item) => item.replace(/^"|"$/g, '')), line: index + 1 });
  }
  return { ok: true, program };
}

export async function runBasic(program: BasicLine[], onOutput: (value: string) => void, onBeep?: () => void) {
  const variables = new Map<string, number>();
  for (const line of program) {
    if (line.command === 'PRINT') onOutput(line.args.map((item) => variables.has(item) ? String(variables.get(item)) : item).join(' '));
    if (line.command === 'CLEAR') onOutput('\u0000');
    if (line.command === 'COLOR') onOutput(`[ЦВЕТ ${line.args[0] || 'DEFAULT'}]`);
    if (line.command === 'BEEP') onBeep?.();
    if (line.command === 'WAIT') await new Promise((resolve) => setTimeout(resolve, Number(line.args[0])));
    if (line.command === 'LET') variables.set(line.args[0], Number(line.args[1]) || 0);
    if (line.command === 'ADD') variables.set(line.args[0], (variables.get(line.args[0]) || 0) + (Number(line.args[1]) || 0));
  }
}

export function sanitizeRetroHtml(html: string) {
  return html
    .replace(/<\s*(script|iframe|object|embed|link|meta|base)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|iframe|object|embed|link|meta|base)\b[^>]*\/?\s*>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, '$1="#"');
}
export function sanitizeRetroCss(css: string) { return css.replace(/@import[^;]+;?/gi, '').replace(/url\s*\([^)]*\)/gi, '').replace(/expression\s*\([^)]*\)/gi, ''); }

export function installRetroApp(state: RetroState, appId: string): RetroState { return state.installedApps.includes(appId) ? state : { ...state, installedApps: [...state.installedApps, appId], quest: advanceQuest(state.quest, `APP_INSTALLED:${appId}`, 4) }; }
export function uninstallRetroApp(state: RetroState, appId: string, systemApps: string[]): RetroState { return systemApps.includes(appId) ? state : { ...state, installedApps: state.installedApps.filter((item) => item !== appId) }; }

export function advanceQuest(quest: RetroState['quest'], event: string, step: number): RetroState['quest'] { return { ...quest, step: Math.max(quest.step, step), events: [...new Set([...quest.events, event])].slice(-100), completed: quest.completed || step >= 10 }; }
export function resetRetroQuest(state: RetroState): RetroState { return { ...state, quest: { step: 0, events: [], completed: false }, network: { ...state.network, labServerUnlocked: false }, chat: { ...state.chat, discoveredCore: false } }; }

export type RetroBackup = { kind: 'sitevl-retro-backup'; schemaVersion: 4; exportedAt: string; state: RetroState };
export function createRetroBackup(state: RetroState): RetroBackup { return { kind: 'sitevl-retro-backup', schemaVersion: 4, exportedAt: new Date().toISOString(), state: { ...state, files: state.files.filter((item) => item.mimeType !== 'audio/webm' && item.mimeType !== 'image/camera') } }; }
export function parseRetroBackup(value: unknown): { ok: true; state: RetroState } | { ok: false; error: string } { if (!value || typeof value !== 'object') return { ok: false, error: 'Файл backup повреждён.' }; const candidate = value as Partial<RetroBackup>; if (candidate.kind !== 'sitevl-retro-backup' || candidate.schemaVersion !== 4 || !candidate.state) return { ok: false, error: 'Неподдерживаемая версия backup.' }; return { ok: true, state: normalizeRetroState(candidate.state) }; }

export function saveBasicProgram(state: RetroState, source: string) { return saveTextFile(state, 'basic-main', 'PROGRAM.BAS', source, 'development'); }
