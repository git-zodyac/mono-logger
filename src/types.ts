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

export type TEffect = (
  timestamp: Date,
  level: LogLevel,
  topics: string[],
  ...messages: any[]
) => void | Promise<void>;

/**
 * Logger configuration
 */
export interface iLoggerConfig {
  /**
   * Prefix to append before topics
   * @example 2024-07-26 21:05:28 MY_APP_VERSION root:sub-topic
   */
  readonly prefix?: () => string;

  /**
   * Side-effect to run when message appears
   * @param timestamp {Date} Timestamp
   * @param level {LogLevel} Log level (debug, warn, info, error, verbose)
   * @param topics {string[]} Array of topics, sorted from root to leaf
   * @param ...messages {any[]} Spread array of messages
   */
  readonly effect?: TEffect | iEffect;

  /**
   * Function to serialize each logged element.
   * @param arg {any} logged item
   *
   * @example
   * ```ts
   * function transformer(s: any): string {
   *  return JSON.stringify(s);
   * }
   *
   * const t_logger = new Logger("root", {
   *  transform: transformer,
   * }, optional_parent_logger);
   *
   * // or
   *
   * const tt_logger = optional_parent_logger.topic("sub-topic", {
   *  transform: transformer,
   * });
   * ```
   */
  readonly transform?: (arg: any) => string;

  /**
   * Custom date formatter.
   * @param date {Date} Input date
   * @returns Formatted date string
   * @example 7/26/2024, 21:05:28
   */
  readonly date_format?: (date: Date) => string;

  /**
   * Log level to display
   * @default debug
   * @example debug, verbose, info, warn, error, fatal
   */
  readonly level?: LogLevel;

  /**
   * Force side-effect
   * By default, side-effect is not fired if log level is below the specified one,
   * so you might want to force running it.
   *
   * @default false
   */
  readonly force_effect?: boolean;
}

/**
 * Base effect description
 */
export interface iEffect {
  /**
   * Minimum log level to apply effect
   */
  readonly level?: LogLevel;

  /**
   * Effect runner
   */
  readonly apply: TEffect;
}
