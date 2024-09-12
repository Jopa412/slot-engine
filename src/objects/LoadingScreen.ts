import * as PIXI from 'pixi.js';
import RenderObject from './RenderObject';
import EventManager from '../managers/EventManager';
import SoundManager from '../managers/SoundManager';
import { vh, vw } from '../utils/size';
import Button from './UI/Button';
import { hide, isMobileVertical, show } from '../utils/helpers';

class LoadingScreen implements RenderObject {
  eventManager: EventManager;
  soundManager: SoundManager;

  pixiObject: PIXI.Container;

  // videoSprite: PIXI.Sprite;

  loadingContainerHorizontal: PIXI.Container;
  loadingBackgroundHorizontal: PIXI.Sprite;
  loadingBarHorizontal: PIXI.Sprite;
  loadingBarMaskHorizontal: PIXI.Sprite;
  loadingButtonHorizontal: Button;

  loadingContainerVertical: PIXI.Container;
  loadingBackgroundVertical: PIXI.Sprite;
  loadingBarVertical: PIXI.Sprite;
  loadingBarMaskVertical: PIXI.Sprite;
  loadingButtonVertical: Button;

  percent = 0;
  isDestroyed = false;

  constructor(loadAssets: () => void) {
    this.eventManager = EventManager.getInstance();
    this.soundManager = SoundManager.getInstance();

    this.pixiObject = new PIXI.Container();
    this.pixiObject.name = 'LoadingScreen';
    this.pixiObject.zIndex = 9;

    // horizontal
    this.loadingContainerHorizontal = new PIXI.Container();
    this.loadingContainerHorizontal.name = 'LoadingScreen.loadingContainerHorizontal';
    hide(this.loadingContainerHorizontal);

    this.loadingBackgroundHorizontal = new PIXI.Sprite(PIXI.Texture.from('loadingBackgroundHorizontal'));
    this.loadingBackgroundHorizontal.name = 'LoadingScreen.loadingBackgroundHorizontal';
    this.loadingContainerHorizontal.addChild(this.loadingBackgroundHorizontal);
    hide(this.loadingBackgroundHorizontal);

    this.loadingBarHorizontal = new PIXI.Sprite(PIXI.Texture.from('loadingBarHorizontal'));
    this.loadingBarHorizontal.name = 'LoadingScreen.loadingBarHorizontal';
    this.loadingContainerHorizontal.addChild(this.loadingBarHorizontal);

    this.loadingBarMaskHorizontal = new PIXI.Sprite(PIXI.Texture.from('loadingBarMaskHorizontal'));
    this.loadingBarMaskHorizontal.name = 'LoadingScreen.loadingBarMaskHorizontal';
    this.loadingContainerHorizontal.addChild(this.loadingBarMaskHorizontal);

    this.loadingBarHorizontal.mask = this.loadingBarMaskHorizontal;

    this.loadingButtonHorizontal = new Button(
      PIXI.Texture.from('loadingButtonNormalHorizontal'),
      PIXI.Texture.from('loadingButtonDownHorizontal'),
      PIXI.Texture.from('loadingButtonHoverHorizontal'),
      PIXI.Texture.from('loadingButtonDisabledHorizontal'),
      true,
    );
    this.loadingButtonHorizontal.name = 'LoadingScreen.loadingButtonHorizontal';
    this.loadingContainerHorizontal.addChild(this.loadingButtonHorizontal);
    hide(this.loadingButtonHorizontal);

    // vertical
    this.loadingContainerVertical = new PIXI.Container();
    this.loadingContainerVertical.name = 'LoadingScreen.loadingContainerVertical';
    hide(this.loadingContainerVertical);

    this.loadingBackgroundVertical = new PIXI.Sprite(PIXI.Texture.from('loadingBackgroundVertical'));
    this.loadingBackgroundVertical.name = 'LoadingScreen.loadingBackgroundVertical';
    this.loadingContainerVertical.addChild(this.loadingBackgroundVertical);
    hide(this.loadingBackgroundVertical);

    this.loadingBarVertical = new PIXI.Sprite(PIXI.Texture.from('loadingBarVertical'));
    this.loadingBarVertical.name = 'LoadingScreen.loadingBarVertical';
    this.loadingContainerVertical.addChild(this.loadingBarVertical);

    this.loadingBarMaskVertical = new PIXI.Sprite(PIXI.Texture.from('loadingBarMaskVertical'));
    this.loadingBarMaskVertical.name = 'LoadingScreen.loadingBarMaskVertical';
    this.loadingContainerVertical.addChild(this.loadingBarMaskVertical);

    this.loadingBarVertical.mask = this.loadingBarMaskVertical;

    this.loadingButtonVertical = new Button(
      PIXI.Texture.from('loadingButtonNormalVertical'),
      PIXI.Texture.from('loadingButtonDownVertical'),
      PIXI.Texture.from('loadingButtonHoverVertical'),
      PIXI.Texture.from('loadingButtonDisabledVertical'),
      true,
    );
    this.loadingButtonVertical.name = 'LoadingScreen.loadingButtonVertical';
    this.loadingContainerVertical.addChild(this.loadingButtonVertical);
    hide(this.loadingButtonVertical);

    // const videoResource = new PIXI.VideoResource('./assets/crowngames-animation-880x880.mp4');
    // const videoBaseTexture = new PIXI.BaseTexture(videoResource);
    // const videoTexture = new PIXI.Texture(videoBaseTexture);
    // this.videoSprite = new PIXI.Sprite(videoTexture);
    // videoResource.source.volume = 1;
    // videoResource.source.muted = true;
    // videoResource.source.loop = false;
    // videoResource.source.autoplay = true;

    //videoResource.source.onended = (event) => {
    if (isMobileVertical()) {
      show(this.loadingContainerVertical, this.loadingBackgroundVertical, this.loadingButtonVertical);
      //hide(this.videoSprite);
      loadAssets();
    } else {
      show(this.loadingContainerHorizontal, this.loadingBackgroundHorizontal, this.loadingButtonHorizontal);
      //hide(this.videoSprite);
      loadAssets();
    }
    //};

    this.pixiObject.addChild(this.loadingContainerHorizontal /*, this.videoSprite*/);
    this.pixiObject.addChild(this.loadingContainerVertical /*, this.videoSprite*/);

    this.eventManager.on('assetsLoaded', this.assetsLoaded);
  }

  assetsLoaded = (): void => {
    this.loadingButtonHorizontal.setDisabled(false);
    this.loadingButtonVertical.setDisabled(false);

    this.loadingButtonHorizontal.addListener('pointerup', () => {
      this.onStartClick();
    });

    this.loadingButtonVertical.addListener('pointerup', () => {
      this.onStartClick();
    });
  };

  onStartClick(): void {
    this.soundManager.play('soundStartButton');
    hide(this.pixiObject);
    this.destroy();
    this.eventManager.emit('startGame');
  }

  destroy = (): void => {
    this.isDestroyed = true;
    this.pixiObject.parent.removeChild(this.loadingContainerHorizontal);
    this.pixiObject.parent.removeChild(this.loadingContainerVertical);
    this.pixiObject.destroy({ children: true, texture: false, baseTexture: false });
  };

  calculateSizes(): void {
    if (this.isDestroyed) return;

    if (isMobileVertical()) {
      hide(this.loadingContainerHorizontal);
      show(this.loadingContainerVertical);

      // this.videoSprite.width = vw(100);
      // this.videoSprite.height = vh(100);
      // this.videoSprite.position.x = 0;
      // this.videoSprite.position.y = 0;

      this.loadingBackgroundVertical.width = vw(100);
      this.loadingBackgroundVertical.height = vh(100);
      this.loadingBackgroundVertical.position.x = 0;
      this.loadingBackgroundVertical.position.y = 0;

      this.loadingBarMaskVertical.width = vw(75.6);
      this.loadingBarMaskVertical.height = vh(5.3);
      this.loadingBarMaskVertical.x = vw(12);
      this.loadingBarMaskVertical.y = vh(71.7);

      this.loadingBarVertical.width = this.loadingBarMaskVertical.width * this.percent;
      this.loadingBarVertical.height = this.loadingBarMaskVertical.height;
      this.loadingBarVertical.x = this.loadingBarMaskVertical.x;
      this.loadingBarVertical.y = this.loadingBarMaskVertical.y;

      this.loadingButtonVertical.width = vw(47);
      this.loadingButtonVertical.height = this.loadingButtonVertical.width * 0.315;
      this.loadingButtonVertical.x = (vw(100) - this.loadingButtonVertical.width) / 2;
      this.loadingButtonVertical.y = vh(83);
    } else {
      hide(this.loadingContainerVertical);
      show(this.loadingContainerHorizontal);

      // this.videoSprite.width = vw(100);
      // this.videoSprite.height = vh(100);
      // this.videoSprite.position.x = 0;
      // this.videoSprite.position.y = 0;

      this.loadingBackgroundHorizontal.width = vw(100);
      this.loadingBackgroundHorizontal.height = vh(100);
      this.loadingBackgroundHorizontal.position.x = 0;
      this.loadingBackgroundHorizontal.position.y = 0;

      this.loadingBarMaskHorizontal.width = vw(58.5);
      this.loadingBarMaskHorizontal.height = vh(6.3);
      this.loadingBarMaskHorizontal.x = vw(20.2);
      this.loadingBarMaskHorizontal.y = vh(61.7);

      this.loadingBarHorizontal.width = this.loadingBarMaskHorizontal.width * this.percent;
      this.loadingBarHorizontal.height = this.loadingBarMaskHorizontal.height;
      this.loadingBarHorizontal.x = this.loadingBarMaskHorizontal.x;
      this.loadingBarHorizontal.y = this.loadingBarMaskHorizontal.y;

      this.loadingButtonHorizontal.width = vw(17);
      this.loadingButtonHorizontal.height = this.loadingButtonHorizontal.width * 0.315;
      this.loadingButtonHorizontal.x = (vw(100) - this.loadingButtonHorizontal.width) / 2;
      this.loadingButtonHorizontal.y = vh(85);
    }
  }
}

export default LoadingScreen;
