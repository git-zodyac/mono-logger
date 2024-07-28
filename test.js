import { Logger, MonoEffect, PolyEffect } from "./dist/index.js";

const formatter = new Intl.DateTimeFormat({
  hourCycle: "h11",
});

const re_log = new Logger(
  "root", {
  prefix: () => "That's me",
  // transform: (s) => `yo ${s}`,
  date_format: formatter.format,
});

re_log.log("hello", "world", { "oi": "mate" });

const logger = new Logger();
const subLogger = logger.topic('sub-topic');
const deepSubLogger = subLogger.topic('deep-sub-topic');

deepSubLogger._parent?.log('hello, world');

deepSubLogger.debug('hello, debug');
deepSubLogger.info('hello, info');
deepSubLogger.warn('hello, warn');
deepSubLogger.error('hello, error');
deepSubLogger.fatal('hello, fatal');
deepSubLogger.log('hello, log');
deepSubLogger.verbose('hello, verbose');

const effect_0 = new MonoEffect((ts, level, topics, ...messages) => {
  console.log(`${level}, I am first mono effect! Here's what I have to say at ${ts}:`, messages);
}, 'verbose');

const effect_1 = new MonoEffect((ts, level, topics, ...messages) => {
  console.info(`${level}, I am second mono effect! My content for ${ts}:`, messages);
}, 'info');

const poly_effect = new PolyEffect();
poly_effect.add(effect_0);
poly_effect.add(effect_1);

const ex_logger = new Logger('example', {
  level: 'info',
  prefix: () => 'my-app',
  date_format: (date) => date.toISOString(),
  effect: poly_effect,
  transform: (m) => `yes, ${m}`,
  force_effect: true,
});

ex_logger.info('hello', 'me');
