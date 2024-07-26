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

export class Logger implements iLogger {
  constructor(
    public readonly _parent?: Logger,
    private readonly subject?: string,
    private readonly _config?: iLoggerConfig,
  ) {}

  // Factories
  public topic(topic: string, opts?: iLoggerConfig): Logger {
    return new Logger(this, topic, opts ?? this._config);
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

  public get topics(): string[] {
    const prefix = this._parent ? this._parent.topics : [];
    if (this.subject) return [...prefix, this.subject];
    return prefix;
  }

  private _transform(args: any[]) {
    return args.map((el) => {
      if (this._config?.transform) return this._config.transform(el);
      return el;
    });
  }

  // Methods
  public log = (...args: any[]) => this._log("debug", args);

  public debug = (...args: any[]) => this._log("debug", args);

  public verbose = (...args: any[]) => this._log("verbose", args);

  public info = (...args: any[]) => this._log("info", args);

  public warn = (...args: any[]) => this._log("warn", args);

  public error = (...args: any[]) => this._log("error", args);

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
