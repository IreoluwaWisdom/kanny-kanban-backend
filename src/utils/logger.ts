/**
 * Logger utility for backend
 * Provides structured logging with environment awareness
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.log(`[LOG] ${message}`, ...args);
    }
  },
  error: (message: string, error?: unknown) => {
    // Always log errors
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  info: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
};

