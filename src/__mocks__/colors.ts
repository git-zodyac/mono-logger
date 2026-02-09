import { vi } from 'vitest';

export const COLORS = {
  debug: vi.fn((s) => s),
  warn: vi.fn((s) => s),
  info: vi.fn((s) => s),
  error: vi.fn((s) => s),
  verbose: vi.fn((s) => s),
  fatal: vi.fn((s) => s),
};
