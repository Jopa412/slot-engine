import * as PIXI from 'pixi.js';
import RenderObject from './RenderObject';
import EventManager from '../managers/EventManager';
import SoundManager from '../managers/SoundManager';
import SettingsStateManager from '../managers/SettingsStateManager';
import { reelColumnWidth } from '../utils/size';
import { Spine } from 'pixi-spine';
import { SYMBOL_WILD } from '../constants/constants';

type PixiSprite = PIXI.AnimatedSprite | PIXI.Sprite;

class ReelSymbol implements RenderObject {
  eventManager: EventManager;
  soundManager: SoundManager;
  settingsStateManager: SettingsStateManager;

  readonly pixiObject: PIXI.Container;

  normalSymbol!: PixiSprite;
  blurSymbol!: PIXI.Sprite;
  darkSymbol!: PIXI.Sprite;
  normalSprites: PixiSprite[];
  blurSprites: PIXI.Sprite[];
  darkSprites: PIXI.Sprite[];
  symbolSpine!: Spine;
  spineNames: string[];

  symbolIndex!: number;
  columnIndex: number;
  rowIndex: number;

  isSpinning = false;
  animationStarted = false;

  constructor(container: PIXI.Container, initSymbolIndex: number, columnIndex: number, rowIndex: number) {
    this.eventManager = EventManager.getInstance();
    this.soundManager = SoundManager.getInstance();
    this.settingsStateManager = SettingsStateManager.getInstance();

    this.columnIndex = columnIndex;
    this.rowIndex = rowIndex;

    this.normalSprites = [
      PIXI.Sprite.from('symbolWild'),
      PIXI.Sprite.from('symbolBamboo'),
      PIXI.Sprite.from('symbolDrum'),
      PIXI.Sprite.from('symbolFish'),
      PIXI.Sprite.from('symbolDragon'),
      PIXI.Sprite.from('symbolLychee'),
      PIXI.Sprite.from('symbolYingYung'),
      PIXI.Sprite.from('symbolYingYung'),
    ];

    this.blurSprites = [
      PIXI.Sprite.from('blurWild'),
      PIXI.Sprite.from('blurBamboo'),
      PIXI.Sprite.from('blurDrum'),
      PIXI.Sprite.from('blurFish'),
      PIXI.Sprite.from('blurDragon'),
      PIXI.Sprite.from('blurLychee'),
      PIXI.Sprite.from('blurYingYung'),
      PIXI.Sprite.from('blurYingYung'),
    ];

    this.darkSprites = [
      PIXI.Sprite.from('darkWild'),
      PIXI.Sprite.from('darkBamboo'),
      PIXI.Sprite.from('darkDrum'),
      PIXI.Sprite.from('darkFish'),
      PIXI.Sprite.from('darkDragon'),
      PIXI.Sprite.from('darkLychee'),
      PIXI.Sprite.from('darkYingYung'),
      PIXI.Sprite.from('darkYingYung'),
    ];

    this.spineNames = ['WILD PANDA', 'BAMBOO', 'DRUM', 'FISH', 'DRAGON', 'LYCHEE', 'YING YANG', 'YING YANG'];

    this.pixiObject = new PIXI.Container();
    this.pixiObject.name = 'ReelSymbol';

    if (this.isMainReel) {
      this.symbolSpine = new Spine(PIXI.Assets.get('symbolsSpine')?.spineData);
      this.pixiObject.addChild(this.symbolSpine);
      this.pixiObject.sortableChildren = true;
      this.symbolSpine.zIndex = 9;
      this.symbolSpine.alpha = 0;

      this.eventManager.on('animateSymbol', this.animateSymbol);
      this.eventManager.on('animateSymbol#stop', this.stopAnimation);
      this.eventManager.on('darkSymbols', this.darkSymbols);
    }

    this.setTexture(initSymbolIndex);

    container.addChild(this.pixiObject);
  }

  get isMainReel(): boolean {
    return [3, 4, 5].includes(this.rowIndex);
  }

  blurSymbols = (): void => {
    this.normalSprites.forEach((sprite) => (sprite.alpha = 0));
    this.blurSprites.forEach((sprite) => (sprite.alpha = this.animationStarted ? 0 : 1));
    this.darkSprites.forEach((sprite) => (sprite.alpha = 0));
  };

  unblurSymbols = (): void => {
    this.normalSprites.forEach((sprite) => (sprite.alpha = this.animationStarted ? 0 : 1));
    this.blurSprites.forEach((sprite) => (sprite.alpha = 0));
    this.darkSprites.forEach((sprite) => (sprite.alpha = 0));
  };

  darkSymbols = (): void => {
    this.normalSprites.forEach((sprite) => (sprite.alpha = 0));
    this.blurSprites.forEach((sprite) => (sprite.alpha = 0));
    this.darkSprites.forEach((sprite) => (sprite.alpha = this.animationStarted ? 0 : 1));
  };

  animate(): void {
    this.normalSymbol.alpha = 0;

    this.darkSymbol.alpha = 0;

    if (this.spineNames[this.symbolIndex]) {
      this.symbolSpine.alpha = 1;
    }
  }

  animateSymbol = (props: any): void => {
    this.animationStarted = true;

    const { columnId, rowId, symbolId } = props;

    if (
      this.columnIndex === columnId &&
      this.rowIndex === rowId &&
      (this.symbolIndex === symbolId || this.symbolIndex === SYMBOL_WILD)
    ) {
      this.animate();
    }
  };

  stopAnimation = (): void => {
    this.animationStarted = false;

    this.normalSymbol.alpha = 1;

    this.symbolSpine.alpha = 0;

    this.unblurSymbols();
  };

  setTexture(symbolIndex: number): void {
    if (this.normalSymbol && this.normalSymbol.parent) {
      this.normalSymbol.parent.removeChild(this.normalSymbol);
    }

    if (this.blurSymbol && this.blurSymbol.parent) {
      this.blurSymbol.parent.removeChild(this.blurSymbol);
    }

    if (this.darkSymbol && this.darkSymbol.parent) {
      this.darkSymbol.parent.removeChild(this.darkSymbol);
    }

    this.normalSymbol = this.normalSprites[symbolIndex];
    this.blurSymbol = this.blurSprites[symbolIndex];
    this.darkSymbol = this.darkSprites[symbolIndex];
    this.symbolIndex = symbolIndex;

    if (this.isMainReel) {
      if (this.spineNames[symbolIndex]) {
        this.symbolSpine.state.setAnimation(0, this.spineNames[symbolIndex], true);
      }
    }
    this.pixiObject.addChild(this.normalSymbol);
    this.pixiObject.addChild(this.blurSymbol);
    this.pixiObject.addChild(this.darkSymbol);

    this.calculateSizes();
  }

  calculateSizes(): void {
    const symbolWidth = reelColumnWidth();
    const symbolHeight = symbolWidth * 0.762573;

    this.normalSprites.forEach((sprite, index) => {
      sprite.width = symbolWidth;
      sprite.height = symbolHeight;
      sprite.position.x = 0;
      sprite.position.y = 0;

      this.blurSprites[index].width = sprite.width;
      this.blurSprites[index].height = sprite.height;
      this.blurSprites[index].position.x = sprite.position.x;
      this.blurSprites[index].position.y = sprite.position.y;

      this.darkSprites[index].width = sprite.width;
      this.darkSprites[index].height = sprite.height;
      this.darkSprites[index].position.x = sprite.position.x;
      this.darkSprites[index].position.y = sprite.position.y;

      if (this.isMainReel) {
        if (index === this.symbolIndex && this.spineNames[this.symbolIndex]) {
          this.symbolSpine.width = sprite.width * 1.7;
          this.symbolSpine.height = sprite.height * 1.7;
          this.symbolSpine.position.x = sprite.width / 2 + sprite.position.x;
          this.symbolSpine.position.y = sprite.height / 2 + sprite.position.y;
        }
      }
    });
  }
}

export default ReelSymbol;
