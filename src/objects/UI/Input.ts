import * as PIXI from 'pixi.js';
import AppStateManager from '../../managers/AppStateManager';
import { hide, isMobileVertical } from '../../utils/helpers';
import { vw } from '../../utils/size';

class Input extends PIXI.Container {
  appStateManager: AppStateManager;

  bottomLine: PIXI.Sprite;
  currencyLabel: PIXI.Text;
  text: PIXI.Text;
  domInput: HTMLInputElement;
  background: PIXI.Sprite;

  textStyle: PIXI.TextStyle;

  currency!: string;

  pxBg: (pixels: number) => number;

  constructor(pxBg: (pixels: number) => number) {
    super();
    this.appStateManager = AppStateManager.getInstance();

    this.pxBg = pxBg;

    this.background = PIXI.Sprite.from(PIXI.Texture.WHITE);
    this.background.eventMode = 'static';
    hide(this.background);

    this.bottomLine = PIXI.Sprite.from('optionsInput');

    this.textStyle = new PIXI.TextStyle({
      fill: '#ffffff',
      fontSize: isMobileVertical() ? vw(3) : vw(1.7),
    });

    this.currencyLabel = new PIXI.Text(global.currency.currencySymbol, this.textStyle);

    this.text = new PIXI.Text('', this.textStyle);

    this.addChild(this.bottomLine, this.currencyLabel, this.text, this.background);

    this.domInput = document.createElement('input');
    this.domInput.type = 'text';
    this.domInput.pattern = '[0-9]+';
    this.domInput.style.position = 'absolute';
    this.domInput.maxLength = 10;
    document.body.appendChild(this.domInput);
    this.domInput.style.top = '0';
    this.domInput.style.left = '0';
    this.domInput.style.zIndex = '-1';

    this.background.addListener('pointerup', () => {
      this.domInput.focus();
    });

    this.domInput.addEventListener('input', () => {
      this.domInput.value = this.domInput.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      this.text.text = this.domInput.value;
    });
  }

  calculateSizes = () => {
    this.bottomLine.width = this.pxBg(170);
    this.bottomLine.height = this.pxBg(6);
    this.bottomLine.position.y = isMobileVertical() ? this.pxBg(60) : this.pxBg(35);

    this.background.width = this.pxBg(170);
    this.background.height = isMobileVertical() ? this.pxBg(60) : this.pxBg(35);

    this.textStyle.fontSize = this.pxBg(40);
    this.text.position.x = this.currencyLabel.position.x + this.currencyLabel.width + this.pxBg(10);
  };
}

export default Input;
