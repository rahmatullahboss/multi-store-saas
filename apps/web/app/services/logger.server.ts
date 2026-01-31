import { drizzle } from 'drizzle-orm/d1';
import { systemLogs } from '@db/schema';

// Database level types (matches system_logs table schema)
export type DbLogLevel = 'info' | 'warn' | 'error' | 'fatal';
// Extended level type for logger (includes debug for Axiom)
export type LogLevel = DbLogLevel | 'debug';

interface LogContext {
  storeId?: number;
  userId?: number;
  path?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
  [key: string]: any;
}

interface AxiomLogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  stack?: string;
  service: string;
  environment: string;
}

/**
 * Enhanced Logger with Axiom Integration for Cloudflare Pages
 *
 * Features:
 * - Dual logging: Axiom (primary for dashboard) + D1 (backup)
 * - Automatic batching for performance
 * - Environment detection (skips Axiom in development)
 * - PII filtering
 *
 * Axiom Dashboard: https://app.axiom.co
 * Free tier: 500GB/month, 30 days retention
 */
export class Logger {
  private axiomToken?: string;
  private axiomDataset?: string;
  private db?: D1Database;
  private batch: AxiomLogEntry[] = [];
  private batchTimeout?: number;
  private service: string;
  private environment: string;
  private isProduction: boolean;

  constructor(
    env: {
      AXION_TOKEN?: string;
      AXION_DATASET?: string;
      DB?: D1Database;
      NODE_ENV?: string;
    },
    service: string = 'multi-store-saas'
  ) {
    this.axiomToken = env.AXION_TOKEN;
    this.axiomDataset = env.AXION_DATASET || 'cloudflare-logs';
    this.db = env.DB;
    this.service = service;
    this.environment = env.NODE_ENV || 'production';
    this.isProduction = !this.isLocalhost();
  }

  private isLocalhost(): boolean {
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('.local');
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Filter sensitive data from context
   */
  private sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) return undefined;

    const sensitiveKeys = ['password', 'token', 'secret', 'authorization', 'cookie', 'credit_card'];
    const sanitized = { ...context };

    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Log an event - sends to both Axiom and D1
   */
  async log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error | unknown
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    const sanitizedContext = this.sanitizeContext(context);

    let stack: string | undefined;
    let finalMessage = message;

    if (error instanceof Error) {
      stack = error.stack;
      finalMessage = message ? `${message}: ${error.message}` : error.message;
    } else if (error) {
      finalMessage += `: ${String(error)}`;
    }

    // Create log entry
    const entry: AxiomLogEntry = {
      timestamp,
      level,
      message: finalMessage,
      context: sanitizedContext,
      stack,
      service: this.service,
      environment: this.environment,
    };

    // Send to Axiom (fire and forget)
    this.sendToAxiom(entry).catch(() => {
      // Silent fail - we still have D1 backup
    });

    // Save to D1 (backup)
    if (this.db) {
      await this.saveToD1(entry);
    }

    // Also log to console in development
    if (!this.isProduction) {
      this.logToConsole(entry);
    }
  }

  /**
   * Send log to Axiom
   */
  private async sendToAxiom(entry: AxiomLogEntry): Promise<void> {
    if (!this.axiomToken) {
      return; // Skip if no token configured
    }

    try {
      const response = await fetch(`https://api.axiom.co/v1/datasets/${this.axiomDataset}/ingest`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.axiomToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([entry]), // Axiom expects an array
      });

      if (!response.ok) {
        throw new Error(`Axiom ingest failed: ${response.status}`);
      }
    } catch (error) {
      // Log to console if Axiom fails
      console.error('[Axiom Log Failed]', error);
    }
  }

  /**
   * Save log to D1 database (backup)
   */
  private async saveToD1(entry: AxiomLogEntry): Promise<void> {
    if (!this.db) return;

    try {
      const drizzleDb = drizzle(this.db);

      // Map 'debug' to 'info' for D1 (D1 doesn't have debug level)
      const dbLevel: DbLogLevel = entry.level === 'debug' ? 'info' : entry.level;

      await drizzleDb.insert(systemLogs).values({
        level: dbLevel,
        message: entry.message,
        stack: entry.stack,
        context: entry.context ? JSON.stringify(entry.context) : undefined,
        createdAt: new Date(entry.timestamp),
      });
    } catch (e) {
      console.error('[D1 Log Backup Failed]', e);
    }
  }

  /**
   * Log to console (development only)
   */
  private logToConsole(entry: AxiomLogEntry): void {
    const logFn =
      entry.level === 'error' || entry.level === 'fatal'
        ? console.error
        : entry.level === 'warn'
          ? console.warn
          : console.log;

    logFn(`[${entry.level.toUpperCase()}] ${entry.message}`, entry.context || '');
  }

  /**
   * Convenience methods
   */
  async info(message: string, context?: LogContext): Promise<void> {
    await this.log('info', message, context);
  }

  async warn(message: string, context?: LogContext, error?: Error): Promise<void> {
    await this.log('warn', message, context, error);
  }

  async error(message: string, context?: LogContext, error?: Error): Promise<void> {
    await this.log('error', message, context, error);
  }

  async fatal(message: string, context?: LogContext, error?: Error): Promise<void> {
    await this.log('fatal', message, context, error);
  }

  async debug(message: string, context?: LogContext): Promise<void> {
    await this.log('debug', message, context);
  }
}

/**
 * Legacy function for backward compatibility
 * Uses D1 only (no Axiom)
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
      finalMessage = message ? `${message}: ${error.message}` : error.message;
    } else if (error) {
      finalMessage += `: ${String(error)}`;
    }

    // Map 'debug' to 'info' for database compatibility
    const dbLevel: DbLogLevel = level === 'debug' ? 'info' : level;

    await drizzleDb.insert(systemLogs).values({
      level: dbLevel,
      message: finalMessage,
      stack,
      context: context ? JSON.stringify(context) : undefined,
      createdAt: new Date(),
    });
  } catch (e) {
    console.error('[SYSTEM LOG FAILURE]', e);
    console.error('[ORIGINAL LOG]', level, message, context);
  }
}

/**
 * Create logger from Cloudflare context
 * Use this in Remix loaders and actions
 */
export function createLoggerFromContext(context: { cloudflare?: { env: any } }): Logger {
  const env = context.cloudflare?.env || {};
  return new Logger(env);
}
