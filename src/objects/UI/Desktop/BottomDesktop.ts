import * as PIXI from 'pixi.js';
import RenderObject from '../../RenderObject';
import { horizontallyCenter, pxVw, vh, vw } from '../../../utils/size';
import Button from '../Button';
import { hide, makeButton, popupCenter, show } from '../../../utils/helpers';
import EventManager from '../../../managers/EventManager';
import SpinManager from '../../../managers/SpinManager';
import SoundManager from '../../../managers/SoundManager';
import StorageManager from '../../../managers/StorageManager';
import AppStateManager from '../../../managers/AppStateManager';
import SettingsStateManager from '../../../managers/SettingsStateManager';
import { ease } from 'pixi-ease';

class AudioSlider extends PIXI.Container {
  background: PIXI.Sprite;
  fill: PIXI.Sprite;
  handle: PIXI.Sprite;

  isMouseDown = false;
  value = 1;
  onChange: (value: number) => void;

  constructor(value = 1, onChange: (value: number) => void) {
    super();

    this.value = value;
    this.onChange = onChange;

    this.background = PIXI.Sprite.from('audioSlider');
    this.background.eventMode = 'static';
    this.background.addListener('pointermove', this.onMove);

    this.fill = PIXI.Sprite.from(PIXI.Texture.WHITE);
    this.fill.tint = 0x2f710c;

    this.handle = PIXI.Sprite.from('audioSliderHandle');
    this.handle.eventMode = 'static';
    this.handle.cursor = 'pointer';
    this.handle.addListener('pointerdown', this.dragStart);
    this.handle.addListener('pointerup', this.dragEnd);
    this.handle.addListener('pointerupoutside', this.dragEnd);

    this.addChild(this.background, this.fill, this.handle);
  }

  onMove = (event: any) => {
    if (!this.isMouseDown) return;

    const y = event.data.getLocalPosition(this).y - pxVw(22);
    let value = 1 - y / pxVw(306);

    if (y < 0) {
      value = 1;
    }

    if (y > pxVw(306)) {
      value = 0;
    }

    this.value = value;
    this.calculateSizes();
    this.onChange(value);
  };

  dragStart = () => {
    this.isMouseDown = true;
  };

  dragEnd = () => {
    this.isMouseDown = false;
  };

  calculateSizes() {
    this.background.width = pxVw(56);
    this.background.height = pxVw(350);

    this.fill.width = pxVw(10);
    this.fill.height = pxVw(306) * this.value;
    this.fill.position.y = pxVw(328) - this.fill.height;
    horizontallyCenter(this.fill, this.background.width);

    this.handle.width = this.handle.height = pxVw(22);
    this.handle.position.y = this.background.height - pxVw(22) - pxVw(306) * this.value - this.handle.height / 2;
    horizontallyCenter(this.handle, this.background.width);
  }
}

class BottomDesktop implements RenderObject {
  eventManager: EventManager;
  spinManager: SpinManager;
  soundManager: SoundManager;
  storageManager: StorageManager;
  appStateManager: AppStateManager;
  settingsStateManager: SettingsStateManager;

  pixiObject: PIXI.Container;

  textStyleButtons: PIXI.TextStyle;
  textStyleValues: PIXI.TextStyle;
  textStyleInfo: PIXI.TextStyle;
  textStyleAutoSpin: PIXI.TextStyle;

  // horizontal
  background: PIXI.Sprite;
  buttonFullScreenOn: Button;
  buttonFullScreenOff: Button;
  buttonSoundOn: Button;
  buttonSoundOff: Button;
  buttonMenu: Button;
  buttonMenuHome: Button;
  buttonMenuInfoScreen: Button;
  buttonMenuHistory: Button;
  buttonMenuSettings: Button;
  lines: PIXI.Sprite;
  // buttonLinesMinus: Button;
  // buttonLinesPlus: Button;
  totalBet: PIXI.Sprite;
  buttonTotalBetMinus: Button;
  buttonTotalBetPlus: Button;
  buttonTurboOn: Button;
  buttonTurboOff: Button;
  balance: PIXI.Sprite;
  buttonMaxBet: Button;
  buttonAuto: Button;
  buttonSpin: Button;
  buttonSpinStop: Button;
  buttonAutoSpin: Button;
  buttonAutoSpinStop: Button;

  audioSlider: AudioSlider;

  buttonMenuText: PIXI.Text;
  buttonMenuHomeText: PIXI.Text;
  buttonMenuInfoScreenText: PIXI.Text;
  buttonMenuHistoryText: PIXI.Text;
  buttonMenuSettingsText: PIXI.Text;
  linesText: PIXI.Text;
  linesValueText: PIXI.Text;
  totalBetText: PIXI.Text;
  totalBetValueText: PIXI.Text;
  buttonTurboOnText: PIXI.Text;
  buttonTurboOffText: PIXI.Text;
  infoText: PIXI.Text;
  balanceText: PIXI.Text;
  balanceValueText: PIXI.Text;
  buttonMaxBetText: PIXI.Text;
  buttonAutoText: PIXI.Text;
  autoSpinText: PIXI.Text;

  menuShowing = false;
  audioSliderShowing = false;
  volumeDisabled = false;
  isWin = false;
  public static spaceBarToSpin = true;

  currency!: string;
  credit!: number;

  queryString: string;
  urlParams: URLSearchParams;
  lobby: string | null;

  constructor(container: PIXI.Container) {
    this.eventManager = EventManager.getInstance();
    this.spinManager = SpinManager.getInstance();
    this.soundManager = SoundManager.getInstance();
    this.storageManager = StorageManager.getInstance();
    this.appStateManager = AppStateManager.getInstance();
    this.settingsStateManager = SettingsStateManager.getInstance();

    this.queryString = window.location.search;
    this.urlParams = new URLSearchParams(this.queryString);
    this.lobby = this.urlParams.get('lobby');

    this.pixiObject = new PIXI.Container();
    this.pixiObject.name = 'BottomDesktop';
    hide(this.pixiObject);

    this.textStyleButtons = new PIXI.TextStyle({
      fill: '#ffffcc',
      stroke: 'black',
      strokeThickness: 4,
      lineJoin: 'round',
      fontSize: vw(1.4),
      fontWeight: 'bold',
      wordWrap: true,
      wordWrapWidth: pxVw(100),
      align: 'center',
    });
    this.textStyleValues = new PIXI.TextStyle({
      fill: '#ffffcc',
      stroke: 'black',
      strokeThickness: 4,
      lineJoin: 'round',
      fontSize: vw(1.2),
      fontWeight: 'bold',
      wordWrap: true,
      wordWrapWidth: pxVw(10),
      align: 'center',
    });
    this.textStyleInfo = new PIXI.TextStyle({
      fill: '#ffffcc',
      stroke: 'black',
      strokeThickness: 4,
      lineJoin: 'round',
      fontSize: vw(1.4),
      fontWeight: 'bold',
      wordWrap: true,
      wordWrapWidth: pxVw(300),
      align: 'center',
    });
    this.textStyleAutoSpin = new PIXI.TextStyle({
      fill: '#ffffcc',
      stroke: 'black',
      strokeThickness: 4,
      lineJoin: 'round',
      fontSize: vw(1.4),
      fontWeight: 'bold',
      align: 'center',
    });

    this.background = PIXI.Sprite.from('bottomBackgroundH');
    this.buttonFullScreenOn = makeButton('buttonFullScreenOnH');
    this.buttonFullScreenOff = makeButton('buttonFullScreenOffH');
    this.buttonSoundOn = makeButton('buttonSoundOnH');
    this.buttonSoundOff = makeButton('buttonSoundOffH');
    this.buttonMenu = makeButton('buttonMenuH');
    this.buttonMenuHome = makeButton('buttonMenuHomeH');
    this.buttonMenuInfoScreen = makeButton('buttonMenuInfoScreenH');
    this.buttonMenuHistory = makeButton('buttonMenuHistoryH');
    this.buttonMenuSettings = makeButton('buttonMenuSettingsH');
    this.lines = PIXI.Sprite.from('bottomLinesH');
    // this.buttonLinesMinus = makeButton('buttonMinusH');
    // this.buttonLinesPlus = makeButton('buttonPlusH');
    this.totalBet = PIXI.Sprite.from('bottomTotalBetH');
    this.buttonTotalBetMinus = makeButton('buttonMinusH');
    this.buttonTotalBetPlus = makeButton('buttonPlusH');
    this.buttonTurboOn = makeButton('buttonTurboH');
    this.buttonTurboOff = makeButton('buttonTurboH');
    this.balance = PIXI.Sprite.from('bottomBalanceH');
    this.buttonMaxBet = makeButton('buttonMaxBetH');
    this.buttonAuto = makeButton('buttonAutoH');
    this.buttonSpin = makeButton('buttonSpinH');
    this.buttonSpinStop = makeButton('buttonSpinStopH');
    this.buttonAutoSpin = makeButton('buttonAutoSpinH');
    this.buttonAutoSpinStop = makeButton('buttonSpinStopH');

    this.buttonMenuText = new PIXI.Text(global.language.menu, this.textStyleButtons);
    this.buttonMenuHomeText = new PIXI.Text(global.language.home, this.textStyleButtons);
    this.buttonMenuInfoScreenText = new PIXI.Text(global.language.info, this.textStyleButtons);
    this.buttonMenuHistoryText = new PIXI.Text(global.language.history, this.textStyleButtons);
    this.buttonMenuSettingsText = new PIXI.Text(global.language.settings, this.textStyleButtons);
    this.linesText = new PIXI.Text(global.language.lines, this.textStyleButtons);
    this.linesValueText = new PIXI.Text(`0`, this.textStyleValues);
    this.totalBetText = new PIXI.Text(global.language.totalBet, this.textStyleButtons);
    this.totalBetValueText = new PIXI.Text(`0`, this.textStyleValues);
    this.buttonTurboOnText = new PIXI.Text(global.language.turboOn, this.textStyleButtons);
    this.buttonTurboOffText = new PIXI.Text(global.language.turboOff, this.textStyleButtons);
    this.infoText = new PIXI.Text(global.language.infoText1, this.textStyleInfo);
    this.balanceText = new PIXI.Text(global.language.balance, this.textStyleButtons);
    this.balanceValueText = new PIXI.Text(`0`, this.textStyleValues);
    this.buttonMaxBetText = new PIXI.Text(global.language.maxBet, this.textStyleButtons);
    this.buttonAutoText = new PIXI.Text(global.language.auto, this.textStyleButtons);
    this.autoSpinText = new PIXI.Text('0', this.textStyleAutoSpin);

    const volume = this.storageManager.get('soundVolume', 1);
    this.volumeDisabled = volume === 0;
    if (this.volumeDisabled) {
      hide(this.buttonSoundOn);
      show(this.buttonSoundOff);
    } else {
      show(this.buttonSoundOn);
      hide(this.buttonSoundOff);
    }

    this.audioSlider = new AudioSlider(volume, (value) => {
      this.soundManager.setVolume(value);
      if (value === 0) {
        this.volumeDisabled = true;
        show(this.buttonSoundOff);
        hide(this.buttonSoundOn);
      } else if (this.volumeDisabled) {
        this.volumeDisabled = false;
        show(this.buttonSoundOn);
        hide(this.buttonSoundOff);
      }
    });

    hide(
      this.buttonFullScreenOff,
      this.buttonMenuHome,
      this.buttonMenuInfoScreen,
      this.buttonMenuHistory,
      this.buttonMenuSettings,
      this.buttonTurboOff,
      this.buttonSpinStop,
      this.buttonAutoSpin,
      this.buttonAutoSpinStop,
      this.audioSlider,
      this.buttonMenuHomeText,
      this.buttonMenuInfoScreenText,
      this.buttonMenuHistoryText,
      this.buttonMenuSettingsText,
      this.buttonTurboOffText,
      this.autoSpinText,
    );

    this.pixiObject.addChild(
      this.background,
      this.buttonFullScreenOn,
      this.buttonFullScreenOff,
      this.buttonSoundOn,
      this.buttonSoundOff,
      this.buttonMenu,
      this.buttonMenuHome,
      this.buttonMenuInfoScreen,
      this.buttonMenuHistory,
      this.buttonMenuSettings,
      this.lines,
      // this.buttonLinesMinus,
      // this.buttonLinesPlus,
      this.totalBet,
      this.buttonTotalBetMinus,
      this.buttonTotalBetPlus,
      this.buttonTurboOn,
      this.buttonTurboOff,
      this.balance,
      this.buttonMaxBet,
      this.buttonAuto,
      this.buttonSpin,
      this.buttonSpinStop,
      this.buttonAutoSpin,
      this.buttonAutoSpinStop,
      this.audioSlider,
      this.buttonMenuText,
      this.buttonMenuHomeText,
      this.buttonMenuInfoScreenText,
      this.buttonMenuHistoryText,
      this.buttonMenuSettingsText,
      this.linesText,
      this.linesValueText,
      this.totalBetText,
      this.totalBetValueText,
      this.buttonTurboOnText,
      this.buttonTurboOffText,
      this.infoText,
      this.balanceText,
      this.balanceValueText,
      this.buttonMaxBetText,
      this.buttonAutoText,
      this.autoSpinText,
    );

    container.addChild(this.pixiObject);

    this.attachListeners();

    this.eventManager.on('intro#end', this.animate);
  }

  animate = (): void => {
    if (AppStateManager.isFreeSpins || AppStateManager.freeSpinsEnd) {
      return;
    }

    ease.add(this.pixiObject, { alpha: 1, visible: true }, { duration: 500, ease: 'easeInQuad' });
  };

  attachListeners = (): void => {
    this.buttonFullScreenOn.addListener('mouseup', () => {
      if (this.toggleFullScreen()) {
        show(this.buttonFullScreenOff);
        hide(this.buttonFullScreenOn);
      } else {
        hide(this.buttonFullScreenOff);
        show(this.buttonFullScreenOn);
      }
    });
    this.buttonFullScreenOff.addListener('mouseup', () => {
      if (this.toggleFullScreen()) {
        show(this.buttonFullScreenOff);
        hide(this.buttonFullScreenOn);
      } else {
        hide(this.buttonFullScreenOff);
        show(this.buttonFullScreenOn);
      }
    });
    this.buttonFullScreenOn.addListener('touchend', () => {
      if (this.toggleFullScreen()) {
        show(this.buttonFullScreenOff);
        hide(this.buttonFullScreenOn);
      } else {
        hide(this.buttonFullScreenOff);
        show(this.buttonFullScreenOn);
      }
    });
    this.buttonFullScreenOff.addListener('touchend', () => {
      if (this.toggleFullScreen()) {
        show(this.buttonFullScreenOff);
        hide(this.buttonFullScreenOn);
      } else {
        hide(this.buttonFullScreenOff);
        show(this.buttonFullScreenOn);
      }
    });
    this.buttonSoundOn.addListener('pointerup', this.toggleAudioSlider);
    this.buttonSoundOff.addListener('pointerup', this.toggleAudioSlider);
    this.buttonMenu.addListener('pointerup', this.toggleMenu);
    this.buttonMenuHome.addListener('pointerup', () => {
      if (this.lobby) {
        window.location.href = this.lobby;
      }
    });
    this.buttonMenuInfoScreen.addListener('pointerup', () => {
      this.eventManager.emit('closeAllOptions', 'paytableOptions');
      this.eventManager.emit('paytableOptions#toggle');
    });
    this.buttonMenuHistory.addListener('pointerup', () => {
      const token = this.urlParams.get('token');
      const history = this.urlParams.get('history');
      const language = this.urlParams.get('language');

      if (token && history && language) {
        popupCenter(`${history}?language=${language}&session=${token}`, 'History', vw(50), vh(50));
      } else {
        alert('There is no all required params in URL to access to history!');
      }
    });
    this.buttonMenuSettings.addListener('pointerup', () => {
      this.eventManager.emit('closeAllOptions', 'settingsOptions');
      this.eventManager.emit('settingsOptions#toggle');
    });
    // this.buttonLinesMinus.addListener('pointerup', () => this.eventManager.emit('lines#decrement'));
    // this.buttonLinesPlus.addListener('pointerup', () => this.eventManager.emit('lines#increment'));
    this.buttonTotalBetMinus.addListener('pointerup', () => this.eventManager.emit('bet#decrement'));
    this.buttonTotalBetPlus.addListener('pointerup', () => this.eventManager.emit('bet#increment'));
    this.buttonTurboOn.addListener('pointerup', () => {
      this.spinManager.handleQuickSpin();
      this.storageManager.set('quickSpin', true);
    });
    this.buttonTurboOff.addListener('pointerup', () => {
      this.spinManager.handleQuickSpin();
      this.storageManager.set('quickSpin', false);
    });
    this.buttonMaxBet.addListener('pointerup', () => this.eventManager.emit('maxBet'));
    this.buttonAuto.addListener('pointerdown', () => {
      this.eventManager.emit('closeAllOptions', 'autoplayOptions');
      this.eventManager.emit('autoplayOptions#toggle');
    });
    this.buttonSpin.addListener('pointerup', this.spinManager.handleSpin);
    this.buttonSpinStop.addListener('pointerup', this.spinManager.handleSpin);
    this.buttonAutoSpin.addListener('pointerup', this.spinManager.handleAutoSpin);
    this.buttonAutoSpinStop.addListener('pointerup', () => {
      if (AppStateManager.isFreeSpins && !AppStateManager.freeSpinsStart) {
        this.spinManager.spinsLeft = 0;
        this.spinManager.isUntilFeature = false;
        this.eventManager.emit('autoSpin#end');
      } else {
        this.enableUI();
        this.spinManager.handleAutoSpin();
      }
    });

    this.appStateManager.addListener('data.player.balance', (credit) => {
      this.credit = credit;
    });

    this.eventManager.on(`lines#change`, (lines: number) => {
      const bet = this.settingsStateManager.stakePerLine;

      this.linesValueText.text = lines.toString();
      this.totalBetValueText.text =
        global.currency.beforeAmount === true
          ? global.currency.currencySymbol +
            (lines * bet).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : (lines * bet).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
            global.currency.currencySymbol;

      this.applyTextPositions();
    });

    this.eventManager.on(`bet#change`, (bet: number) => {
      const lines = this.settingsStateManager.selectedLines;

      this.linesValueText.text = lines.toString();
      this.totalBetValueText.text =
        global.currency.beforeAmount === true
          ? global.currency.currencySymbol +
            (lines * bet).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : (lines * bet).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
            global.currency.currencySymbol;

      this.applyTextPositions();
    });

    this.eventManager.on(`credit#change`, (credit) => {
      this.balanceValueText.text =
        global.currency.beforeAmount === true
          ? global.currency.currencySymbol +
            credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
            global.currency.currencySymbol;

      this.applyTextPositions();
    });

    this.eventManager.emit(`bet#load`);
    this.eventManager.emit(`lines#load`);
    this.eventManager.emit(`credit#load`);

    this.eventManager.once('intro#end', () => {
      if (AppStateManager.isFreeSpins) {
        this.eventManager.emit(`freeSpins#start`);
        this.infoText.text = `${global.language.freeSpins} ${AppStateManager.freeSpinsCountTotal - AppStateManager.freeSpinsCount} ${global.language.of} ${AppStateManager.freeSpinsCountTotal}`;
        this.applyOnlyInfoTextPositions();
        this.disableUI();
      }

      if (AppStateManager.freeSpinsEnd) {
        this.applyOnlyInfoTextPositions();
        this.disableUI();
        this.eventManager.emit('freeSpins#end');
      }
    });

    this.eventManager.on(`animateBigWin`, () => {
      ease.add(this.pixiObject, { alpha: 0, visible: false }, { duration: 300, ease: 'easeInQuad' });
    });

    this.eventManager.on(`animateBigWin#end`, () => {
      ease.add(this.pixiObject, { alpha: 1, visible: true }, { duration: 300, ease: 'easeInQuad' });
    });

    this.eventManager.on('spin#start', () => {
      this.eventManager.emit('closeAllOptions', '');

      this.isWin = false;

      if (!AppStateManager.isFreeSpins) {
        this.infoText.text = global.language.infoText2;
      }

      if (this.spinManager.isAutoSpinning) {
        if (this.spinManager.isUntilFeature) {
          this.autoSpinText.text = '∞';
        } else {
          if (!AppStateManager.isFreeSpins) this.spinManager.spinsLeft--;
          this.autoSpinText.text = String(this.spinManager.spinsLeft);
        }
      }

      if (AppStateManager.isFreeSpins) {
        this.infoText.text = `${global.language.freeSpins} ${AppStateManager.freeSpinsCountTotal - AppStateManager.freeSpinsCount + 1} ${global.language.of} ${AppStateManager.freeSpinsCountTotal}`;
        this.applyOnlyInfoTextPositions();
      }

      if (this.credit && !AppStateManager.isFreeSpins) {
        const totalBet = this.settingsStateManager.total_stake;
        this.balanceValueText.text =
          global.currency.beforeAmount === true
            ? global.currency.currencySymbol +
              (this.credit - totalBet).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : (this.credit - totalBet).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) + global.currency.currencySymbol;

        this.applyTextPositions();
      }

      this.disableUI();
      this.removeInfoTextEase();
      this.applyOnlyInfoTextPositions();
      this.applyOnlyAutoSpinText();
    });

    this.eventManager.on('reel#start', () => {
      if (
        !this.spinManager.isAutoSpinning ||
        (this.spinManager.isAutoSpinning &&
          this.spinManager.spinsLeft === 0 &&
          this.spinManager.isUntilFeature === false)
      ) {
        show(this.buttonSpinStop);
        hide(this.buttonSpin);
      }
    });

    this.eventManager.on('spin#end', () => {
      if (!AppStateManager.isFreeSpins && !this.spinManager.isAutoSpinning) {
        if (!this.isWin) {
          this.infoText.text = global.language.infoText1;
          this.applyOnlyInfoTextPositions();
        }
        this.enableUI();
      }

      if (AppStateManager.isFreeSpins && !AppStateManager.freeSpinsStart && !this.isWin) {
        this.infoText.text = `${global.language.freeSpins} ${AppStateManager.freeSpinsCountTotal - AppStateManager.freeSpinsCount} ${global.language.of} ${AppStateManager.freeSpinsCountTotal}`;
        this.applyOnlyInfoTextPositions();
      }

      if (this.credit) {
        this.balanceValueText.text =
          global.currency.beforeAmount === true
            ? global.currency.currencySymbol +
              this.credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : this.credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
              global.currency.currencySymbol;

        this.applyTextPositions();
      }
    });

    this.eventManager.on('reel#end', () => {
      if (
        !this.spinManager.isAutoSpinning ||
        (this.spinManager.isAutoSpinning &&
          this.spinManager.spinsLeft === 0 &&
          this.spinManager.isUntilFeature === false)
      ) {
        show(this.buttonSpin);
        hide(this.buttonSpinStop);
      }
    });

    this.eventManager.on('freeSpins#start', () => {
      this.infoText.text = global.language.infoText3;
      this.applyOnlyInfoTextPositions();
      this.hideUI();
    });

    this.eventManager.on('freeSpins#end', () => {
      this.infoText.text = global.language.infoText4;
      this.applyOnlyInfoTextPositions();
      this.hideUI();
    });

    this.eventManager.on('autoSpin#start', () => {
      if (this.spinManager.spinsLeft !== 0) {
        show(this.buttonAutoSpinStop, this.autoSpinText);
        hide(this.buttonAutoSpin);
      }
    });

    this.eventManager.on('autoSpin#end', () => {
      if (this.spinManager.isSpinning) {
        show(this.buttonSpinStop);
        hide(this.buttonSpin, this.buttonAutoSpinStop, this.autoSpinText);
      } else {
        show(this.buttonSpin);
        hide(this.buttonSpinStop, this.buttonAutoSpinStop, this.autoSpinText);
      }
    });

    this.eventManager.on('quickSpin#start', () => {
      show(this.buttonTurboOff, this.buttonTurboOffText);
      hide(this.buttonTurboOn, this.buttonTurboOnText);
    });

    this.eventManager.on('quickSpin#end', () => {
      show(this.buttonTurboOn, this.buttonTurboOnText);
      hide(this.buttonTurboOff, this.buttonTurboOffText);
    });

    const quickSpinEnabled = this.storageManager.get('quickSpin', false);
    if (quickSpinEnabled) {
      this.spinManager.handleQuickSpin();
    }

    this.eventManager.on('showAutoSpinButton', (spinsLeft: number, isUntilFeature: boolean) => {
      this.spinManager.spinsLeft = spinsLeft;
      this.spinManager.isUntilFeature = isUntilFeature;

      if (isUntilFeature) {
        this.autoSpinText.text = '∞';
      } else {
        this.autoSpinText.text = String(spinsLeft);
      }
      this.applyOnlyAutoSpinText();

      show(this.buttonAutoSpin, this.autoSpinText);
      hide(this.buttonSpin);
    });

    this.eventManager.on('hideAutoSpinButton', () => {
      this.spinManager.spinsLeft = 0;
      this.spinManager.isUntilFeature = false;

      this.autoSpinText.text = '';
      this.applyOnlyAutoSpinText();

      show(this.buttonSpin);
      hide(this.buttonAutoSpin, this.autoSpinText);
    });

    this.eventManager.on('animateWin', (totalWin: number) => {
      this.isWin = true;

      this.removeInfoTextEase();

      this.infoText.text =
        global.currency.beforeAmount === true
          ? `${global.language.win} ${global.currency.currencySymbol}${totalWin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : `${global.language.win} ${totalWin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${global.currency.currencySymbol}`;

      this.applyOnlyInfoTextPositions();

      ease.add(this.infoText, { scale: 1.1 }, { reverse: true, duration: 1000, ease: 'linear' }).on('each', () => {
        this.applyOnlyInfoTextPositions();
      });
    });

    this.eventManager.on('enableUI', this.enableUI);
    this.eventManager.on('showUI', this.showUI);

    this.eventManager.on('closeAllOptions', () => {
      this.audioSliderShowing = false;
      this.menuShowing = false;

      hide(this.audioSlider);
      hide(
        this.buttonMenuHome,
        this.buttonMenuInfoScreen,
        this.buttonMenuHistory,
        this.buttonMenuSettings,
        this.buttonMenuHomeText,
        this.buttonMenuInfoScreenText,
        this.buttonMenuHistoryText,
        this.buttonMenuSettingsText,
      );
    });

    document.addEventListener('keyup', (event) => {
      if (
        event.code === 'Space' &&
        BottomDesktop.spaceBarToSpin === true &&
        this.pixiObject.visible &&
        this.pixiObject.alpha == 1
      ) {
        if (this.buttonSpin.visible || this.buttonSpinStop.visible) {
          this.spinManager.handleSpin();
        } else if (this.buttonAutoSpin.visible) {
          this.spinManager.handleAutoSpin();
        } else if (this.buttonAutoSpinStop.visible) {
          if (AppStateManager.isFreeSpins && !AppStateManager.freeSpinsStart) {
            this.spinManager.spinsLeft = 0;
            this.spinManager.isUntilFeature = false;
            this.eventManager.emit('autoSpin#end');
          } else {
            this.enableUI();
            this.spinManager.handleAutoSpin();
          }
        }
      }
    });
  };

  toggleFullScreen(): boolean {
    const document: any = window.document;
    const fullScreenEnabled =
      document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.mozFullscreenEnabled ||
      document.msFullscreenEnabled
        ? true
        : false;

    if (!fullScreenEnabled) {
      alert('This browser does not support this feature!');
      return false;
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
      return true;
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      return false;
    }
  }

  toggleAudioSlider = (): void => {
    this.audioSliderShowing = !this.audioSliderShowing;

    if (this.audioSliderShowing) {
      show(this.audioSlider);
    } else {
      hide(this.audioSlider);
    }
  };

  toggleMenu = (): void => {
    this.menuShowing = !this.menuShowing;

    if (this.menuShowing) {
      if (this.lobby) show(this.buttonMenuHome, this.buttonMenuHomeText);

      show(
        this.buttonMenuInfoScreen,
        this.buttonMenuHistory,
        this.buttonMenuSettings,
        this.buttonMenuInfoScreenText,
        this.buttonMenuHistoryText,
        this.buttonMenuSettingsText,
      );
    } else {
      hide(
        this.buttonMenuHome,
        this.buttonMenuInfoScreen,
        this.buttonMenuHistory,
        this.buttonMenuSettings,
        this.buttonMenuHomeText,
        this.buttonMenuInfoScreenText,
        this.buttonMenuHistoryText,
        this.buttonMenuSettingsText,
      );
    }
  };

  disableUI = (): void => {
    this.buttonMenu.setDisabled(true);
    this.buttonMenuHome.setDisabled(true);
    this.buttonMenuInfoScreen.setDisabled(true);
    this.buttonMenuHistory.setDisabled(true);
    this.buttonMenuSettings.setDisabled(true);
    // this.buttonLinesMinus.setDisabled(true);
    // this.buttonLinesPlus.setDisabled(true);
    this.buttonTotalBetMinus.setDisabled(true);
    this.buttonTotalBetPlus.setDisabled(true);
    this.buttonTurboOn.setDisabled(true);
    this.buttonTurboOff.setDisabled(true);
    this.buttonMaxBet.setDisabled(true);
    this.buttonAuto.setDisabled(true);
  };

  enableUI = (): void => {
    this.buttonMenu.setDisabled(false);
    this.buttonMenuHome.setDisabled(false);
    this.buttonMenuInfoScreen.setDisabled(false);
    this.buttonMenuHistory.setDisabled(false);
    this.buttonMenuSettings.setDisabled(false);
    // this.buttonLinesMinus.setDisabled(false);
    // this.buttonLinesPlus.setDisabled(false);
    this.buttonTotalBetMinus.setDisabled(false);
    this.buttonTotalBetPlus.setDisabled(false);
    this.buttonTurboOn.setDisabled(false);
    this.buttonTurboOff.setDisabled(false);
    this.buttonMaxBet.setDisabled(false);
    this.buttonAuto.setDisabled(false);
  };

  hideUI = (): void => {
    ease.add(this.pixiObject, { alpha: 0, visible: false }, { duration: 500, ease: 'easeInQuad' });
  };

  showUI = (): void => {
    ease.add(this.pixiObject, { alpha: 1, visible: true }, { duration: 500, ease: 'easeInQuad' });
  };

  removeInfoTextEase = (): void => {
    ease.removeEase(this.infoText);
    this.infoText.scale.x = this.infoText.scale.y = 1;
  };

  applyTextPositions(): void {
    this.textStyleButtons.fontSize = vw(1.4);
    this.textStyleButtons.wordWrapWidth = pxVw(100);

    this.textStyleValues.fontSize = vw(1.2);
    this.textStyleValues.wordWrapWidth = pxVw(10);

    this.totalBetText.style.wordWrap = true;
    this.totalBetText.style.wordWrapWidth = pxVw(250);

    this.balanceText.style.wordWrap = true;
    this.balanceText.style.wordWrapWidth = pxVw(250);

    this.buttonMenuText.position.x =
      this.buttonMenu.position.x + this.buttonMenu.width / 2 - this.buttonMenuText.width / 2;
    this.buttonMenuText.position.y =
      this.buttonMenu.position.y + this.buttonMenu.height / 2 - this.buttonMenuText.height / 2;
    this.buttonMenuHomeText.position.x = this.buttonMenuHome.position.x + pxVw(75);
    this.buttonMenuHomeText.position.y =
      this.buttonMenuHome.position.y + this.buttonMenuHome.height / 2 - this.buttonMenuHomeText.height / 2;
    this.buttonMenuInfoScreenText.position.x = this.buttonMenuInfoScreen.position.x + pxVw(75);
    this.buttonMenuInfoScreenText.position.y =
      this.buttonMenuInfoScreen.position.y +
      this.buttonMenuInfoScreen.height / 2 -
      this.buttonMenuInfoScreenText.height / 2;
    this.buttonMenuHistoryText.position.x = this.buttonMenuHistory.position.x + pxVw(75);
    this.buttonMenuHistoryText.position.y =
      this.buttonMenuHistory.position.y + this.buttonMenuHistory.height / 2 - this.buttonMenuHistoryText.height / 2;
    this.buttonMenuSettingsText.position.x = this.buttonMenuSettings.position.x + pxVw(75);
    this.buttonMenuSettingsText.position.y =
      this.buttonMenuSettings.position.y + this.buttonMenuSettings.height / 2 - this.buttonMenuSettingsText.height / 2;
    this.linesText.position.x = this.lines.position.x + this.lines.width / 2 - this.linesText.width / 2;
    this.linesText.position.y = pxVw(30);
    this.linesValueText.position.x = this.lines.position.x + this.lines.width / 2 - this.linesValueText.width / 2;
    this.linesValueText.position.y = pxVw(85);
    this.totalBetText.position.x = this.totalBet.position.x + this.totalBet.width / 2 - this.totalBetText.width / 2;
    this.totalBetText.position.y = pxVw(30);
    this.totalBetValueText.position.x =
      this.totalBet.position.x + this.totalBet.width / 2 - this.totalBetValueText.width / 2;
    this.totalBetValueText.position.y = pxVw(85);
    this.buttonTurboOnText.position.x =
      this.buttonTurboOn.position.x + this.buttonTurboOn.width / 2 - this.buttonTurboOnText.width / 2;
    this.buttonTurboOnText.position.y =
      this.buttonTurboOn.position.y + this.buttonTurboOn.height / 2 - this.buttonTurboOnText.height / 2;
    this.buttonTurboOffText.position.x =
      this.buttonTurboOff.position.x + this.buttonTurboOff.width / 2 - this.buttonTurboOffText.width / 2;
    this.buttonTurboOffText.position.y =
      this.buttonTurboOff.position.y + this.buttonTurboOff.height / 2 - this.buttonTurboOffText.height / 2;
    this.balanceText.position.x = this.balance.position.x + this.balance.width / 2 - this.balanceText.width / 2;
    this.balanceText.position.y = pxVw(30);
    this.balanceValueText.position.x =
      this.balance.position.x + this.balance.width / 2 - this.balanceValueText.width / 2;
    this.balanceValueText.position.y = pxVw(85);
    this.buttonMaxBetText.position.x =
      this.buttonMaxBet.position.x + this.buttonMaxBet.width / 2 - this.buttonMaxBetText.width / 2;
    this.buttonMaxBetText.position.y =
      this.buttonMaxBet.position.y + this.buttonMaxBet.height / 2 - this.buttonMaxBetText.height / 2;
    this.buttonAutoText.position.x =
      this.buttonAuto.position.x + this.buttonAuto.width / 2 - this.buttonAutoText.width / 2;
    this.buttonAutoText.position.y =
      this.buttonAuto.position.y + this.buttonAuto.height / 2 - this.buttonAutoText.height / 2;
  }

  applyOnlyAutoSpinText(): void {
    if (this.spinManager.isUntilFeature) {
      this.textStyleAutoSpin.fontSize = vw(3);
    } else {
      this.textStyleAutoSpin.fontSize = vw(1.4);
    }

    this.autoSpinText.position.x =
      this.buttonAutoSpin.position.x + this.buttonAutoSpin.width / 2 - this.autoSpinText.width / 2;
    this.autoSpinText.position.y =
      this.buttonAutoSpin.position.y + this.buttonAutoSpin.height / 2 - this.autoSpinText.height / 2;
  }

  applyOnlyInfoTextPositions(): void {
    this.textStyleInfo.fontSize = vw(1.4);
    this.textStyleInfo.wordWrapWidth = pxVw(300);

    // const startH = this.buttonTurboOn.position.x + this.buttonTurboOn.width;
    // const endH = this.balance.position.x;
    // this.infoText.position.x = startH + ((endH - startH) / 2) - (this.infoText.width / 2);
    this.infoText.position.x = this.background.position.x + this.background.width / 2 - this.infoText.width / 2;
    this.infoText.position.y = this.background.position.y + this.background.height / 2 - this.infoText.height / 2;
  }

  calculateSizes(): void {
    this.background.width = vw(100);
    this.background.height = pxVw(141);
    this.background.position.x = 0;
    this.pixiObject.position.y = vh(100) - this.background.height;

    this.buttonFullScreenOn.width = this.buttonFullScreenOff.width = pxVw(60);
    this.buttonFullScreenOn.height = this.buttonFullScreenOff.height = pxVw(52);
    this.buttonFullScreenOn.position.x = this.buttonFullScreenOff.position.x = pxVw(60);
    this.buttonFullScreenOn.position.y = this.buttonFullScreenOff.position.y = pxVw(25);

    this.buttonSoundOn.width = this.buttonSoundOff.width = pxVw(60);
    this.buttonSoundOn.height = this.buttonSoundOff.height = pxVw(52);
    this.buttonSoundOn.position.x = this.buttonSoundOff.position.x = pxVw(60);
    this.buttonSoundOn.position.y = this.buttonSoundOff.position.y = pxVw(83);

    this.audioSlider.calculateSizes();
    this.audioSlider.position.x =
      this.buttonSoundOn.position.x + this.buttonSoundOn.width / 2 - this.audioSlider.width / 2;
    this.audioSlider.position.y = this.buttonFullScreenOn.position.y - this.audioSlider.height * 1;

    this.buttonMenu.width = pxVw(120);
    this.buttonMenu.height = pxVw(110);
    this.buttonMenu.position.x = pxVw(135);
    this.buttonMenu.position.y = pxVw(25);

    this.buttonMenuInfoScreen.width = pxVw(300);
    this.buttonMenuInfoScreen.height = pxVw(90);
    this.buttonMenuInfoScreen.position.x = this.buttonMenu.position.x;
    this.buttonMenuInfoScreen.position.y = this.buttonMenu.position.y - this.buttonMenuInfoScreen.height * 3 - pxVw(10);

    this.buttonMenuHistory.width = this.buttonMenuInfoScreen.width;
    this.buttonMenuHistory.height = this.buttonMenuInfoScreen.height;
    this.buttonMenuHistory.position.x = this.buttonMenu.position.x;
    this.buttonMenuHistory.position.y = this.buttonMenu.position.y - this.buttonMenuHistory.height * 2 - pxVw(10);

    this.buttonMenuSettings.width = this.buttonMenuInfoScreen.width;
    this.buttonMenuSettings.height = this.buttonMenuInfoScreen.height;
    this.buttonMenuSettings.position.x = this.buttonMenu.position.x;
    this.buttonMenuSettings.position.y = this.buttonMenu.position.y - this.buttonMenuSettings.height * 1 - pxVw(10);

    this.buttonMenuHome.width = this.buttonMenuInfoScreen.width;
    this.buttonMenuHome.height = this.buttonMenuInfoScreen.height;
    this.buttonMenuHome.position.x = this.buttonMenu.position.x;
    this.buttonMenuHome.position.y = this.buttonMenu.position.y - this.buttonMenuInfoScreen.height * 4 - pxVw(10);

    this.lines.width = pxVw(120);
    this.lines.height = this.buttonMenu.height;
    this.lines.position.x = pxVw(270);
    this.lines.position.y = this.buttonMenu.position.y;

    // this.buttonLinesMinus.width = pxVw(50);
    // this.buttonLinesMinus.height = pxVw(50);
    // this.buttonLinesMinus.position.x = this.lines.position.x;
    // this.buttonLinesMinus.position.y = pxVw(75);

    // this.buttonLinesPlus.width = pxVw(50);
    // this.buttonLinesPlus.height = pxVw(50);
    // this.buttonLinesPlus.position.x = this.lines.position.x + this.lines.width - this.buttonLinesPlus.width;
    // this.buttonLinesPlus.position.y = pxVw(75);

    this.totalBet.width = pxVw(250);
    this.totalBet.height = this.buttonMenu.height;
    this.totalBet.position.x = pxVw(407);
    this.totalBet.position.y = this.buttonMenu.position.y;

    this.buttonTotalBetMinus.width = pxVw(50);
    this.buttonTotalBetMinus.height = pxVw(50);
    this.buttonTotalBetMinus.position.x = this.totalBet.position.x;
    this.buttonTotalBetMinus.position.y = pxVw(75);

    this.buttonTotalBetPlus.width = pxVw(50);
    this.buttonTotalBetPlus.height = pxVw(50);
    this.buttonTotalBetPlus.position.x = this.totalBet.position.x + this.totalBet.width - this.buttonTotalBetPlus.width;
    this.buttonTotalBetPlus.position.y = pxVw(75);

    this.buttonTurboOn.width = this.buttonTurboOff.width = this.buttonMenu.width;
    this.buttonTurboOn.height = this.buttonTurboOff.height = this.buttonMenu.height;
    this.buttonTurboOn.position.x = this.buttonTurboOff.position.x = pxVw(670);
    this.buttonTurboOn.position.y = this.buttonTurboOff.position.y = this.buttonMenu.position.y;

    this.balance.width = pxVw(195);
    this.balance.height = this.buttonMenu.height;
    this.balance.position.x = pxVw(1133);
    this.balance.position.y = this.buttonMenu.position.y;

    this.buttonMaxBet.width = this.buttonMenu.width;
    this.buttonMaxBet.height = this.buttonMenu.height;
    this.buttonMaxBet.position.x = pxVw(1341);
    this.buttonMaxBet.position.y = this.buttonMenu.position.y;

    this.buttonAuto.width = this.buttonMenu.width;
    this.buttonAuto.height = this.buttonMenu.height;
    this.buttonAuto.position.x = pxVw(1477);
    this.buttonAuto.position.y = this.buttonMenu.position.y;

    this.buttonSpin.width =
      this.buttonSpinStop.width =
      this.buttonAutoSpin.width =
      this.buttonAutoSpinStop.width =
        pxVw(239);
    this.buttonSpin.height =
      this.buttonSpinStop.height =
      this.buttonAutoSpin.height =
      this.buttonAutoSpinStop.height =
        this.buttonMenu.height;
    this.buttonSpin.position.x =
      this.buttonSpinStop.position.x =
      this.buttonAutoSpin.position.x =
      this.buttonAutoSpinStop.position.x =
        pxVw(1612);
    this.buttonSpin.position.y =
      this.buttonSpinStop.position.y =
      this.buttonAutoSpin.position.y =
      this.buttonAutoSpinStop.position.y =
        this.buttonMenu.position.y;

    this.applyTextPositions();
    this.applyOnlyAutoSpinText();
    this.applyOnlyInfoTextPositions();
  }
}

export default BottomDesktop;
