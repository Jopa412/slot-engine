import * as PIXI from 'pixi.js';
import RenderObject from '../RenderObject';
import { applyMainContainerSizing, centerOnWindow, horizontallyCenter, vw } from '../../utils/size';
import { hide, isMobileVertical, show } from '../../utils/helpers';
import EventManager from '../../managers/EventManager';
import Button from './Button';

class Options implements RenderObject {
  eventManager: EventManager;

  pixiObject: PIXI.Container;

  background: PIXI.Sprite;
  innerContainer: PIXI.Container;
  title: PIXI.Text;
  closeButton: Button;

  textStyle: PIXI.TextStyle;

  name: string;

  constructor(name: string, title: string) {
    this.eventManager = EventManager.getInstance();

    this.name = name;

    this.pixiObject = new PIXI.Container();
    this.pixiObject.eventMode = 'static';

    this.background = PIXI.Sprite.from('optionsBg');

    this.innerContainer = new PIXI.Container();

    this.textStyle = new PIXI.TextStyle({
      fill: '#fff',
      fontSize: vw(isMobileVertical() ? 4 : 2),
      fontFamily: 'oswaldregular',
      fontWeight: 'bold',
    });

    this.title = new PIXI.Text(title, this.textStyle);

    this.closeButton = new Button(
      PIXI.Texture.from('buttonCloseNormal'),
      PIXI.Texture.from('buttonCloseDown'),
      PIXI.Texture.from('buttonCloseHover'),
      PIXI.Texture.from('buttonCloseDisabled'),
    );

    this.innerContainer.addChild(this.title, this.closeButton);
    this.pixiObject.addChild(this.background, this.innerContainer);
    hide(this.pixiObject);

    this.attachListeners();
  }

  attachListeners = (): void => {
    this.eventManager.on(`${this.name}#show`, this.show);
    this.eventManager.on(`${this.name}#hide`, this.hide);
    this.eventManager.on(`${this.name}#toggle`, this.toggle);
    this.eventManager.on('closeAllOptions', this.closeAllOptions);
    this.closeButton.addListener('pointerup', this.hide);
  };

  closeAllOptions = (name: string): void => {
    if (this.name !== name) {
      this.hide();
    }
  };

  show = (): void => {
    show(this.pixiObject);
  };

  hide = (): void => {
    hide(this.pixiObject);
  };

  toggle = (): void => {
    if (this.pixiObject.visible) {
      this.hide();
    } else {
      this.show();
    }
  };

  pxBgSpec = (pixels: number): number => {
    return this.background.width * (pixels / 1920);
  };

  pxBg = (pixels: number): number => {
    return this.background.width * (pixels / 1652);
  };

  vwBg = (percent: number): number => {
    return this.background.width * (percent / 100);
  };

  addChild(...children: any[]): void {
    this.innerContainer.addChild(...children);
  }

  get width(): number {
    return this.background.width;
  }

  get height(): number {
    return this.background.height;
  }

  calculateSizes(): void {
    applyMainContainerSizing(this.background);

    this.textStyle.fontSize = this.pxBg(40);
    this.title.position.y = this.pxBg(130);
    horizontallyCenter(this.title, this.background.width);

    this.closeButton.width = this.closeButton.height = this.pxBg(75);
    this.closeButton.position.x = this.pxBg(1470);
    this.closeButton.position.y = this.pxBg(130);
  }

  recenter(): void {
    centerOnWindow(this.pixiObject);
  }
}

export default Options;
