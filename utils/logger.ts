type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m',
  info: '\x1b[32m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
};
const RESET = '\x1b[0m';

class Logger {
  private tag: string;

  constructor(tag: string) {
    this.tag = tag;
  }

  debug(message: string, ...args: any[]) {
    if (__DEV__) console.log(`${LOG_COLORS.debug}[${this.tag}]${RESET} ${message}`, ...args);
  }

  info(message: string, ...args: any[]) {
    console.log(`${LOG_COLORS.info}[${this.tag}]${RESET} ${message}`, ...args);
  }

  warn(message: string, ...args: any[]) {
    console.warn(`${LOG_COLORS.warn}[${this.tag}]${RESET} ${message}`, ...args);
  }

  error(message: string, ...args: any[]) {
    console.error(`${LOG_COLORS.error}[${this.tag}]${RESET} ${message}`, ...args);
  }
}

export const createLogger = (tag: string) => new Logger(tag);
export default { createLogger };
