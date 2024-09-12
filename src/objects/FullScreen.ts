import * as PIXI from 'pixi.js';
import RenderObject from './RenderObject';
import EventManager from '../managers/EventManager';
import { pxVw, pxVwM, vh, vw } from '../utils/size';
import { hide, isMobileVertical, show } from '../utils/helpers';

class FullScreen implements RenderObject {
  eventManager: EventManager;

  textStyle_text: PIXI.TextStyle;

  pixiObject: PIXI.Container;

  background: PIXI.Sprite;
  text: PIXI.Text;

  constructor(container: PIXI.Container) {
    this.eventManager = EventManager.getInstance();

    this.pixiObject = new PIXI.Container();
    this.pixiObject.name = 'FullScreen';
    this.pixiObject.zIndex = 10;
    this.pixiObject.eventMode = 'static';

    this.textStyle_text = new PIXI.TextStyle({
      fill: '#ffffff',
      fontSize: vw(isMobileVertical() ? 6 : 4),
      fontFamily: 'sans-serif',
      fontWeight: 'bold',
      wordWrap: true,
      wordWrapWidth: isMobileVertical() ? pxVwM(900) : pxVw(900),
      align: 'center',
    });

    this.background = PIXI.Sprite.from(PIXI.Texture.WHITE);
    this.background.tint = 0x000000;
    this.background.alpha = 0.5;
    this.pixiObject.addChild(this.background);

    this.text = new PIXI.Text(global.language.fullscreenTextANDROID, this.textStyle_text);
    this.pixiObject.addChild(this.text);

    container.addChild(this.pixiObject);

    this.attachListeners();
  }

  attachListeners = (): void => {
    this.pixiObject.addListener('mouseup', () => {
      this.enterFullscreen();
      hide(this.pixiObject);
    });

    this.pixiObject.addListener('touchend', () => {
      this.enterFullscreen();
      hide(this.pixiObject);
    });

    document.addEventListener('fullscreenchange', this.checkForFullscreen);
  };

  enterFullscreen(): void {
    const document: any = window.document;
    const fullScreenEnabled =
      document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.mozFullscreenEnabled ||
      document.msFullscreenEnabled
        ? true
        : false;

    if (!fullScreenEnabled) {
      return;
    }

    const isInFullScreen =
      (document.fullscreenElement && document.fullscreenElement !== null) ||
      (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
      (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
      (document.msFullscreenElement && document.msFullscreenElement !== null);

    const docElm = document.documentElement;
    if (!isInFullScreen) {
      if (docElm.requestFullscreen) {
        docElm.requestFullscreen();
      } else if (docElm.webkitRequestFullScreen) {
        docElm.webkitRequestFullScreen();
      } else if (docElm.mozRequestFullScreen) {
        docElm.mozRequestFullScreen();
      } else if (docElm.msRequestFullscreen) {
        docElm.msRequestFullscreen();
      }
    }
  }

  checkForFullscreen = (): void => {
    const document: any = window.document;
    const fullScreenEnabled =
      document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.mozFullscreenEnabled ||
      document.msFullscreenEnabled
        ? true
        : false;

    if (!fullScreenEnabled) {
      return;
    }

    const isInFullScreen =
      (document.fullscreenElement && document.fullscreenElement !== null) ||
      (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
      (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
      (document.msFullscreenElement && document.msFullscreenElement !== null);

    if (!isInFullScreen) {
      show(this.pixiObject);
    }
  };

  calculateSizes(): void {
    this.background.width = vw(100);
    this.background.height = vh(100);
    this.background.position.y = 0;
    this.background.position.x = 0;

    this.textStyle_text.fontSize = vw(isMobileVertical() ? 6 : 4);
    this.textStyle_text.wordWrapWidth = isMobileVertical() ? pxVwM(900) : pxVw(900);

    this.text.position.y = vh(20);
    this.text.position.x = (vw(100) - this.text.width) / 2;
  }
}

export default FullScreen;
