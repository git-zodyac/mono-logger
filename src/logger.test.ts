import logger, { Logger } from "./logger";

function genHash() {
  const ts = Math.floor(new Date().getTime() * Math.random() * 100000);
  return ts.toString(16).substring(8);
}

beforeEach(() => {
  jest.clearAllMocks();
});

jest.mock("chalk", () => ({
  magenta: jest.fn((s) => s),
  gray: jest.fn((s) => s),
  cyan: jest.fn((s) => s),
  red: jest.fn((s) => s),
  yellow: jest.fn((s) => s),
  green: jest.fn((s) => s),
}));

test("Should have default logger", () => {
  expect(logger).toBeDefined();
});

test("Default logger should not have subject", () => {
  expect(logger.topics.length).toBe(0);
});

test("Should call console.log for debug", () => {
  console.log = jest.fn();

  logger.debug("hello");

  expect(console.log).toHaveBeenCalledTimes(1);
});

test("Should call console.log for verbose", () => {
  console.log = jest.fn();

  logger.verbose("hello");

  expect(console.log).toHaveBeenCalledTimes(1);
});

test("Should call console.log for log", () => {
  console.log = jest.fn();

  logger.log("hello");

  expect(console.log).toHaveBeenCalledTimes(1);
});

test("Should call console.info for info", () => {
  console.info = jest.fn();

  logger.info("hello");

  expect(console.info).toHaveBeenCalledTimes(1);
});

test("Should call console.warn for warn", () => {
  console.warn = jest.fn();
  logger.warn("hello");

  expect(console.warn).toHaveBeenCalledTimes(1);
});

test("Should call console.error for error", () => {
  console.error = jest.fn();

  logger.error("hello");

  expect(console.error).toHaveBeenCalledTimes(1);
});

test("Should call console.error for fatal", () => {
  console.error = jest.fn();

  logger.fatal("hello");

  expect(console.error).toHaveBeenCalledTimes(1);
});

test("Should include given content", () => {
  console.log = jest.fn();
  const hash_0 = genHash();
  const hash_1 = genHash();
  const hash_2 = genHash();

  logger.debug(hash_0, hash_1, hash_2);

  const call = (console.log as jest.Mock).mock.calls[0];

  expect(call).toContain(hash_0);
  expect(call).toContain(hash_1);
  expect(call).toContain(hash_2);
});

test("Should include link to parent topic", () => {
  const descendant = logger.topic("");
  expect(descendant._parent).toBe(logger);
});

test("Should include date", () => {
  console.log = jest.fn();
  logger.debug("hello");

  const call = (console.log as jest.Mock).mock.calls[0];
  const date_arg = call.find((e: string) =>
    e.match(/(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])\/\d{4}/g),
  );

  expect(date_arg).toBeDefined();
});

test("Should include time", () => {
  console.log = jest.fn();
  logger.debug("hello");

  const call = (console.log as jest.Mock).mock.calls[0];
  const time_arg = call.find((e: string) =>
    e.match(/(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d/g),
  );

  expect(time_arg).toBeDefined();
});

test("Should include parent topics", () => {
  const hash_0 = genHash();
  const topic_0 = logger.topic(hash_0);

  const hash_1 = genHash();
  const topic_1 = topic_0.topic(hash_1);

  expect(topic_0).not.toContain(hash_1);
  expect(topic_1.topics).toContain(hash_0);
  expect(topic_1.topics).toContain(hash_1);
});

test("Should call side effect", () => {
  const effect = jest.fn();
  const t_logger = logger.topic("test", { effect });

  const hash = genHash();
  t_logger.debug(hash);

  expect(effect).toHaveBeenCalledTimes(1);
  const call = effect.mock.calls[0];

  expect(call).toContain(hash);
});

test("Should call transformer per element", () => {
  console.log = jest.fn();

  const t_hash = genHash();
  const transform = jest.fn((s) => `${t_hash}_${s}`);
  const t_logger = logger.topic("test", { transform });

  const hash_0 = genHash();
  const hash_1 = genHash();
  t_logger.debug(hash_0, hash_1);

  expect(transform).toHaveBeenCalledTimes(2);
  expect(console.log).toHaveBeenCalledTimes(1);

  const call = (console.log as jest.Mock).mock.calls[0];
  expect(call).toContain(`${t_hash}_${hash_0}`);
  expect(call).toContain(`${t_hash}_${hash_1}`);
});

test("Should ignore message if log level is higher", () => {
  console.log = jest.fn();
  console.info = jest.fn();

  const t_logger = logger.topic("test", {
    level: "verbose",
  });

  t_logger.debug("debug");
  expect(console.log).not.toHaveBeenCalled();

  t_logger.info("info");
  expect(console.info).toHaveBeenCalled();
});

test("Should run side effect if forced", () => {
  console.log = jest.fn();
  const effect = jest.fn();

  const t_logger = logger.topic("test", {
    level: "verbose",
    force_effect: true,
    effect,
  });

  t_logger.debug("debug");
  expect(console.log).not.toHaveBeenCalled();
  expect(effect).toHaveBeenCalled();
});

test("Should be instanced with new keyword", () => {
  const hash = genHash();
  const logger = new Logger(undefined, hash);

  expect(logger.topics[0]).toBe(hash);
});

test("Should be able to use custom date formatter", () => {
  console.log = jest.fn();

  const hash = genHash();
  const date_format = jest.fn(() => hash);
  const logger = new Logger(undefined, undefined, {
    date_format,
  });

  logger.debug("test");

  expect(date_format).toHaveBeenCalledTimes(1);
  const call = (console.log as jest.Mock).mock.calls[0];

  expect(call[0].startsWith(hash)).toBe(true);
});

test("Should include prefix", () => {
  const hash = genHash();
  const prefix = jest.fn(() => hash);
  const logger = new Logger(undefined, undefined, {
    prefix,
  });

  logger.debug("test");

  expect(prefix).toHaveBeenCalledTimes(1);
  const call = (console.log as jest.Mock).mock.calls[0];

  expect(call[0].endsWith(hash)).toBe(true);
});
