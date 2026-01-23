import { drizzle } from 'drizzle-orm/d1';
import { systemLogs } from '@db/schema';

export type LogLevel = 'info' | 'warn' | 'error' | 'fatal';

/**
 * Log a system event to the database consistently.
 * Safe to use anywhere D1 is available.
 */
export async function logSystemEvent(
  db: D1Database, 
  level: LogLevel, 
  message: string, 
  context?: Record<string, any>, 
  error?: Error | unknown
) {
  try {
    const drizzleDb = drizzle(db);
    
    let stack: string | undefined;
    let finalMessage = message;

    if (error instanceof Error) {
      stack = error.stack;
      // If message provided, append error message. If generic message, keep it.
      if (message) finalMessage = `${message}: ${error.message}`;
      else finalMessage = error.message;
    } else if (error) {
       finalMessage += `: ${String(error)}`;
    }

    // Context handling
    const safeContext = context ? JSON.stringify(context) : undefined;

    await drizzleDb.insert(systemLogs).values({
      level,
      message: finalMessage,
      stack,
      context: safeContext,
      createdAt: new Date(),
    });

  } catch (e) {
    // Failsafe: Log to console if DB fails
    console.error('[SYSTEM LOG FAILURE]', e);
    console.error('[ORIGINAL LOG]', level, message, context);
  }
}
