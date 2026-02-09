import { vi } from "vitest";

const logger = {
  topics: vi.fn(() => []),
  topic: vi.fn(() => logger),
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  fatal: vi.fn(),
};

export default logger;
