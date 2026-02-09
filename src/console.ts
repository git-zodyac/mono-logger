import { LogLevel, TLogImplementation } from "./types";

const METHOD: Record<LogLevel, "log" | "info" | "warn" | "error"> = {
  debug: "log",
  verbose: "log",
  info: "info",
  warn: "warn",
  error: "error",
  fatal: "error",
};

export const DEFAULT_IMPL: TLogImplementation = (level, paramsStr, ...args) => {
  console[METHOD[level]](paramsStr, ...args);
};
