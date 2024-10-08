import { LOG_LEVELS, type LogLevel, type TEffect, type iEffect } from "../types";

export class MonoEffect implements iEffect {
  constructor(
    public readonly effect: TEffect,
    public readonly level?: LogLevel,
  ) {
    if (typeof effect !== "function") {
      throw new Error("MonoLogger/MonoEffect: effect must be a function");
    }

    if (level) {
      this.apply = (ts, input_level, topics, ...messages) => {
        if (LOG_LEVELS[input_level] >= LOG_LEVELS[level]) {
          return effect(ts, input_level, topics, ...messages);
        }
      };
    } else {
      this.apply = effect;
    }
  }

  public apply: TEffect;
}

export class PolyEffect implements iEffect {
  constructor(public readonly level?: LogLevel) {}

  private _effects: (TEffect | iEffect)[] = new Array(0);
  public readonly effect: TEffect = (ts, input_level, topics, ...messages) => {
    if (this.level && LOG_LEVELS[input_level] < LOG_LEVELS[this.level]) return;
    for (const effect of this._effects) {
      if (effect instanceof MonoEffect || effect instanceof PolyEffect) {
        effect.apply(ts, input_level, topics, ...messages);
      } else if (typeof effect === "function") {
        effect(ts, input_level, topics, ...messages);
      }
    }
  };

  public add(effect: TEffect | iEffect) {
    if (
      typeof effect !== "function" &&
      !(effect instanceof MonoEffect) &&
      !(effect instanceof PolyEffect)
    ) {
      throw new Error(
        "MonoLogger/PolyEffect: Effect must be a function, MonoEffect or PolyEffect",
      );
    }

    this._effects.push(effect);
  }

  public apply: TEffect = this.effect.bind(this);
}
