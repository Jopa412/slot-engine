import * as PIXI from 'pixi.js';
import RenderObject from './RenderObject';
import SoundManager from '../managers/SoundManager';
import EventManager from '../managers/EventManager';
import AppStateManager from '../managers/AppStateManager';
import SpinManager from '../managers/SpinManager';
import { applyMainContainerSizing, centerOnWindow, vh, vw } from '../utils/size';
import { hide, isMobileVertical, show } from '../utils/helpers';
import { ease } from 'pixi-ease';
import Button from './UI/Button';

class FreeSpin implements RenderObject {
  soundManager: SoundManager;
  eventManager: EventManager;
  appStateManager: AppStateManager;
  spinManager: SpinManager;

  readonly pixiObject: PIXI.Container;

  textStyle: PIXI.TextStyle;

  glow: PIXI.Sprite;
  congrats: PIXI.Text;
  buttonStart: PIXI.Sprite;
  buttonStartText: PIXI.Text;
  buttonEnd: PIXI.Sprite;
  buttonEndText: PIXI.Text;

  innerContainer: PIXI.Container;
  background: PIXI.Sprite;
  spinsLeft: PIXI.Text;

  currency!: string;

  constructor(container: PIXI.Container) {
    this.soundManager = SoundManager.getInstance();
    this.eventManager = EventManager.getInstance();
    this.appStateManager = AppStateManager.getInstance();
    this.spinManager = SpinManager.getInstance();

    this.pixiObject = new PIXI.Container();
    this.pixiObject.name = 'FreeSpin';

    this.textStyle = new PIXI.TextStyle({
      align: 'center',
      fontSize: vw(isMobileVertical() ? 5 : 3),
      fontFamily: 'sans-serif',
      fontWeight: 'bold',
      fill: 'white',
      stroke: 'purple',
      strokeThickness: isMobileVertical() ? 2.5 : 5,
      lineJoin: 'round',
      dropShadow: true,
      dropShadowColor: 'black',
      dropShadowBlur: 1,
      dropShadowDistance: 1,
    });

    this.glow = PIXI.Sprite.from('freeSpinGlow');
    hide(this.glow);
    this.pixiObject.addChild(this.glow);

    this.congrats = new PIXI.Text(global.language.freeSpinsCongratsWin1, this.textStyle);
    hide(this.congrats);
    this.pixiObject.addChild(this.congrats);

    this.buttonStart = new Button(
      PIXI.Texture.from('freeSpinButtonNormal'),
      PIXI.Texture.from('freeSpinButtonDown'),
      PIXI.Texture.from('freeSpinButtonHover'),
      PIXI.Texture.from('freeSpinButtonDisabled'),
    );
    hide(this.buttonStart);
    this.buttonStart.eventMode = 'static';
    this.buttonStart.cursor = 'pointer';
    this.buttonStart.addListener('pointerup', () => {
      this.spinManager.fsbStart();
      this.closeModal();
    });
    this.buttonStartText = new PIXI.Text(global.language.freeSpinsStart, this.textStyle);
    hide(this.buttonStartText);
    this.pixiObject.addChild(this.buttonStart, this.buttonStartText);

    this.buttonEnd = new Button(
      PIXI.Texture.from('freeSpinButtonNormal'),
      PIXI.Texture.from('freeSpinButtonDown'),
      PIXI.Texture.from('freeSpinButtonHover'),
      PIXI.Texture.from('freeSpinButtonDisabled'),
    );
    hide(this.buttonEnd);
    this.buttonEnd.eventMode = 'static';
    this.buttonEnd.cursor = 'pointer';
    this.buttonEnd.addListener('pointerup', () => {
      this.spinManager.fsbEnd();
      this.eventManager.emit('enableUI');
      this.closeModal();
    });
    this.buttonEndText = new PIXI.Text(global.language.freeSpinsEnd, this.textStyle);
    hide(this.buttonEndText);
    this.pixiObject.addChild(this.buttonEnd, this.buttonEndText);

    this.innerContainer = new PIXI.Container();
    this.innerContainer.name = 'FreeSpin.innerContainer';

    this.background = PIXI.Sprite.from(PIXI.Texture.WHITE);
    hide(this.background);
    this.innerContainer.addChild(this.background);

    this.spinsLeft = new PIXI.Text('1 ' + global.language.freeSpinsLeft, this.textStyle);
    hide(this.spinsLeft);
    this.innerContainer.addChild(this.spinsLeft);

    this.pixiObject.addChild(this.innerContainer);
    container.addChild(this.pixiObject);

    this.eventManager.on('spin#start', this.onSpinStart);
    this.eventManager.on('freeSpins#start', this.onFreeSpinStart);
    this.eventManager.on('freeSpins#end', this.onFreeSpinEnd);
    this.eventManager.on('freeSpinEasings', this.freeSpinEasings);
  }

  onFreeSpinStart = (): void => {
    this.soundManager.stop('soundBackground');
    this.soundManager.play('soundFreeSpin', true, 0.5);

    show(this.glow);

    this.congrats.text =
      global.language.freeSpinsCongratsWin1 +
      '\n' +
      AppStateManager.freeSpinsCountTotal +
      '\n' +
      global.language.freeSpinsCongratsWin2;
    show(this.congrats);

    show(this.buttonStart, this.buttonStartText);
  };

  onFreeSpinEnd = (): void => {
    this.soundManager.stop('soundFreeSpin');
    this.soundManager.play('soundBackground', true, 0.5);

    show(this.glow);

    this.congrats.text =
      global.currency.beforeAmount === true
        ? global.language.freeSpinsCongratsWin1 +
          '\n' +
          global.currency.currencySymbol +
          ' ' +
          AppStateManager.freeSpinsWin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : global.language.freeSpinsCongratsWin1 +
          '\n' +
          AppStateManager.freeSpinsWin.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) +
          ' ' +
          global.currency.currencySymbol;

    show(this.congrats);

    show(this.buttonEnd, this.buttonEndText);
  };

  onSpinStart = () => {
    ease.removeEase(this.spinsLeft);
    hide(this.spinsLeft);
    this.spinsLeft.scale.y = this.spinsLeft.scale.x = 1;
    this.textStyle.fontSize = vw(isMobileVertical() ? 5 : 3);
    this.spinsLeft.position.y = (this.background.height - this.spinsLeft.height) / 2;
    this.spinsLeft.position.x = (this.background.width - this.spinsLeft.width) / 2;
  };

  freeSpinEasings = (): void => {
    this.spinsLeft.text = global.language.freeSpinsLeft + '\n' + AppStateManager.freeSpinsCount;

    ease
      .add(this.spinsLeft, { alpha: 1, visible: true }, { duration: 500, ease: 'easeInOutQuad' })
      .on('complete', () => {
        ease
          .add(
            this.spinsLeft,
            { alpha: 0, scale: 1.7, visible: false },
            { wait: 500, duration: 500, ease: 'easeInOutQuad' },
          )
          .on('each', () => {
            this.easingSpinsLeft();
          })
          .on('complete', () => {
            AppStateManager.preventSpin.pop();
          });
      });
  };

  easingSpinsLeft = (): void => {
    this.spinsLeft.position.y = (this.background.height - this.spinsLeft.height) / 2;
    this.spinsLeft.position.x = (this.background.width - this.spinsLeft.width) / 2;
  };

  closeModal = (): void => {
    AppStateManager.preventSpin.pop();
    hide(
      this.glow,
      this.congrats,
      this.buttonStart,
      this.buttonStartText,
      this.buttonEnd,
      this.buttonEndText,
      this.spinsLeft,
    );
    this.eventManager.emit('showUI');
  };

  calculateSizes(): void {
    this.textStyle.fontSize = vw(isMobileVertical() ? 5 : 3);
    this.textStyle.strokeThickness = isMobileVertical() ? 2.5 : 5;

    this.glow.width = vw(100);
    this.glow.height = vh(100);
    this.glow.position.y = 0;
    this.glow.position.x = 0;

    if (isMobileVertical()) {
      this.congrats.position.y = (vh(100) - vw(65) - this.congrats.height) / 2;
      this.congrats.position.x = (vw(100) - this.congrats.width) / 2;

      this.buttonStart.width = vw(25);
      this.buttonStart.height = this.buttonStart.width * 0.4676;
      this.buttonStart.position.y = this.congrats.position.y + this.congrats.height * 1.3;
      this.buttonStart.position.x = (vw(100) - this.buttonStart.width) / 2;
    } else {
      this.congrats.position.y = (vh(100) - vw(15) - this.congrats.height) / 2;
      this.congrats.position.x = (vw(100) - this.congrats.width) / 2;

      this.buttonStart.width = vw(15);
      this.buttonStart.height = this.buttonStart.width * 0.4676;
      this.buttonStart.position.y = this.congrats.position.y + this.congrats.height * 1.4;
      this.buttonStart.position.x = (vw(100) - this.buttonStart.width) / 2;
    }

    this.buttonEnd.width = this.buttonStart.width;
    this.buttonEnd.height = this.buttonStart.height;
    this.buttonEnd.position.y = this.buttonStart.position.y;
    this.buttonEnd.position.x = this.buttonStart.position.x;

    this.buttonStartText.position.x =
      this.buttonStart.position.x + this.buttonStart.width / 2 - this.buttonStartText.width / 2;
    this.buttonStartText.position.y =
      this.buttonStart.position.y + this.buttonStart.height / 2 - this.buttonStartText.height / 2;

    this.buttonEndText.position.x = this.buttonEnd.position.x + this.buttonEnd.width / 2 - this.buttonEndText.width / 2;
    this.buttonEndText.position.y =
      this.buttonEnd.position.y + this.buttonEnd.height / 2 - this.buttonEndText.height / 2;

    //==============================================================================================================

    applyMainContainerSizing(this.background);

    this.spinsLeft.position.y = (this.background.height - this.spinsLeft.height) / 2;
    this.spinsLeft.position.x = (this.background.width - this.spinsLeft.width) / 2;

    centerOnWindow(this.innerContainer);
  }
}

export default FreeSpin;
