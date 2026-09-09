import type { Environment } from '../config';
export function redisConfiguration(environment: Environment): { url?: string; token?: string };
export function redisPipeline(commands: (string | number)[][], options?: { environment?: Environment; fetchImpl?: typeof fetch; timeoutMs?: number }): Promise<{ result?: unknown; error?: unknown }[]>;
export function telegramConfiguration(environment: Environment): { token?: string; chatId?: string };
