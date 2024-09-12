import * as PIXI from 'pixi.js';
import RenderObject from '../../RenderObject';
import { horizontallyCenter, pxVw, pxVwM, vh, vw, isHeightBased } from '../../../utils/size';
import Button from '../Button';
import { hide, isMobileVertical, makeButton, show } from '../../../utils/helpers';
import EventManager from '../../../managers/EventManager';
import SpinManager from '../../../managers/SpinManager';
import SoundManager from '../../../managers/SoundManager';
import StorageManager from '../../../managers/StorageManager';
import AppStateManager from '../../../managers/AppStateManager';
import SettingsStateManager from '../../../managers/SettingsStateManager';
import { ease } from 'pixi-ease';
import Slider from '../Slider';
import Burger from './Burger';

class BottomMobile implements RenderObject {
  eventManager: EventManager;
  spinManager: SpinManager;
  soundManager: SoundManager;
  storageManager: StorageManager;
  appStateManager: AppStateManager;
  settingsStateManager: SettingsStateManager;

  pixiObject: PIXI.Container;

  //linesContainer: PIXI.Container;
  totalBetContainer: PIXI.Container;

  textStyleButtons: PIXI.TextStyle;
  textStyleInfo: PIXI.TextStyle;
  textStyleStatusBar: PIXI.TextStyle;
  textStyleAutoHold: PIXI.TextStyle;
  textStyleAutoSpin: PIXI.TextStyle;

  statusBar: PIXI.Sprite;
  buttonMenu: Button;
  buttonTurboOn: Button;
  buttonTurboOff: Button;
  buttonSpin: Button;
  buttonSpinStop: Button;
  buttonAutoSpin: Button;
  buttonAutoSpinStop: Button;
  //buttonLines: Button;
  buttonTotalBet: Button;
  // sliderLinesBackground: PIXI.Sprite;
  // sliderLines: Slider;
  sliderTotalBetBackground: PIXI.Sprite;
  sliderTotalBet: Slider;

  statusBarBalanceText: PIXI.Text;
  statusBarBetText: PIXI.Text;
  statusBarWinText: PIXI.Text;
  //linesText: PIXI.Text;
  totalBetText: PIXI.Text;
  autoHoldText: PIXI.Text;
  autoSpinText: PIXI.Text;
  infoText: PIXI.Text;

  linesSliderShowing = false;
  totalBetSliderShowing = false;
  volumeDisabled = false;
  isWin = false;

  currency!: string;
  credit!: number;

  queryString: string;
  urlParams: URLSearchParams;
  lobby: string | null;

  burger: Burger;

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
    this.pixiObject.name = 'BottomMobile';
    hide(this.pixiObject);

    this.textStyleButtons = new PIXI.TextStyle({
      fill: 'white',
      stroke: 'black',
      strokeThickness: 2,
      lineJoin: 'round',
      fontSize: isMobileVertical() ? vw(3) : vw(2),
      fontWeight: 'bold',
      align: 'center',
    });
    this.textStyleInfo = new PIXI.TextStyle({
      fill: '#ffffcc',
      stroke: 'black',
      strokeThickness: 2,
      lineJoin: 'round',
      fontSize: isMobileVertical() ? vw(4) : vw(2),
      fontWeight: 'bold',
      align: 'center',
    });
    this.textStyleStatusBar = new PIXI.TextStyle({
      fill: 'white',
      stroke: 'black',
      strokeThickness: 2,
      lineJoin: 'round',
      fontSize: isMobileVertical() ? vw(3) : vw(2),
      fontWeight: 'bold',
      align: 'center',
    });
    this.textStyleAutoHold = new PIXI.TextStyle({
      fill: 'white',
      stroke: 'black',
      strokeThickness: 1,
      lineJoin: 'round',
      fontSize: isMobileVertical() ? vw(2.5) : vw(1.5),
      fontWeight: 'bold',
      wordWrap: true,
      wordWrapWidth: isMobileVertical() ? pxVwM(150) : pxVw(150),
      align: 'center',
    });
    this.textStyleAutoSpin = new PIXI.TextStyle({
      fill: 'black',
      stroke: 'white',
      strokeThickness: 2,
      lineJoin: 'round',
      fontSize: isMobileVertical() ? vw(4) : vw(2),
      fontWeight: 'bold',
      align: 'center',
    });

    // this.linesContainer = new PIXI.Container();
    // this.linesContainer.eventMode = "static";
    this.totalBetContainer = new PIXI.Container();
    this.totalBetContainer.eventMode = 'static';

    this.statusBar = PIXI.Sprite.from('bottomStatusBarV');
    this.buttonMenu = makeButton('buttonMenuV');
    this.buttonTurboOn = makeButton('buttonTurboOnV');
    this.buttonTurboOff = makeButton('buttonTurboOffV');
    this.buttonSpin = makeButton('buttonSpinV');
    this.buttonSpinStop = makeButton('buttonSpinStopV');
    this.buttonAutoSpin = makeButton('buttonAutoSpinV');
    this.buttonAutoSpinStop = makeButton('buttonSpinStopV');
    //this.buttonLines = makeButton('buttonLinesV');
    this.buttonTotalBet = makeButton('buttonTotalBetV');
    //this.sliderLinesBackground = PIXI.Sprite.from('sliderBackgroundV');
    // this.sliderLines = new Slider(
    //   this.settingsStateManager.lines.map((option) => (this.settingsStateManager.lines.indexOf(option) + 1).toString()),
    //   (stepIndex) => {
    //     this.eventManager.emit('lines#set', stepIndex + 1);
    //   },
    // );
    this.sliderTotalBetBackground = PIXI.Sprite.from('sliderBackgroundV');
    this.sliderTotalBet = new Slider(
      this.settingsStateManager.stakeList.map((option) =>
        (option * this.settingsStateManager.selectedLines).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      ),
      (stepIndex) => {
        this.eventManager.emit('bet#set', stepIndex);
      },
    );

    this.statusBarBalanceText = new PIXI.Text(`${global.language.balance}\n0.00`, this.textStyleStatusBar);
    this.statusBarBetText = new PIXI.Text(`${global.language.bet}\n0.00`, this.textStyleStatusBar);
    this.statusBarWinText = new PIXI.Text(`${global.language.win}\n0.00`, this.textStyleStatusBar);
    //this.linesText = new PIXI.Text(global.language.lines, this.textStyleButtons);
    this.totalBetText = new PIXI.Text(global.language.totalBet, this.textStyleButtons);
    this.autoHoldText = new PIXI.Text(global.language.autoHold, this.textStyleAutoHold);
    this.autoSpinText = new PIXI.Text('0', this.textStyleAutoSpin);
    this.infoText = new PIXI.Text(global.language.infoText1, this.textStyleInfo);

    this.burger = new Burger();
    this.burger.name = 'Burger';

    hide(
      this.buttonTurboOff,
      this.buttonSpinStop,
      this.buttonAutoSpin,
      this.buttonAutoSpinStop,
      //this.linesContainer,
      this.totalBetContainer,
      this.autoSpinText,
      this.burger,
    );

    // this.linesContainer.addChild(
    //   this.sliderLinesBackground,
    //   this.linesText,
    //   this.sliderLines,
    // );

    this.totalBetContainer.addChild(this.sliderTotalBetBackground, this.totalBetText, this.sliderTotalBet);

    this.pixiObject.addChild(
      this.statusBar,
      this.buttonMenu,
      this.buttonTurboOn,
      this.buttonTurboOff,
      this.buttonSpin,
      this.buttonSpinStop,
      this.buttonAutoSpin,
      this.buttonAutoSpinStop,
      //this.buttonLines,
      this.buttonTotalBet,
      this.statusBarBalanceText,
      this.statusBarBetText,
      this.statusBarWinText,
      this.autoHoldText,
      this.autoSpinText,
      this.infoText,
      //this.linesContainer,
      this.totalBetContainer,
      this.burger,
    );

    container.addChild(this.pixiObject);

    this.attachListeners();
    this.statusBarWinText.text =
      global.currency.beforeAmount === true
        ? `${global.language.win}\n${global.currency.currencySymbol}0.00`
        : `${global.language.win}\n0.00${global.currency.currencySymbol}`;

    this.eventManager.on('intro#end', this.animate);
  }

  animate = (): void => {
    if (AppStateManager.isFreeSpins || AppStateManager.freeSpinsEnd) {
      return;
    }

    ease.add(this.pixiObject, { alpha: 1, visible: true }, { duration: 500, ease: 'easeInQuad' });
  };

  attachListeners = (): void => {
    let touchCounter = 0;

    document.addEventListener('touchstart', () => {
      touchCounter++;
    });

    document.addEventListener('touchend', () => {
      touchCounter--;
    });

    this.buttonMenu.addListener('touchend', () => {
      if (touchCounter > 1 || !this.buttonMenu.isHit) return;
      this.eventManager.emit('closeAllOptions', '');
      this.eventManager.emit('burger#show');
      this.buttonMenu.isHit = false;
    });
    this.buttonTurboOn.addListener('touchend', () => {
      if (touchCounter > 1 || !this.buttonTurboOn.isHit) return;
      this.spinManager.handleQuickSpin();
      this.storageManager.set('quickSpin', true);
      this.buttonTurboOn.isHit = false;
    });
    this.buttonTurboOff.addListener('touchend', () => {
      if (touchCounter > 1 || !this.buttonTurboOff.isHit) return;
      this.spinManager.handleQuickSpin();
      this.storageManager.set('quickSpin', false);
      this.buttonTurboOff.isHit = false;
    });

    let mouseIsDown = false;
    let mouseWasDown = false;
    let timeout: any;

    this.buttonSpin.addListener('touchstart', () => {
      if (AppStateManager.isFreeSpins) return;
      mouseIsDown = true;

      if (!this.spinManager.isSpinning) {
        timeout = setTimeout(() => {
          if (mouseIsDown) {
            mouseWasDown = true;
            this.eventManager.emit('closeAllOptions', 'autoplayOptions');
            this.eventManager.emit('autoplayOptions#toggle');
          }
        }, 1500);
      }
    });

    this.buttonSpin.addListener('touchend', () => {
      if (touchCounter > 1 || !this.buttonSpin.isHit) return;
      if (!mouseWasDown) {
        this.spinManager.handleSpin();
      }

      mouseIsDown = false;
      mouseWasDown = false;
      clearTimeout(timeout);
      timeout = null;
      this.buttonSpin.isHit = false;
    });

    this.buttonSpinStop.addListener('touchend', () => {
      if (touchCounter > 1 || !this.buttonSpinStop.isHit) return;
      mouseIsDown = false;
      mouseWasDown = false;
      clearTimeout(timeout);
      timeout = null;

      this.spinManager.handleSpin();
      this.buttonSpinStop.isHit = false;
    });
    this.buttonAutoSpin.addListener('touchend', () => {
      if (touchCounter > 1 || !this.buttonAutoSpin.isHit) return;

      this.spinManager.handleAutoSpin();

      this.buttonAutoSpin.isHit = false;
    });
    this.buttonAutoSpinStop.addListener('touchend', () => {
      if (touchCounter > 1 || !this.buttonAutoSpinStop.isHit) return;
      if (AppStateManager.isFreeSpins && !AppStateManager.freeSpinsStart) {
        this.spinManager.spinsLeft = 0;
        this.spinManager.isUntilFeature = false;
        this.eventManager.emit('autoSpin#end');
      } else {
        this.enableUI();
        this.spinManager.handleAutoSpin();
      }
      this.buttonAutoSpinStop.isHit = false;
    });
    // this.buttonLines.addListener('touchend', () => {
    //   if (touchCounter > 1 || !this.buttonLines.isHit) return;
    //   this.toggleLinesSlider();
    //   this.buttonLines.isHit = false;
    // });
    this.buttonTotalBet.addListener('touchend', () => {
      if (touchCounter > 1 || !this.buttonTotalBet.isHit) return;
      this.toggleTotalBetSlider();
      this.buttonTotalBet.isHit = false;
    });

    this.appStateManager.addListener('data.player.balance', (credit) => {
      this.credit = credit;
    });

    this.eventManager.on(`lines#change`, (lines: number) => {
      const bet = this.settingsStateManager.stakePerLine;

      this.statusBarBetText.text =
        global.currency.beforeAmount === true
          ? `${global.language.bet}\n${global.currency.currencySymbol}${(lines * bet).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : `${global.language.bet}\n${(lines * bet).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${global.currency.currencySymbol}`;

      // const linesIndex = lines - 1;
      // const linesValues = this.settingsStateManager.lines.map((option) => (this.settingsStateManager.lines.indexOf(option) + 1).toString());
      // this.sliderLines.setStepValue(linesIndex, linesValues);

      const betIndex = this.settingsStateManager.stakeList.indexOf(bet);
      const betValues = this.settingsStateManager.stakeList.map((option) =>
        (option * this.settingsStateManager.selectedLines).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      );
      this.sliderTotalBet.setStepValue(betIndex, betValues);

      this.applyTextPositions();
    });

    this.eventManager.on(`bet#change`, (bet: number) => {
      const lines = this.settingsStateManager.selectedLines;

      this.statusBarBetText.text =
        global.currency.beforeAmount === true
          ? `${global.language.bet}\n${global.currency.currencySymbol}${(lines * bet).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : `${global.language.bet}\n${(lines * bet).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${global.currency.currencySymbol}`;

      // const linesIndex = lines - 1;
      // const linesValues = this.settingsStateManager.lines.map((option) => (this.settingsStateManager.lines.indexOf(option) + 1).toString());
      // this.sliderLines.setStepValue(linesIndex, linesValues);

      const betIndex = this.settingsStateManager.stakeList.indexOf(bet);
      const betValues = this.settingsStateManager.stakeList.map((option) =>
        (option * this.settingsStateManager.selectedLines).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      );
      this.sliderTotalBet.setStepValue(betIndex, betValues);

      this.applyTextPositions();
    });

    this.eventManager.on(`credit#change`, (credit) => {
      this.statusBarBalanceText.text =
        global.currency.beforeAmount === true
          ? `${global.language.balance}\n${global.currency.currencySymbol}${credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : `${global.language.balance}\n${credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${global.currency.currencySymbol}`;

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

      this.statusBarWinText.text =
        global.currency.beforeAmount === true
          ? `${global.language.win}\n${global.currency.currencySymbol}0.00`
          : `${global.language.win}\n0.00${global.currency.currencySymbol}`;

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
        this.infoText.text = `${global.language.freeSpins} ${AppStateManager.freeSpinsCountTotal - AppStateManager.freeSpinsCount + 1} ${global.language.of} ${AppStateManager.freeSpinsCount}`;
        this.applyOnlyInfoTextPositions();
      }

      if (this.credit && !AppStateManager.isFreeSpins) {
        const totalBet = this.settingsStateManager.total_stake;
        this.statusBarBalanceText.text =
          global.currency.beforeAmount === true
            ? `${global.language.balance}\n${global.currency.currencySymbol}${(this.credit - totalBet).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : `${global.language.balance}\n${(this.credit - totalBet).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${global.currency.currencySymbol}`;

        this.applyTextPositions();
      }

      this.disableUI();
      this.removeInfoTextEase();
      this.applyTextPositions();
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
        hide(this.buttonSpin, this.autoHoldText);
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
        this.statusBarBalanceText.text =
          global.currency.beforeAmount === true
            ? `${global.language.balance}\n${global.currency.currencySymbol}${this.credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : `${global.language.balance}\n${this.credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${global.currency.currencySymbol}`;

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
        show(this.buttonSpin, this.autoHoldText);
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
        hide(this.buttonSpin, this.autoHoldText, this.buttonAutoSpinStop, this.autoSpinText);
      } else {
        show(this.buttonSpin, this.autoHoldText);
        hide(this.buttonSpinStop, this.buttonAutoSpinStop, this.autoSpinText);
      }
    });

    this.eventManager.on('quickSpin#start', () => {
      show(this.buttonTurboOff);
      hide(this.buttonTurboOn);
    });

    this.eventManager.on('quickSpin#end', () => {
      show(this.buttonTurboOn);
      hide(this.buttonTurboOff);
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
      hide(this.buttonSpin, this.autoHoldText);
    });

    this.eventManager.on('hideAutoSpinButton', () => {
      this.spinManager.spinsLeft = 0;
      this.spinManager.isUntilFeature = false;

      this.autoSpinText.text = '';
      this.applyOnlyAutoSpinText();

      AppStateManager.isFreeSpins ? show(this.buttonSpin) : show(this.buttonSpin, this.autoHoldText);
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

      ease.add(this.infoText, { scale: 1.4 }, { reverse: true, duration: 1000, ease: 'linear' }).on('each', () => {
        this.applyOnlyInfoTextPositions();
      });
    });

    this.eventManager.on('enableUI', this.enableUI);
    this.eventManager.on('showUI', this.showUI);

    this.eventManager.on('totalWin', (totalWin: number) => {
      this.statusBarWinText.text =
        global.currency.beforeAmount === true
          ? `${global.language.win}\n${global.currency.currencySymbol}${totalWin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : `${global.language.win}\n${totalWin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${global.currency.currencySymbol}`;

      this.applyTextPositions();
    });

    this.eventManager.on('closeAllOptions', () => {
      this.linesSliderShowing = false;
      this.totalBetSliderShowing = false;

      hide(/*this.linesContainer, */ this.totalBetContainer);
    });
  };

  // toggleLinesSlider = (): void => {
  //   this.totalBetSliderShowing = false;
  //   hide(this.totalBetContainer);

  //   this.linesSliderShowing = !this.linesSliderShowing;

  //   if (this.linesSliderShowing) {
  //     show(this.linesContainer);
  //   } else {
  //     hide(this.linesContainer);
  //   }
  // };

  toggleTotalBetSlider = (): void => {
    this.linesSliderShowing = false;
    //hide(this.linesContainer);

    this.totalBetSliderShowing = !this.totalBetSliderShowing;

    if (this.totalBetSliderShowing) {
      show(this.totalBetContainer);
    } else {
      hide(this.totalBetContainer);
    }
  };

  disableUI = (): void => {
    this.buttonMenu.setDisabled(true);
    this.buttonTurboOn.setDisabled(true);
    this.buttonTurboOff.setDisabled(true);
    //this.buttonLines.setDisabled(true);
    this.buttonTotalBet.setDisabled(true);
  };

  enableUI = (): void => {
    this.buttonMenu.setDisabled(false);
    this.buttonTurboOn.setDisabled(false);
    this.buttonTurboOff.setDisabled(false);
    //this.buttonLines.setDisabled(false);
    this.buttonTotalBet.setDisabled(false);
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
    this.textStyleButtons.fontSize = this.sliderTotalBetBackground.width * 0.05;

    this.textStyleStatusBar.fontSize = this.statusBar.height * 0.25;

    this.textStyleAutoHold.fontSize = this.buttonSpin.width * 0.12;
    this.textStyleAutoHold.wordWrapWidth = this.buttonSpin.width * 0.9;

    const oneThird = this.statusBar.width / 3;

    this.statusBarBalanceText.position.x =
      this.statusBar.position.x + oneThird / 2 - this.statusBarBalanceText.width / 2;
    this.statusBarBalanceText.position.y =
      this.statusBar.position.y + this.statusBar.height / 2 - this.statusBarBalanceText.height / 2;
    horizontallyCenter(this.statusBarBetText, this.statusBar.width);
    this.statusBarBetText.position.y = this.statusBarBalanceText.position.y;
    this.statusBarWinText.position.x =
      this.statusBar.position.x + this.statusBar.width - oneThird / 2 - this.statusBarWinText.width / 2;
    this.statusBarWinText.position.y = this.statusBarBalanceText.position.y;
    //this.linesText.position.x = this.sliderLinesBackground.position.x + this.sliderLinesBackground.width / 2 - this.linesText.width / 2;
    //this.linesText.position.y = this.sliderLinesBackground.position.y + this.sliderLinesBackground.height * 0.1;
    this.totalBetText.position.x =
      this.sliderTotalBetBackground.position.x + this.sliderTotalBetBackground.width / 2 - this.totalBetText.width / 2;
    this.totalBetText.position.y =
      this.sliderTotalBetBackground.position.y + this.sliderTotalBetBackground.height * 0.1;
    this.autoHoldText.position.x = this.buttonSpin.position.x + this.buttonSpin.width / 2 - this.autoHoldText.width / 2;
    this.autoHoldText.position.y =
      this.buttonSpin.position.y + this.buttonSpin.height / 2 - this.autoHoldText.height / 2;
    this.autoSpinText.position.x =
      this.buttonAutoSpin.position.x + this.buttonAutoSpin.width / 2 - this.autoSpinText.width / 2;
    this.autoSpinText.position.y =
      this.buttonAutoSpin.position.y + this.buttonAutoSpin.height / 2 - this.autoSpinText.height / 2;
  }

  applyOnlyAutoSpinText(): void {
    if (this.spinManager.isUntilFeature) {
      this.textStyleAutoSpin.fontSize = this.buttonSpin.width * 0.5;
    } else {
      this.textStyleAutoSpin.fontSize = this.buttonSpin.width * 0.175;
    }

    this.autoSpinText.position.x =
      this.buttonAutoSpin.position.x + this.buttonAutoSpin.width / 2 - this.autoSpinText.width / 2;
    this.autoSpinText.position.y =
      this.buttonAutoSpin.position.y + this.buttonAutoSpin.height / 2 - this.autoSpinText.height / 2;
  }

  applyOnlyInfoTextPositions(): void {
    this.textStyleInfo.fontSize = isMobileVertical() ? vw(4) : vw(2);

    if (isMobileVertical()) {
      // const startV = this.buttonSpin.position.y + this.buttonSpin.height;
      // const endV = this.buttonHome.position.y;
      // horizontallyCenter(this.infoText);
      // this.infoText.position.y = startV + ((endV - startV) / 2) - (this.infoText.height / 2);
      horizontallyCenter(this.infoText);
      this.infoText.position.y = 0;
    } else {
      horizontallyCenter(this.infoText);
      this.infoText.position.y = this.statusBar.position.y - this.infoText.height;
    }
  }

  calculateSizes(): void {
    this.pixiObject.position.y = isMobileVertical() ? vw(105) : 0;

    this.buttonSpin.width =
      this.buttonSpinStop.width =
      this.buttonAutoSpin.width =
      this.buttonAutoSpinStop.width =
        isMobileVertical() ? pxVwM(300) : isHeightBased() ? vh(24.5) : pxVw(250);
    this.buttonSpin.height =
      this.buttonSpinStop.height =
      this.buttonAutoSpin.height =
      this.buttonAutoSpinStop.height =
        isMobileVertical() ? pxVwM(300) : isHeightBased() ? vh(24.5) : pxVw(250);

    if (isMobileVertical()) {
      horizontallyCenter(this.buttonSpin);
      horizontallyCenter(this.buttonSpinStop);
      horizontallyCenter(this.buttonAutoSpin);
      horizontallyCenter(this.buttonAutoSpinStop);
    } else {
      this.buttonSpin.position.x =
        this.buttonSpinStop.position.x =
        this.buttonAutoSpin.position.x =
        this.buttonAutoSpinStop.position.x =
          vw(100) - this.buttonSpin.width - pxVw(50);
    }

    this.buttonSpin.position.y =
      this.buttonSpinStop.position.y =
      this.buttonAutoSpin.position.y =
      this.buttonAutoSpinStop.position.y =
        isMobileVertical() ? pxVwM(100) : vh(50) - this.buttonSpin.height / 2;

    this.buttonTurboOn.width = this.buttonTurboOff.width = isMobileVertical()
      ? pxVwM(130)
      : isHeightBased()
        ? vh(10.8)
        : pxVw(110);
    this.buttonTurboOn.height = this.buttonTurboOff.height = isMobileVertical()
      ? pxVwM(130)
      : isHeightBased()
        ? vh(10.8)
        : pxVw(110);
    this.buttonTurboOn.position.x = this.buttonTurboOff.position.x = isMobileVertical()
      ? pxVwM(175)
      : vw(100) - this.buttonTurboOn.width - pxVw(50);
    this.buttonTurboOn.position.y = this.buttonTurboOff.position.y = isMobileVertical()
      ? pxVwM(175)
      : this.buttonSpin.position.y - this.buttonTurboOn.height;

    this.buttonMenu.width = this.buttonTurboOn.width;
    this.buttonMenu.height = this.buttonTurboOn.height;
    this.buttonMenu.position.x = isMobileVertical() ? pxVwM(25) : this.buttonTurboOn.position.x;
    this.buttonMenu.position.y = isMobileVertical()
      ? this.buttonTurboOn.position.y
      : this.buttonTurboOn.position.y - this.buttonMenu.height - pxVw(10);

    // this.buttonLines.width = this.buttonTurboOn.width;
    // this.buttonLines.height = this.buttonTurboOn.height;
    // this.buttonLines.position.x = isMobileVertical() ? pxVwM(775) : this.buttonTurboOn.position.x;
    // this.buttonLines.position.y = isMobileVertical() ? this.buttonTurboOn.position.y : this.buttonSpin.position.y + this.buttonSpin.height;

    this.buttonTotalBet.width = this.buttonTurboOn.width;
    this.buttonTotalBet.height = this.buttonTurboOn.height;
    this.buttonTotalBet.position.x = isMobileVertical()
      ? vw(100) - this.buttonTotalBet.width - pxVwM(25)
      : this.buttonTurboOn.position.x;
    this.buttonTotalBet.position.y = isMobileVertical()
      ? this.buttonTurboOn.position.y
      : this.buttonSpin.position.y + pxVw(250);

    this.sliderTotalBetBackground.width = isMobileVertical() ? pxVwM(1000) : isHeightBased() ? vh(100) : pxVw(1000);
    this.sliderTotalBetBackground.height = isMobileVertical() ? pxVwM(300) : isHeightBased() ? vh(30) : pxVw(300);
    horizontallyCenter(this.sliderTotalBetBackground);
    this.sliderTotalBetBackground.position.y = isMobileVertical()
      ? this.buttonSpin.position.y - this.sliderTotalBetBackground.height - pxVwM(125)
      : vh(50) - this.sliderTotalBetBackground.height / 2;

    // this.sliderLines.calculateSizes(this.sliderLinesBackground.width);
    // horizontallyCenter(this.sliderLines);
    // this.sliderLines.position.y = this.sliderLinesBackground.position.y + this.sliderLinesBackground.height * 0.5;

    this.sliderTotalBet.calculateSizes(this.sliderTotalBetBackground.width);
    horizontallyCenter(this.sliderTotalBet);
    this.sliderTotalBet.position.y =
      this.sliderTotalBetBackground.position.y + this.sliderTotalBetBackground.height * 0.5;

    this.statusBar.width = vw(100);
    this.statusBar.height = isMobileVertical() ? pxVwM(130) : pxVw(130);
    this.statusBar.position.x = 0;
    this.statusBar.position.y = vh(100) - this.pixiObject.position.y - this.statusBar.height - vh(2);

    this.burger.calculateSizes();
    this.burger.position.x = 0;
    this.burger.position.y = isMobileVertical() ? -this.pixiObject.position.y : 0;

    this.applyTextPositions();
    this.applyOnlyAutoSpinText();
    this.applyOnlyInfoTextPositions();
  }
}

export default BottomMobile;
