const logger = {
  topics: jest.fn(() => []),
  topic: jest.fn(() => logger),
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

export default logger;
