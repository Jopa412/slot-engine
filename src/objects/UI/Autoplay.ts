import * as PIXI from 'pixi.js';
import Options from './Options';
import RenderObject from '../RenderObject';
import { horizontallyCenter, vw } from '../../utils/size';
import Button from './Button';
import { hide, isMobileVertical, positionFields, show } from '../../utils/helpers';
import Checkbox from './Checkbox';
import Field from './Field';
import Input from './Input';
import SpinManager from '../../managers/SpinManager';
import EventManager from '../../managers/EventManager';
import AppStateManager from '../../managers/AppStateManager';

class Autoplay implements RenderObject {
  spinManager: SpinManager;
  eventManager: EventManager;
  appStateManager: AppStateManager;

  pixiObject!: PIXI.Container;
  wrapper: Options;

  subtitle: PIXI.Text;
  advancedTitle: PIXI.Text;
  advancedSubtitle: PIXI.Text;

  textStyleSubtitle: PIXI.TextStyle;
  textStyleAdvancedTitle: PIXI.TextStyle;
  textStyleAdvancedSubtitle: PIXI.TextStyle;
  textStyleLabel: PIXI.TextStyle;

  ofAnyWinLabel: PIXI.Text;
  ifSingleWinExceedsLabel: PIXI.Text;
  ifCashIncreasesByLabel: PIXI.Text;
  ifCashDecreasesByLabel: PIXI.Text;

  ofAnyWinCheckbox: Checkbox;
  ifSingleWinExceedsCheckbox: Checkbox;
  ifCashIncreasesByCheckbox: Checkbox;
  ifCashDecreasesByCheckbox: Checkbox;

  ifSingleWinExceedsInput: Input;
  ifCashIncreasesByInput: Input;
  ifCashDecreasesByInput: Input;

  buttonReset: Button;
  buttonResetText: PIXI.Text;

  buttons: Field[];

  balance = 0;

  constructor(container: PIXI.Container) {
    this.spinManager = SpinManager.getInstance();
    this.eventManager = EventManager.getInstance();
    this.appStateManager = AppStateManager.getInstance();

    this.wrapper = new Options('autoplayOptions', global.language.autoplayTitle);

    this.textStyleSubtitle = new PIXI.TextStyle({
      fill: '#ffffff',
      fontSize: vw(isMobileVertical() ? 3.5 : 1.7),
    });
    this.textStyleAdvancedTitle = new PIXI.TextStyle({
      fill: '#ffffff',
      fontSize: vw(isMobileVertical() ? 3.5 : 1.7),
    });
    this.textStyleAdvancedSubtitle = new PIXI.TextStyle({
      fill: '#ffffff',
      fontSize: vw(isMobileVertical() ? 3.5 : 1.7),
    });
    this.textStyleLabel = new PIXI.TextStyle({
      fill: '#ffffff',
      fontSize: vw(isMobileVertical() ? 3 : 1.7),
      fontWeight: 'bold',
    });

    this.subtitle = new PIXI.Text(global.language.autoplaySection1Title, this.textStyleSubtitle);
    this.advancedTitle = new PIXI.Text(global.language.autoplaySection2Title, this.textStyleAdvancedTitle);
    this.advancedSubtitle = new PIXI.Text(global.language.autoplaySection2Subtitle, this.textStyleAdvancedSubtitle);

    this.ofAnyWinLabel = new PIXI.Text(global.language.autoplaySection2Option1, this.textStyleLabel);
    this.ifSingleWinExceedsLabel = new PIXI.Text(global.language.autoplaySection2Option2, this.textStyleLabel);
    this.ifCashIncreasesByLabel = new PIXI.Text(global.language.autoplaySection2Option3, this.textStyleLabel);
    this.ifCashDecreasesByLabel = new PIXI.Text(global.language.autoplaySection2Option4, this.textStyleLabel);

    this.ofAnyWinCheckbox = new Checkbox((value) => {
      if (value) {
        this.spinManager.ofAnyWin = true;
      } else {
        this.spinManager.ofAnyWin = false;
      }
    });
    this.ifSingleWinExceedsCheckbox = new Checkbox((value) => {
      if (value) {
        this.spinManager.ifSingleWinExceeds = true;
        show(this.ifSingleWinExceedsInput);
      } else {
        this.spinManager.ifSingleWinExceeds = false;
        hide(this.ifSingleWinExceedsInput);
      }
    });
    this.ifCashIncreasesByCheckbox = new Checkbox((value) => {
      if (value) {
        this.spinManager.ifCashIncreasesBy = true;
        this.spinManager.savedCash = this.balance;
        show(this.ifCashIncreasesByInput);
      } else {
        this.spinManager.ifCashIncreasesBy = false;
        hide(this.ifCashIncreasesByInput);
      }
    });
    this.ifCashDecreasesByCheckbox = new Checkbox((value) => {
      if (value) {
        this.spinManager.ifCashDecreasesBy = true;
        this.spinManager.savedCash = this.balance;
        show(this.ifCashDecreasesByInput);
      } else {
        this.spinManager.ifCashDecreasesBy = false;
        hide(this.ifCashDecreasesByInput);
      }
    });

    this.ifSingleWinExceedsInput = new Input(this.wrapper.pxBg);
    this.ifCashIncreasesByInput = new Input(this.wrapper.pxBg);
    this.ifCashDecreasesByInput = new Input(this.wrapper.pxBg);

    hide(this.ifSingleWinExceedsInput, this.ifCashIncreasesByInput, this.ifCashDecreasesByInput);

    const buttonDefinitions: string[] = [
      '10',
      '25',
      '50',
      '100',
      '250',
      '500',
      '750',
      '1000',
      global.language.autoplayUntilFeature,
    ];

    this.buttons = buttonDefinitions.map((text, index) => {
      return new Field(text, false, index === buttonDefinitions.length - 1 ? true : false, this.wrapper.pxBg, () => {
        this.enableCheckBox();
        this.buttons.forEach((button) => button.setSelected(false));
        this.buttons[index].setSelected(true);
        this.eventManager.emit(
          'showAutoSpinButton',
          parseInt(text),
          index === buttonDefinitions.length - 1 ? true : false,
        );
        if (index === buttonDefinitions.length - 1) {
          this.resetAdvancedOptions();
          this.disableCheckBox();
        }
      });
    });

    this.buttonReset = new Button(
      PIXI.Texture.from('buttonResetNormal'),
      PIXI.Texture.from('buttonResetDown'),
      PIXI.Texture.from('buttonResetHover'),
      PIXI.Texture.from('buttonResetDisabled'),
    );
    this.buttonResetText = new PIXI.Text(global.language.autoplayReset, this.textStyleLabel);
    this.buttonReset.addListener('pointerup', () => {
      this.resetAdvancedOptions();
      this.enableCheckBox();

      this.buttons.forEach((button) => button.setSelected(false));
      this.eventManager.emit('hideAutoSpinButton');
    });

    this.wrapper.addChild(
      this.subtitle,
      ...this.buttons,
      this.advancedTitle,
      this.advancedSubtitle,
      this.ofAnyWinLabel,
      this.ifSingleWinExceedsLabel,
      this.ifCashIncreasesByLabel,
      this.ifCashDecreasesByLabel,
      this.ofAnyWinCheckbox,
      this.ifSingleWinExceedsCheckbox,
      this.ifCashIncreasesByCheckbox,
      this.ifCashDecreasesByCheckbox,
      this.buttonReset,
      this.buttonResetText,
      this.ifSingleWinExceedsInput,
      this.ifCashIncreasesByInput,
      this.ifCashDecreasesByInput,
    );

    container.addChild(this.wrapper.pixiObject);

    this.eventManager.on('spin#start', () => {
      this.spinManager.ifSingleWinExceedsInput = this.ifSingleWinExceedsInput.text.text;
      this.spinManager.ifCashIncreasesByInput = this.ifCashIncreasesByInput.text.text;
      this.spinManager.ifCashDecreasesByInput = this.ifCashDecreasesByInput.text.text;
    });

    this.eventManager.on('autoSpin#end', () => {
      this.enableCheckBox();
      this.buttons.forEach((button) => button.setSelected(false));
    });

    this.appStateManager.addListener('data.player.balance', (balance) => {
      this.balance = balance;
    });
  }

  resetAdvancedOptions(): void {
    this.ofAnyWinCheckbox.changeValue(false);
    this.ifSingleWinExceedsCheckbox.changeValue(false);
    this.ifCashIncreasesByCheckbox.changeValue(false);
    this.ifCashDecreasesByCheckbox.changeValue(false);

    this.spinManager.ofAnyWin = false;
    this.spinManager.ifSingleWinExceeds = false;
    this.spinManager.ifCashIncreasesBy = false;
    this.spinManager.ifCashDecreasesBy = false;

    hide(this.ifSingleWinExceedsInput, this.ifCashIncreasesByInput, this.ifCashDecreasesByInput);
  }

  enableCheckBox(): void {
    this.ofAnyWinCheckbox.eventMode = 'static';
    this.ifSingleWinExceedsCheckbox.eventMode = 'static';
    this.ifCashIncreasesByCheckbox.eventMode = 'static';
    this.ifCashDecreasesByCheckbox.eventMode = 'static';

    this.ofAnyWinCheckbox.alpha = 1;
    this.ifSingleWinExceedsCheckbox.alpha = 1;
    this.ifCashIncreasesByCheckbox.alpha = 1;
    this.ifCashDecreasesByCheckbox.alpha = 1;
  }

  disableCheckBox(): void {
    this.ofAnyWinCheckbox.eventMode = 'auto';
    this.ifSingleWinExceedsCheckbox.eventMode = 'auto';
    this.ifCashIncreasesByCheckbox.eventMode = 'auto';
    this.ifCashDecreasesByCheckbox.eventMode = 'auto';

    this.ofAnyWinCheckbox.alpha = 0.5;
    this.ifSingleWinExceedsCheckbox.alpha = 0.5;
    this.ifCashIncreasesByCheckbox.alpha = 0.5;
    this.ifCashDecreasesByCheckbox.alpha = 0.5;
  }

  calculateSizes(): void {
    this.wrapper.calculateSizes();

    this.textStyleSubtitle.fontSize = this.wrapper.pxBg(40);
    horizontallyCenter(this.subtitle, this.wrapper.width);
    this.subtitle.position.y = this.wrapper.pxBg(240);

    positionFields(this.buttons, this.wrapper.pxBg(360), this.wrapper.pxBg(300), 5, this.wrapper.pxBg);

    this.textStyleAdvancedTitle.fontSize = this.wrapper.pxBg(40);
    horizontallyCenter(this.advancedTitle, this.wrapper.width);
    this.advancedTitle.position.y = this.wrapper.pxBg(475);

    this.textStyleAdvancedSubtitle.fontSize = this.wrapper.pxBg(40);
    horizontallyCenter(this.advancedSubtitle, this.wrapper.width);
    this.advancedSubtitle.position.y = this.wrapper.pxBg(525);

    this.textStyleLabel.fontSize = this.wrapper.pxBg(40);

    this.ofAnyWinLabel.position.x = this.wrapper.pxBg(375);
    this.ofAnyWinLabel.position.y = this.wrapper.pxBg(575);

    this.ifSingleWinExceedsLabel.position.x = this.wrapper.pxBg(375);
    this.ifSingleWinExceedsLabel.position.y = this.wrapper.pxBg(650);

    this.ifCashIncreasesByLabel.position.x = this.wrapper.pxBg(375);
    this.ifCashIncreasesByLabel.position.y = this.wrapper.pxBg(725);

    this.ifCashDecreasesByLabel.position.x = this.wrapper.pxBg(375);
    this.ifCashDecreasesByLabel.position.y = this.wrapper.pxBg(800);

    const checkboxWidth = isMobileVertical() ? this.wrapper.pxBg(150) : this.wrapper.pxBg(100);
    const checkboxHeight = isMobileVertical() ? this.wrapper.pxBg(75) : this.wrapper.pxBg(50);

    this.ofAnyWinCheckbox.position.x = this.wrapper.pxBg(1175);
    this.ofAnyWinCheckbox.position.y = this.ofAnyWinLabel.position.y;
    this.ofAnyWinCheckbox.calculateSizes(checkboxWidth, checkboxHeight);

    this.ifSingleWinExceedsCheckbox.position.x = this.wrapper.pxBg(1175);
    this.ifSingleWinExceedsCheckbox.position.y = this.ifSingleWinExceedsLabel.position.y;
    this.ifSingleWinExceedsCheckbox.calculateSizes(checkboxWidth, checkboxHeight);

    this.ifCashIncreasesByCheckbox.position.x = this.wrapper.pxBg(1175);
    this.ifCashIncreasesByCheckbox.position.y = this.ifCashIncreasesByLabel.position.y;
    this.ifCashIncreasesByCheckbox.calculateSizes(checkboxWidth, checkboxHeight);

    this.ifCashDecreasesByCheckbox.position.x = this.wrapper.pxBg(1175);
    this.ifCashDecreasesByCheckbox.position.y = this.ifCashDecreasesByLabel.position.y;
    this.ifCashDecreasesByCheckbox.calculateSizes(checkboxWidth, checkboxHeight);

    this.buttonReset.width = this.wrapper.pxBg(300);
    this.buttonReset.height = this.wrapper.pxBg(70);
    horizontallyCenter(this.buttonReset, this.wrapper.width);
    this.buttonReset.position.y = this.wrapper.pxBg(870);

    this.buttonResetText.position.x =
      this.buttonReset.position.x + this.buttonReset.width / 2 - this.buttonResetText.width / 2;
    this.buttonResetText.position.y =
      this.buttonReset.position.y + this.buttonReset.height / 2 - this.buttonResetText.height / 2;

    this.ifSingleWinExceedsInput.calculateSizes();
    this.ifSingleWinExceedsInput.position.x = this.wrapper.pxBg(1350);
    this.ifSingleWinExceedsInput.position.y = this.ifSingleWinExceedsLabel.position.y;

    this.ifCashIncreasesByInput.calculateSizes();
    this.ifCashIncreasesByInput.position.x = this.wrapper.pxBg(1350);
    this.ifCashIncreasesByInput.position.y = this.ifCashIncreasesByLabel.position.y;

    this.ifCashDecreasesByInput.calculateSizes();
    this.ifCashDecreasesByInput.position.x = this.wrapper.pxBg(1350);
    this.ifCashDecreasesByInput.position.y = this.ifCashDecreasesByLabel.position.y;

    this.wrapper.recenter();
  }
}

export default Autoplay;
