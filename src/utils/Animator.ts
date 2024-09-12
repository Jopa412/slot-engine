import * as PIXI from 'pixi.js';

export type Easing = (t: number) => number;
export interface Tween {
  object: any;
  property: string;
  target: number;
  time: number;
  easing: Easing;
  propertyBeginValue: any;
  change: (tween: Tween) => void;
  complete: (tween: Tween) => void;
  start: number;
}

export const lerp = (a1: number, a2: number, t: number): number => {
  return a1 * (1 - t) + a2 * t;
};

export const backout = (amount: number): Easing => {
  return (t) => --t * t * ((amount + 1) * t + amount) + 1;
};

class Animator {
  tweening: Tween[] = [];

  constructor(ticker: PIXI.Ticker) {
    ticker.add(this.tweensInvoker);
  }

  tweensInvoker = (): void => {
    const now = Date.now();
    const remove = [];
    for (let i = 0; i < this.tweening.length; i++) {
      const t = this.tweening[i];
      const phase = Math.min(1, (now - t.start) / t.time);

      (t.object as any)[t.property] = lerp(t.propertyBeginValue, t.target, t.easing(phase));
      if (t.change) t.change(t);
      if (phase === 1) {
        (t.object as any)[t.property] = t.target;
        if (t.complete) t.complete(t);
        remove.push(t);
      }
    }
    for (let i = 0; i < remove.length; i++) {
      this.tweening.splice(this.tweening.indexOf(remove[i]), 1);
    }
  };

  tweenTo(
    object: any,
    property: string,
    target: number,
    time: number,
    easing: Easing,
    onchange: () => void,
    oncomplete: () => void,
  ): Tween {
    const tween: Tween = {
      object,
      property,
      propertyBeginValue: object[property],
      target,
      easing,
      time,
      change: onchange,
      complete: oncomplete,
      start: Date.now(),
    };

    this.tweening.push(tween);

    return tween;
  }
}

export default Animator;
