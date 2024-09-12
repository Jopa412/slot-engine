import * as PIXI from 'pixi.js';
import Options from '../Options';
import RenderObject from '../../RenderObject';
import SpinManager from '../../../managers/SpinManager';
import EventManager from '../../../managers/EventManager';
import StorageManager from '../../../managers/StorageManager';
import { vw } from '../../../utils/size';
import { hide, isMobile, isMobileVertical } from '../../../utils/helpers';
import Checkbox from '../Checkbox';
import BottomDesktop from './BottomDesktop';
import AnimationEntry from '../../AnimationEntry';

class SettingsDesktop implements RenderObject {
  spinManager: SpinManager;
  eventManager: EventManager;
  storageManager: StorageManager;

  pixiObject!: PIXI.Container;
  wrapper: Options;

  spaceBarToSpinText: PIXI.Text;
  introScreen: PIXI.Text;

  textStyle: PIXI.TextStyle;

  public static spaceBarToSpinCheckbox: Checkbox;
  public static introScreenCheckbox: Checkbox;

  spaceBarToSpinEnabled = true;
  introScreenEnabled = true;

  constructor(container: PIXI.Container) {
    this.spinManager = SpinManager.getInstance();
    this.eventManager = EventManager.getInstance();
    this.storageManager = StorageManager.getInstance();

    this.spaceBarToSpinEnabled = this.storageManager.get('spaceBarToSpin', true);
    this.introScreenEnabled = this.storageManager.get('introScreen', true);

    if (!this.spaceBarToSpinEnabled) {
      BottomDesktop.spaceBarToSpin = false;
    }

    if (!this.introScreenEnabled) {
      AnimationEntry.introEnabled = false;
    }

    this.wrapper = new Options('settingsOptions', global.language.settingsTitle);

    this.textStyle = new PIXI.TextStyle({
      fill: '#ffffff',
      fontSize: vw(isMobileVertical() ? 4 : 2),
      fontWeight: 'bold',
    });

    this.spaceBarToSpinText = new PIXI.Text(global.language.settingsOption1, this.textStyle);
    this.introScreen = new PIXI.Text(global.language.settingsOption3, this.textStyle);

    SettingsDesktop.spaceBarToSpinCheckbox = new Checkbox((value) => {
      BottomDesktop.spaceBarToSpin = value;
      this.storageManager.set('spaceBarToSpin', value);
    }, this.spaceBarToSpinEnabled);
    SettingsDesktop.introScreenCheckbox = new Checkbox((value) => {
      AnimationEntry.introEnabled = value;
      this.storageManager.set('introScreen', value);
    }, this.introScreenEnabled);

    this.wrapper.addChild(
      this.spaceBarToSpinText,
      this.introScreen,
      SettingsDesktop.spaceBarToSpinCheckbox,
      SettingsDesktop.introScreenCheckbox,
    );

    container.addChild(this.wrapper.pixiObject);
  }

  calculateSizes(): void {
    this.wrapper.calculateSizes();

    this.textStyle.fontSize = vw(isMobileVertical() ? 4 : 2);

    this.spaceBarToSpinText.position.x = this.wrapper.pxBg(450);
    this.spaceBarToSpinText.position.y = this.wrapper.pxBg(400);

    this.introScreen.position.x = this.wrapper.pxBg(450);
    this.introScreen.position.y = this.wrapper.pxBg(500);

    const checkboxWidth = this.wrapper.pxBg(100);
    const checkboxHeight = this.wrapper.pxBg(50);

    SettingsDesktop.spaceBarToSpinCheckbox.position.x = this.wrapper.pxBg(1100);
    SettingsDesktop.spaceBarToSpinCheckbox.position.y = this.spaceBarToSpinText.position.y;
    SettingsDesktop.spaceBarToSpinCheckbox.calculateSizes(checkboxWidth, checkboxHeight);

    SettingsDesktop.introScreenCheckbox.position.x = this.wrapper.pxBg(1100);
    SettingsDesktop.introScreenCheckbox.position.y = this.introScreen.position.y;
    SettingsDesktop.introScreenCheckbox.calculateSizes(checkboxWidth, checkboxHeight);

    this.wrapper.recenter();
  }
}

export default SettingsDesktop;
