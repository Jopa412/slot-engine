import * as PIXI from 'pixi.js';
import RenderObject from './RenderObject';
import EventManager from '../managers/EventManager';
import SoundManager from '../managers/SoundManager';
import { vh, vw } from '../utils/size';
import { hide, show } from '../utils/helpers';
import { isMobileVertical } from '../utils/helpers';
import { ease } from 'pixi-ease';
import AppStateManager from '../managers/AppStateManager';

class Background implements RenderObject {
  eventManager: EventManager;
  soundManager: SoundManager;

  readonly pixiObject: PIXI.Container;
  backgroundHorizontal: PIXI.Sprite;
  backgroundVertical: PIXI.Sprite;

  constructor(container: PIXI.Container) {
    this.eventManager = EventManager.getInstance();
    this.soundManager = SoundManager.getInstance();

    this.pixiObject = new PIXI.Container();
    this.pixiObject.eventMode = 'static';
    this.pixiObject.name = 'BackgroundContainer';

    this.backgroundHorizontal = PIXI.Sprite.from('backgroundHorizontal');
    this.backgroundHorizontal.name = 'BackgroundContainer.BackgroundHorizontal';
    this.pixiObject.addChild(this.backgroundHorizontal);

    this.backgroundVertical = PIXI.Sprite.from('backgroundVertical');
    this.backgroundVertical.name = 'BackgroundContainer.BackgroundVertical';
    this.pixiObject.addChild(this.backgroundVertical);

    hide(this.backgroundHorizontal, this.backgroundVertical);

    container.addChild(this.pixiObject);

    this.pixiObject.addListener('touchstart', () => {
      if (!AppStateManager.preventSpin.length) this.eventManager.emit('closeAllOptions', '');
    });

    this.pixiObject.addListener('pointerdown', () => {
      if (!AppStateManager.preventSpin.length) this.eventManager.emit('closeAllOptions', '');
    });

    window.addEventListener('resize', this.switchBackground);
    window.addEventListener('orientationchange', this.switchBackground);
    this.eventManager.on('startGame', this.animate);
  }

  animate = (): void => {
    this.soundManager.play('soundBackground', true, 0.5);

    if (isMobileVertical()) {
      show(this.backgroundVertical);
    } else {
      show(this.backgroundHorizontal);
    }
  };

  switchBackground = (): void => {
    ease.add(this.backgroundHorizontal, { alpha: 0, visible: false }, { duration: 500, ease: 'linear' });
    ease.add(this.backgroundVertical, { alpha: 0, visible: false }, { duration: 500, ease: 'linear' });

    if (isMobileVertical()) {
      ease.add(this.backgroundVertical, { alpha: 1, visible: true }, { duration: 500, ease: 'linear' });
    } else {
      ease.add(this.backgroundHorizontal, { alpha: 1, visible: true }, { duration: 500, ease: 'linear' });
    }
  };

  calculateSizes(): void {
    this.backgroundHorizontal.width = vw(100);
    this.backgroundHorizontal.height = vh(100);
    this.backgroundHorizontal.position.y = 0;
    this.backgroundHorizontal.position.x = 0;

    this.backgroundVertical.width = vw(100);
    this.backgroundVertical.height = vh(100);
    this.backgroundVertical.position.y = 0;
    this.backgroundVertical.position.x = 0;
  }
}

export default Background;
