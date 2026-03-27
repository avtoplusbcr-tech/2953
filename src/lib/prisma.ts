import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// В dev-режиме Next.js hot-reload создаёт новые экземпляры модуля.
// Храним единственный PrismaClient в global, чтобы избежать утечки соединений.
function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

const prisma = global.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;

/**
 * Retry-wrapper для Prisma-вызовов.
 * Автоматически переподключается при P1017 (Neon закрыл idle-соединение).
 * P2024 (pool timeout) тоже обрабатывается — ждём и пробуем снова.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 200
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const retryable = error?.code === 'P1017' || error?.code === 'P1001' || error?.code === 'P2024';
    if (retryable && retries > 0) {
      console.warn(`[Prisma] Ошибка ${error.code}, повтор через ${delayMs}мс (осталось попыток: ${retries})`);
      if (error?.code === 'P1017') {
        try { await prisma.$disconnect(); } catch (_) { /* ignore */ }
      }
      await new Promise(r => setTimeout(r, delayMs));
      return withRetry(fn, retries - 1, Math.min(delayMs * 2, 5000));
    }
    throw error;
  }
}
