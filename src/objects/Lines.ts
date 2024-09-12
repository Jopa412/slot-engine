import * as PIXI from 'pixi.js';
import EventManager from '../managers/EventManager';
import RenderObject from './RenderObject';
import { applyMainContainerSizing, centerOnWindow } from '../utils/size';

class Lines implements RenderObject {
  eventManager: EventManager;

  readonly pixiObject: PIXI.Container;
  readonly lines: PIXI.Sprite[];

  initialChanged = false;

  constructor(container: PIXI.Container) {
    this.eventManager = EventManager.getInstance();

    this.pixiObject = new PIXI.Container();
    this.pixiObject.name = 'Lines';

    this.lines = [
      PIXI.Sprite.from('winLine1'),
      PIXI.Sprite.from('winLine2'),
      PIXI.Sprite.from('winLine3'),
      PIXI.Sprite.from('winLine4'),
      PIXI.Sprite.from('winLine5'),
      PIXI.Sprite.from('winLine1'),
      PIXI.Sprite.from('winLine2'),
      PIXI.Sprite.from('winLine3'),
      PIXI.Sprite.from('winLine4'),
      PIXI.Sprite.from('winLine5'),
      PIXI.Sprite.from('winLine1'),
      PIXI.Sprite.from('winLine2'),
      PIXI.Sprite.from('winLine3'),
      PIXI.Sprite.from('winLine4'),
      PIXI.Sprite.from('winLine5'),
      PIXI.Sprite.from('winLine1'),
      PIXI.Sprite.from('winLine2'),
      PIXI.Sprite.from('winLine3'),
      PIXI.Sprite.from('winLine4'),
      PIXI.Sprite.from('winLine5'),
    ];

    for (let i = 0; i < this.lines.length; i++) {
      this.lines[i].name = `Lines.line_${i}`;
      this.lines[i].alpha = 0;
      this.pixiObject.addChild(this.lines[i]);
    }

    container.addChild(this.pixiObject);

    this.eventManager.on('lines#change', this.animate);
    this.eventManager.on('lines#changeForce', this.animate);
    this.eventManager.on('spin#start', this.hideLines);
  }

  animate = (childSpriteIndex: number): void => {
    this.hideLines();

    if (this.initialChanged) {
      for (let i = 0; i < childSpriteIndex; i++) {
        this.lines[i].alpha = 1;
      }
    } else {
      this.initialChanged = true;
    }
  };

  hideLines = (): void => {
    for (let i = 0; i < this.lines.length; i++) {
      this.lines[i].alpha = 0;
    }
  };

  calculateSizes(): void {
    applyMainContainerSizing(this.pixiObject);

    centerOnWindow(this.pixiObject);
  }
}

export default Lines;
