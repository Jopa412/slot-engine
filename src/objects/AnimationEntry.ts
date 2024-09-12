import * as PIXI from 'pixi.js';
import RenderObject from './RenderObject';
import EventManager from '../managers/EventManager';
import { ease } from 'pixi-ease';
import { vw, vh } from '../utils/size';
import { hide } from '../utils/helpers';

class AnimationEntry implements RenderObject {
  eventManager: EventManager;

  readonly pixiObject: PIXI.Container;
  intro: PIXI.Sprite;

  public static introEnabled = true;
  isDestroyed = false;

  constructor(container: PIXI.Container) {
    this.eventManager = EventManager.getInstance();

    this.pixiObject = new PIXI.Container();
    this.pixiObject.name = 'AnimationEntry';
    hide(this.pixiObject);

    this.intro = PIXI.Sprite.from('logoHorizontal');
    this.pixiObject.addChild(this.intro);

    container.addChild(this.pixiObject);

    this.eventManager.on('startGame', this.animate);
  }

  animate = (): void => {
    if (!AnimationEntry.introEnabled) {
      this.eventManager.emit('intro#end');
      this.destroy();
      return;
    }

    ease.add(this.pixiObject, { alpha: 1, visible: true }, { duration: 1000, ease: 'linear' }).on('complete', () => {
      ease.add(this.pixiObject, { alpha: 0, visible: false }, { duration: 1000, ease: 'linear' }).on('complete', () => {
        this.eventManager.emit('intro#end');
        this.destroy();
      });
    });
  };

  destroy = (): void => {
    this.isDestroyed = true;
    this.pixiObject.destroy({ children: true, texture: false, baseTexture: false });
  };

  calculateSizes(): void {
    if (this.isDestroyed) return;

    this.intro.width = vw(25);
    this.intro.height = this.intro.width * 1;
    this.intro.x = vw(100) / 2 - this.intro.width / 2;
    this.intro.y = vh(100) / 2 - this.intro.height / 2;
  }
}

export default AnimationEntry;
