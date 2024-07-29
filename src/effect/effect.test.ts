import { genHash } from "../__hash";

beforeAll(() => {
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

import logger from "../logger";
import { MonoEffect, PolyEffect } from "./effect";

test("Should call MonoEffect", () => {
  const effect = jest.fn();
  const mono_effect = new MonoEffect(effect);
  const t_logger = logger.topic("test", { effect: mono_effect });

  const hash = genHash();
  t_logger.debug(hash);

  expect(effect).toHaveBeenCalledTimes(1);
  const call = effect.mock.calls[0];

  expect(call).toContain(hash);
});

test("Should throw if anything but function is used as an effect in MonoEffect", () => {
  expect(() => new MonoEffect("" as any)).toThrow();
  expect(() => {
    const mono = new MonoEffect(() => {});
    new MonoEffect(mono as any);
  }).toThrow();
});

test("Should throw if invalid effect is used to create a PolyEffect", () => {
  expect(() => {
    const poly = new PolyEffect();
    poly.add("" as any);
  }).toThrow();
});

test("Should call MonoEffect if minimum log level passed", () => {
  const effect = jest.fn();
  const mono_effect = new MonoEffect(effect, "info");
  const t_logger = logger.topic("test", {
    effect: mono_effect,
  });

  const hash = genHash();
  t_logger.debug(hash);
  t_logger.warn(hash);

  expect(effect).toHaveBeenCalledTimes(1);
});

test("Should call PolyEffect", () => {
  const effect_0 = jest.fn();
  const effect_1 = jest.fn();

  const mono_effect_0 = new MonoEffect(effect_0);
  const mono_effect_1 = new MonoEffect(effect_1);
  const poly_effect = new PolyEffect();

  poly_effect.add(mono_effect_0);
  poly_effect.add(mono_effect_1);

  const t_logger = logger.topic("test", { effect: poly_effect });

  const hash = genHash();
  t_logger.debug(hash);

  expect(effect_0).toHaveBeenCalledTimes(1);
  expect(effect_1).toHaveBeenCalledTimes(1);

  const call_0 = effect_0.mock.calls[0];
  const call_1 = effect_1.mock.calls[0];

  expect(call_0).toContain(hash);
  expect(call_1).toContain(hash);
});

test("PolyEffect should call both MonoEffects and functions", () => {
  const effect_0 = jest.fn();
  const effect_1 = jest.fn();

  const mono_effect_0 = new MonoEffect(effect_0);
  const poly_effect = new PolyEffect();

  poly_effect.add(mono_effect_0);
  poly_effect.add(effect_1);

  const t_logger = logger.topic("test", { effect: poly_effect });

  const hash = genHash();
  t_logger.debug(hash);

  expect(effect_0).toHaveBeenCalledTimes(1);
  expect(effect_1).toHaveBeenCalledTimes(1);

  const call_0 = effect_0.mock.calls[0];
  const call_1 = effect_1.mock.calls[0];

  expect(call_0).toContain(hash);
  expect(call_1).toContain(hash);
});

test("PolyEffect should check minimum log level", () => {
  const effect_0 = jest.fn();
  const effect_1 = jest.fn();

  const mono_effect_0 = new MonoEffect(effect_0);
  const mono_effect_1 = new MonoEffect(effect_1);
  const poly_effect = new PolyEffect("info");

  poly_effect.add(mono_effect_0);
  poly_effect.add(mono_effect_1);

  const t_logger = logger.topic("test", { effect: poly_effect });

  const hash = genHash();
  t_logger.debug(hash);
  t_logger.warn(hash);

  expect(effect_0).toHaveBeenCalledTimes(1);
  expect(effect_1).toHaveBeenCalledTimes(1);
});

test("PolyEffect must be able to execute other PolyEffects", () => {
  const effect_0 = jest.fn();
  const effect_1 = jest.fn();

  const mono_effect_0 = new MonoEffect(effect_0);
  const mono_effect_1 = new MonoEffect(effect_1);
  const poly_effect_0 = new PolyEffect();
  const poly_effect_1 = new PolyEffect();

  poly_effect_0.add(mono_effect_0);
  poly_effect_0.add(mono_effect_1);

  poly_effect_1.add(poly_effect_0);
  poly_effect_1.add(effect_0);

  const t_logger = logger.topic("test", { effect: poly_effect_1 });

  const hash = genHash();
  t_logger.debug(hash);

  expect(effect_0).toHaveBeenCalledTimes(2);
  expect(effect_1).toHaveBeenCalledTimes(1);

  const call_0 = effect_0.mock.calls[0];
  const call_0_1 = effect_0.mock.calls[1];
  const call_1 = effect_1.mock.calls[0];

  expect(call_0).toContain(hash);
  expect(call_0_1).toContain(hash);
  expect(call_1).toContain(hash);
});
