import * as PIXI from 'pixi.js';
import RenderObject from './RenderObject';
import EventManager from '../managers/EventManager';
import { vw, vh } from '../utils/size';
import { hide, isMobileVertical, show } from '../utils/helpers';
import { ease } from 'pixi-ease';

class Header implements RenderObject {
  eventManager: EventManager;

  readonly pixiObject: PIXI.Container;
  headerHorizontal: PIXI.Sprite;
  headerVertical: PIXI.Sprite;

  constructor(container: PIXI.Container) {
    this.eventManager = EventManager.getInstance();

    this.pixiObject = new PIXI.Container();
    this.pixiObject.name = 'HeaderContainer';
    hide(this.pixiObject);

    this.headerHorizontal = new PIXI.Sprite(PIXI.Texture.from('logoHorizontal'));
    this.headerHorizontal.name = 'HeaderContainer.headerHorizontal';
    this.pixiObject.addChild(this.headerHorizontal);

    this.headerVertical = new PIXI.Sprite(PIXI.Texture.from('logoVertical'));
    this.headerVertical.name = 'HeaderContainer.headerVertical';
    this.pixiObject.addChild(this.headerVertical);

    container.addChild(this.pixiObject);

    this.eventManager.on('intro#end', this.animate);
  }

  animate = (): void => {
    ease.add(this.pixiObject, { alpha: 1, visible: true }, { duration: 500, ease: 'easeInQuad' });
  };

  calculateSizes(): void {
    this.headerVertical.width = vw(50);
    this.headerVertical.height = this.headerVertical.width;
    this.headerVertical.position.y = vh(1);
    this.headerVertical.position.x = (vw(100) - this.headerVertical.width) / 2;

    this.headerHorizontal.width = vw(15);
    this.headerHorizontal.height = this.headerHorizontal.width;
    this.headerHorizontal.position.y = 0;
    this.headerHorizontal.position.x = 0;

    if (isMobileVertical()) {
      show(this.headerVertical);
      hide(this.headerHorizontal);
    } else {
      hide(this.headerVertical);
      show(this.headerHorizontal);
    }
  }
}

export default Header;
