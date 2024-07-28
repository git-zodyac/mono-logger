import type { LogLevel, TEffect, iEffect } from "../types";
import { LOG_LEVELS } from "../types";

export class MonoEffect implements iEffect {
  constructor(
    public readonly effect: TEffect,
    public readonly level?: LogLevel,
  ) {
    if (level) {
      this.apply = (input_level, topics, ...messages) => {
        if (LOG_LEVELS[input_level] >= LOG_LEVELS[level]) {
          return effect(level, topics, ...messages);
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

  private _effects: (TEffect | MonoEffect)[] = new Array(0);
  public readonly effect: TEffect = (level, topics, ...messages) => {
    if (this.level && LOG_LEVELS[level] < LOG_LEVELS[this.level]) return;
    for (const effect of this._effects) {
      if (effect instanceof MonoEffect) effect.apply(level, topics, ...messages);
      else effect(level, topics, ...messages);
    }
  };

  public add(effect: TEffect | MonoEffect) {
    this._effects.push(effect);
  }

  public apply: TEffect = this.effect.bind(this);
}
