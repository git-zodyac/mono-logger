import type { LogLevel } from "types";

export const COLORS: Record<LogLevel, (s: string) => string> = {
  debug: (s) => `\u001b[90m${s}\u001b[39m`,
  warn: (s) => `\u001b[33m${s}\u001b[39m`,
  info: (s) => `\u001b[32m${s}\u001b[39m`,
  error: (s) => `\u001b[31m${s}\u001b[39m`,
  verbose: (s) => `\u001b[36m${s}\u001b[39m`,
  fatal: (s) => `\u001b[35m${s}\u001b[39m`,
};

