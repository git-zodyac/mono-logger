export interface iLogger {
  warn: (...args: any[]) => void;

  error: (...args: any[]) => void;

  info: (...args: any[]) => void;

  debug: (...args: any[]) => void;

  log: (...args: any[]) => void;

  verbose: (...args: any[]) => void;

  fatal: (...args: any[]) => void;
}

/**
 * Unified log levels enum
 */
export const LOG_LEVELS = {
  debug: 0,
  verbose: 1,
  info: 2,
  warn: 3,
  error: 4,
  fatal: 5,
} as const;

/**
 * Available log levels
 */
export type LogLevel = keyof typeof LOG_LEVELS;

/**
 * Logger configuration
 */
export interface iLoggerConfig {
  /**
   * Prefix to append before topics
   * example: 2024-07-26 21:05:28 hey_it'so me Mario! root:sub-topic
   */
  prefix?: () => string;

  /**
   * Side-effect to run when message appears
   * @param level Log level – debug, warn, info, error, verbose
   * @param topics Array of topics, sorted from root to leaf
   * @param ...messages Spread array of messages
   */
  effect?: (
    level: LogLevel,
    topics: string[],
    ...messages: any[]
  ) => void | Promise<void>;

  /**
   * Function to serialize each logged element.
   * Example
   * ```ts
   * function transformer(s: any): string {
   *  return JSON.stringify(s);
   * }
   *
   * const t_logger = new Logger(optional_parent_logger, "root", {
   *  transform: transformer,
   * });
   *
   * // or
   *
   * const tt_logger = optional_parent_logger.topic("sub-topic", {
   *  transform: transformer,
   * });
   * ```
   */
  transform?: (arg: any) => string;

  /**
   * Custom date formatter.
   * Default: 7/26/2024, 21:05:28
   */
  date_format?: (date: Date) => string;

  /**
   * Log level to display
   * Default: debug
   * Example: debug, verbose, info, warn, error, fatal
   */
  level?: LogLevel;

  /**
   * Force side-effect
   * By default, side-effect is not fired if log level is below the specified one,
   * so you might want to force running it.
   */
  force_effect?: boolean;
}
