/**
 * Production-safe logging utility
 * Replaces console.log statements with proper logging
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

class Logger {
  private level: LogLevel;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.level = this.isProduction ? LogLevel.ERROR : LogLevel.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    return `[${timestamp}] ${level}: ${message}${dataStr}`;
  }

  error(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO) && !this.isProduction) {
      console.info(this.formatMessage('INFO', message, data));
    }
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG) && !this.isProduction) {
      console.log(this.formatMessage('DEBUG', message, data));
    }
  }

  // Silent methods for production (no-op)
  silentLog(_message: string, _data?: any): void {
    // No-op in production, prevents console.log leaks
  }

  silentError(_message: string, _data?: any): void {
    // Only log critical errors in production
    if (this.isProduction) {
      // Could send to error tracking service instead
    }
  }
}

export const logger = new Logger();

// Production-safe replacements for console methods
export const safeLog = {
  log: (message: string, data?: any) => logger.debug(message, data),
  error: (message: string, data?: any) => logger.error(message, data),
  warn: (message: string, data?: any) => logger.warn(message, data),
  info: (message: string, data?: any) => logger.info(message, data),
  silent: (message: string, data?: any) => logger.silentLog(message, data)
};
