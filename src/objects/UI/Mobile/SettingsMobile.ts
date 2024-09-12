import * as PIXI from 'pixi.js';
import RenderObject from '../../RenderObject';
import { horizontallyCenter, pxVw, pxVwM, vh, vw } from '../../../utils/size';
import EventManager from '../../../managers/EventManager';
import StorageManager from '../../../managers/StorageManager';
import SoundManager from '../../../managers/SoundManager';
import { hide, isMobileVertical, show } from '../../../utils/helpers';
import Checkbox from '../Checkbox';
import AnimationEntry from '../../../objects/AnimationEntry';

class SettingsMobile implements RenderObject {
  eventManager: EventManager;
  storageManager: StorageManager;
  soundManager: SoundManager;

  pixiObject: PIXI.Container;

  background: PIXI.Sprite;
  heading: PIXI.Text;

  textStyleHeading: PIXI.TextStyle;
  textStyle: PIXI.TextStyle;

  public static soundCheckbox: Checkbox;
  public static introScreenCheckbox: Checkbox;
  sound: PIXI.Text;
  introScreen: PIXI.Text;

  soundEnabled = false;
  introScreenEnabled = true;

  constructor(container: PIXI.Container) {
    this.eventManager = EventManager.getInstance();
    this.storageManager = StorageManager.getInstance();
    this.soundManager = SoundManager.getInstance();

    this.soundEnabled = this.storageManager.get('soundEnabled', true);
    this.introScreenEnabled = this.storageManager.get('introScreen', true);

    if (!this.introScreenEnabled) {
      AnimationEntry.introEnabled = false;
    }

    this.pixiObject = new PIXI.Container();
    this.pixiObject.eventMode = 'static';
    hide(this.pixiObject);

    this.textStyleHeading = new PIXI.TextStyle({
      fill: '#ffffff',
      fontSize: vw(isMobileVertical() ? 6 : 3),
      fontFamily: 'oswaldregular',
      fontWeight: 'bold',
      align: 'center',
    });
    this.textStyle = new PIXI.TextStyle({
      fill: '#ffffff',
      fontSize: vw(isMobileVertical() ? 5 : 2.5),
      fontFamily: 'oswaldregular',
      fontWeight: 'bold',
      align: 'center',
    });

    this.background = PIXI.Sprite.from('burgerOptionsBg');

    this.heading = new PIXI.Text(global.language.settingsTitle, this.textStyleHeading);

    SettingsMobile.soundCheckbox = new Checkbox((value) => {
      this.soundManager.toggleSound();
    }, this.soundEnabled);
    SettingsMobile.introScreenCheckbox = new Checkbox((value) => {
      AnimationEntry.introEnabled = value;
      this.storageManager.set('introScreen', value);
    }, this.introScreenEnabled);

    this.sound = new PIXI.Text(global.language.settingsOption2, this.textStyle);
    this.introScreen = new PIXI.Text(global.language.settingsOption3, this.textStyle);

    this.pixiObject.addChild(
      this.background,
      this.heading,
      SettingsMobile.soundCheckbox,
      SettingsMobile.introScreenCheckbox,
      this.sound,
      this.introScreen,
    );

    container.addChild(this.pixiObject);

    this.eventManager.on('options#hide', () => {
      hide(this.pixiObject);
    });

    this.eventManager.on('options#settings', () => {
      show(this.pixiObject);
    });
  }

  calculateSizes(): void {
    const mobileVertical = isMobileVertical();

    this.textStyleHeading.fontSize = vw(isMobileVertical() ? 6 : 3);
    this.textStyle.fontSize = vw(isMobileVertical() ? 5 : 2.5);

    this.background.width = mobileVertical ? vw(100) : vw(90);
    this.background.height = mobileVertical ? vh(90) : vh(100);
    this.background.position.x = mobileVertical ? 0 : vw(10);
    this.background.position.y = mobileVertical ? vh(10) : 0;

    horizontallyCenter(this.heading);
    this.heading.position.y = mobileVertical ? pxVwM(245) : pxVw(80);

    const checkboxWidth = mobileVertical ? pxVwM(175) : pxVw(175);
    const checkboxHeight = mobileVertical ? pxVwM(75) : pxVw(75);

    SettingsMobile.soundCheckbox.position.x = this.background.position.x + (mobileVertical ? pxVwM(25) : pxVw(25));
    SettingsMobile.soundCheckbox.position.y = this.heading.position.y + (mobileVertical ? pxVwM(200) : pxVw(200));
    SettingsMobile.soundCheckbox.calculateSizes(checkboxWidth, checkboxHeight);

    SettingsMobile.introScreenCheckbox.position.x =
      this.background.position.x + (mobileVertical ? pxVwM(25) : pxVw(25));
    SettingsMobile.introScreenCheckbox.position.y = this.heading.position.y + (mobileVertical ? pxVwM(300) : pxVw(300));
    SettingsMobile.introScreenCheckbox.calculateSizes(checkboxWidth, checkboxHeight);

    this.sound.position.x = SettingsMobile.soundCheckbox.position.x + SettingsMobile.soundCheckbox.width + 10;
    this.sound.position.y = SettingsMobile.soundCheckbox.position.y;

    this.introScreen.position.x =
      SettingsMobile.introScreenCheckbox.position.x + SettingsMobile.introScreenCheckbox.width + 10;
    this.introScreen.position.y = SettingsMobile.introScreenCheckbox.position.y;
  }
}

export default SettingsMobile;
