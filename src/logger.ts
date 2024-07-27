import chalk, { type ForegroundColorName } from "chalk";
import { LOG_LEVELS, type LogLevel, type iLogger, type iLoggerConfig } from "./types";

const DEFAULT_FORMATTER = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: false,
  month: "numeric",
  day: "numeric",
  year: "numeric",
});

const COLORS: Record<LogLevel, ForegroundColorName> = {
  debug: "gray",
  warn: "yellow",
  info: "green",
  error: "red",
  verbose: "cyan",
  fatal: "magenta",
};

const CODES: Record<LogLevel, string> = {
  debug: "DBG",
  warn: "WRN",
  info: "INF",
  error: "ERR",
  verbose: "VRB",
  fatal: "FTL",
};

const METHOD: Record<LogLevel, "log" | "info" | "warn" | "error"> = {
  debug: "log",
  verbose: "log",
  info: "info",
  warn: "warn",
  error: "error",
  fatal: "error",
};

/**
 * Logger instance
 *
 * You can create one to be your new root by calling
 * ```ts
 * import { Logger } from "@bebrasmell/mono-logger";
 *
 * const root_logger = new Logger();
 * ```
 *
 * Or you can use the default or existing logger to create a sub-topic
 * ```ts
 * import logger from "@bebrasmell/mono-logger";
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
  constructor(
    private readonly subject?: string,
    private readonly _config?: iLoggerConfig,
    public readonly _parent?: Logger,
  ) {}

  /**
   * A list of topics for current logger instance.
   * The list will include all the parents topics ordered from **root** logger to **leaf**
  */
  public get topics(): string[] {
    const prefix = this._parent ? this._parent.topics : [];
    if (this.subject) return [...prefix, this.subject];
    return prefix;
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
  private get timestamp() {
    const ts = new Date();

    if (this._config?.date_format) return this._config?.date_format(ts);
    return DEFAULT_FORMATTER.format(ts);
  }

  private display_params(lvl: LogLevel) {
    const display_ts = chalk.gray(this.timestamp);
    const level = `[${chalk[COLORS[lvl]](CODES[lvl])}]`;
    const topics = this.topics.map((t) => chalk.magenta(t)).join(":");

    let output = `${display_ts} ${level}`;
    if (this._config?.prefix) output += ` ${this._config?.prefix()}`;
    if (topics) output += ` ${topics}`;

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
   * Uses ```console.log```
   * @param ...arg {any} Message or object to log
   */
  public log = (...args: any[]) => this._log("debug", args);

  /**
   * Logs a ```DEBUG``` message
   * Uses ```console.log```
   * @param ...arg {any} Message or object to log
   */
  public debug = (...args: any[]) => this._log("debug", args);

  /**
   * Logs a ```VERBOSE``` message
   * Uses ```console.verbose```
   * @param ...arg {any} Message or object to log
   */
  public verbose = (...args: any[]) => this._log("verbose", args);

  /**
   * Logs an ```INFO``` message
   * Uses ```console.info```
   * @param ...arg {any} Message or object to log
   */
  public info = (...args: any[]) => this._log("info", args);

  /**
   * Logs a ```WARN``` message
   * Uses ```console.warn```
   * @param ...arg {any} Message or object to log
   */
  public warn = (...args: any[]) => this._log("warn", args);

  /**
   * Logs an ```ERROR``` message
   * Uses ```console.error```
   * @param ...arg {any} Message or object to log
   */
  public error = (...args: any[]) => this._log("error", args);

  /**
   * Logs a ```FATAL``` error message
   * Uses ```console.error```
   * @param ...arg {any} Message or object to log
   */
  public fatal = (...args: any[]) => this._log("fatal", args);

  private _log(level: LogLevel, args: any[]) {
    if (LOG_LEVELS[this._config?.level ?? "debug"] > LOG_LEVELS[level]) {
      if (this._config?.force_effect) {
        this._config.effect?.(level, this.topics, ...args);
      }

      return;
    }

    const transformed = this._transform(args);
    console[METHOD[level]](this.display_params(level), ...transformed);
    this._config?.effect?.(level, this.topics, ...args);
  }
}

export default new Logger();
