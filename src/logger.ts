import { COLORS } from "./colors";
import { DEFAULT_IMPL } from "./console";
import { MonoEffect, PolyEffect } from "./effect";
import type { iLogger, iLoggerConfig, LogLevel, TLogImplementation } from "./types";
import { LOG_LEVELS } from "./types";

const DEFAULT_FORMATTER = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: false,
  month: "numeric",
  day: "numeric",
  year: "numeric",
});

export const CODES: Record<LogLevel, string> = {
  debug: "DBG",
  warn: "WRN",
  info: "INF",
  error: "ERR",
  verbose: "VRB",
  fatal: "FTL",
};

/**
 * Logger instance
 *
 * You can create one to be your new root by calling
 * ```ts
 * import { Logger } from "@zodyac/mono-logger";
 *
 * const root_logger = new Logger();
 * ```
 *
 * Or you can use the default or existing logger to create a sub-topic
 * ```ts
 * import logger from "@zodyac/mono-logger";
 *
 * const app_logger = logger.topic("My_app_root_topic");
 * ```
 *
 * Logger constructor accepts these params:
 * @param subject {string} A topic (optional)
 * @param config {iLoggerConfig} Configuration (see Docs)
 * @param parent {Logger} Ancestor logger to inherit from
 */
export class Logger implements iLogger {
  /**
   * A list of topics for current logger instance.
   * The list will include all the parents topics ordered from **root** logger to **leaf**
   */
  public readonly topics: string[];
  private readonly _topicsStr: string;

  private readonly _dateFormatter: (date: Date) => string;
  private readonly _impl: TLogImplementation;

  constructor(
    private readonly subject?: string,
    public readonly _config?: iLoggerConfig,
    public readonly _parent?: Logger,
  ) {
    const prefix = this._parent ? this._parent.topics : [];
    this.topics = this.subject ? [...prefix, this.subject] : prefix;
    this._topicsStr = this.topics.map((t) => COLORS["fatal" as const](t)).join(":");
    this._dateFormatter = _config?.dateFormatter ?? DEFAULT_FORMATTER.format;
    this._impl = _config?.implementation ?? this._parent?._impl ?? DEFAULT_IMPL;
  }

  // Factories
  /**
   * Create a new descendant logger with specified topic
   * @param topic {string} New logger topic name
   * @param opts {iLoggerConfig} New logger configuration (if not provided, will use it's ancestors config)
   * @returns A new Logger with specified topic
   */
  public topic(topic: string, opts?: iLoggerConfig): Logger {
    return new Logger(topic, opts ?? this._config, this);
  }

  // Formatters
  private displayParams(ts: Date, lvl: LogLevel) {
    const display_ts = COLORS["debug" as const](this._dateFormatter(ts));
    const level = `[${COLORS[lvl](CODES[lvl])}]`;
    let output = `${display_ts} ${level}`;

    if (this._config?.prefix) output += ` ${this._config?.prefix()}`;
    if (this._topicsStr) output += ` ${this._topicsStr}`;

    return output;
  }

  private _transform(args: any[]) {
    return args.map((el) => {
      if (this._config?.transform) return this._config.transform(el);
      return el;
    });
  }

  // Methods
  /**
   * Alias for ```DEBUG``` method.
   * Uses ```console.log``` or custom implementation
   * @param ...arg {any} Message or object to log
   */
  public log = (...args: any[]) => this._log("debug", args);

  /**
   * Logs a ```DEBUG``` message
   * Uses ```console.log``` or custom implementation
   * @param ...arg {any} Message or object to log
   */
  public debug = (...args: any[]) => this._log("debug", args);

  /**
   * Logs a ```VERBOSE``` message
   * Uses ```console.verbose``` or custom implementation
   * @param ...arg {any} Message or object to log
   */
  public verbose = (...args: any[]) => this._log("verbose", args);

  /**
   * Logs an ```INFO``` message
   * Uses ```console.info``` or custom implementation
   * @param ...arg {any} Message or object to log
   */
  public info = (...args: any[]) => this._log("info", args);

  /**
   * Logs a ```WARN``` message
   * Uses ```console.warn``` or custom implementation
   * @param ...arg {any} Message or object to log
   */
  public warn = (...args: any[]) => this._log("warn", args);

  /**
   * Logs an ```ERROR``` message
   * Uses ```console.error``` or custom implementation
   * @param ...arg {any} Message or object to log
   */
  public error = (...args: any[]) => this._log("error", args);

  /**
   * Logs a ```FATAL``` error message
   * Uses ```console.error``` or custom implementation
   * @param ...arg {any} Message or object to log
   */
  public fatal = (...args: any[]) => this._log("fatal", args);

  private _log(level: LogLevel, args: any[]) {
    const ts = new Date();

    if (LOG_LEVELS[this._config?.level ?? "debug"] > LOG_LEVELS[level]) {
      if (this._config?.forceEffect) this._runEffect(ts, level, this.topics, ...args);
      return;
    }

    const msgParams = this.displayParams(ts, level);
    const transformed = this._transform(args);

    this._impl(level, msgParams, ...transformed);
    this._runEffect(ts, level, ...args);
  }

  private _runEffect(ts: Date, level: LogLevel, ...messages: any[]) {
    const effect = this._config?.effect;
    if (!effect) return;

    if (effect instanceof MonoEffect || effect instanceof PolyEffect) {
      effect.apply(ts, level, this.topics, ...messages);
    } else if (typeof effect === "function") {
      effect(ts, level, this.topics, ...messages);
    }
  }
}

export default new Logger();
