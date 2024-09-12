import * as PIXI from 'pixi.js';
import AppStateManager from '../../../managers/AppStateManager';
import EventManager from '../../../managers/EventManager';
import StorageManager from '../../../managers/StorageManager';
import SoundManager from '../../../managers/SoundManager';
import { hide, isMobileVertical, popupCenter, show } from '../../../utils/helpers';
import { horizontallyCenter, pxVwM, vh, vw } from '../../../utils/size';

class Burger extends PIXI.Container {
  appStateManager: AppStateManager;
  eventManager: EventManager;
  storageManager: StorageManager;
  soundManager: SoundManager;

  background: PIXI.Sprite;
  iconHome: PIXI.Sprite;
  iconHistory: PIXI.Sprite;
  iconInfoScreen: PIXI.Sprite;
  iconSettings: PIXI.Sprite;
  iconBack: PIXI.Sprite;

  iconHomeActiveTexture: PIXI.Texture;
  iconHomeDisabledTexture: PIXI.Texture;
  iconHistoryActiveTexture: PIXI.Texture;
  iconHistoryDisabledTexture: PIXI.Texture;
  iconInfoScreenActiveTexture: PIXI.Texture;
  iconInfoScreenDisabledTexture: PIXI.Texture;
  iconSettingsActiveTexture: PIXI.Texture;
  iconSettingsDisabledTexture: PIXI.Texture;
  iconBackActiveTexture: PIXI.Texture;
  iconBackDisabledTexture: PIXI.Texture;

  currentOptions = '';

  queryString: string;
  urlParams: URLSearchParams;
  lobby: string | null;

  constructor() {
    super();

    this.appStateManager = AppStateManager.getInstance();
    this.eventManager = EventManager.getInstance();
    this.storageManager = StorageManager.getInstance();
    this.soundManager = SoundManager.getInstance();

    this.queryString = window.location.search;
    this.urlParams = new URLSearchParams(this.queryString);
    this.lobby = this.urlParams.get('lobby');

    this.background = PIXI.Sprite.from('burgerBackground');

    this.iconHome = PIXI.Sprite.from('burgerIconHomeDisabled');
    this.iconHome.eventMode = 'static';
    this.iconHome.cursor = 'pointer';
    this.iconHomeActiveTexture = PIXI.Texture.from('burgerIconHomeActive');
    this.iconHomeDisabledTexture = PIXI.Texture.from('burgerIconHomeDisabled');

    this.iconHistory = PIXI.Sprite.from('burgerIconHistoryDisabled');
    this.iconHistory.eventMode = 'static';
    this.iconHistory.cursor = 'pointer';
    this.iconHistoryActiveTexture = PIXI.Texture.from('burgerIconHistoryActive');
    this.iconHistoryDisabledTexture = PIXI.Texture.from('burgerIconHistoryDisabled');

    this.iconInfoScreen = PIXI.Sprite.from('burgerIconInfoScreenDisabled');
    this.iconInfoScreen.eventMode = 'static';
    this.iconInfoScreen.cursor = 'pointer';
    this.iconInfoScreenActiveTexture = PIXI.Texture.from('burgerIconInfoScreenActive');
    this.iconInfoScreenDisabledTexture = PIXI.Texture.from('burgerIconInfoScreenDisabled');

    this.iconSettings = PIXI.Sprite.from('burgerIconSettingsDisabled');
    this.iconSettings.eventMode = 'static';
    this.iconSettings.cursor = 'pointer';
    this.iconSettingsActiveTexture = PIXI.Texture.from('burgerIconSettingsActive');
    this.iconSettingsDisabledTexture = PIXI.Texture.from('burgerIconSettingsDisabled');

    this.iconBack = PIXI.Sprite.from('burgerIconBackDisabled');
    this.iconBack.eventMode = 'static';
    this.iconBack.cursor = 'pointer';
    this.iconBackActiveTexture = PIXI.Texture.from('burgerIconBackActive');
    this.iconBackDisabledTexture = PIXI.Texture.from('burgerIconBackDisabled');

    if (!this.lobby) hide(this.iconHome);

    this.addChild(
      this.background,
      this.iconHome,
      this.iconHistory,
      this.iconInfoScreen,
      this.iconSettings,
      this.iconBack,
    );

    this.attachListeners();

    this.eventManager.on('burger#show', this.showBurger);
  }

  attachListeners(): void {
    this.iconHome.addListener('touchstart', () => (this.iconHome.texture = this.iconHomeActiveTexture));
    this.iconHome.addListener('touchend', () => {
      this.iconHome.texture = this.iconHomeDisabledTexture;

      if (this.lobby) {
        window.location.href = this.lobby;
      }
    });

    this.iconHistory.addListener('touchstart', () => (this.iconHistory.texture = this.iconHistoryActiveTexture));
    this.iconHistory.addListener('touchend', () => {
      this.iconHistory.texture = this.iconHistoryDisabledTexture;

      const token = this.urlParams.get('token');
      const history = this.urlParams.get('history');
      const language = this.urlParams.get('language');

      if (token && history && language) {
        popupCenter(`${history}?language=${language}&session=${token}`, 'History', vw(50), vh(50));
      } else {
        alert('There is no all required params in URL to access to history!');
      }
    });

    this.iconInfoScreen.addListener(
      'touchstart',
      () => (this.iconInfoScreen.texture = this.iconInfoScreenActiveTexture),
    );
    this.iconInfoScreen.addListener('touchend', () => {
      this.iconInfoScreen.texture = this.iconInfoScreenDisabledTexture;

      this.emitOptions('infoscreen')();
    });

    this.iconSettings.addListener('touchstart', () => (this.iconSettings.texture = this.iconSettingsActiveTexture));
    this.iconSettings.addListener('touchend', () => {
      this.iconSettings.texture = this.iconSettingsDisabledTexture;

      this.emitOptions('settings')();
    });

    this.iconBack.addListener('touchstart', () => (this.iconBack.texture = this.iconBackActiveTexture));
    this.iconBack.addListener('touchend', () => {
      this.iconBack.texture = this.iconBackDisabledTexture;

      this.hideBurger();
    });
  }

  emitOptions = (optionName: string) => (): void => {
    this.currentOptions = optionName;
    this.eventManager.emit('options#hide');
    this.eventManager.emit(`options#${optionName}`);
  };

  showBurger = (): void => {
    show(this);
    this.emitOptions('infoscreen')();
  };

  hideBurger = (): void => {
    hide(this);
    this.emitOptions('')();
  };

  verticallyCenter(object: PIXI.Sprite) {
    object.position.y = (this.background.height - object.height) / 2;
  }

  calculateSizes() {
    const mobileVertical = isMobileVertical();

    this.background.width = isMobileVertical() ? vw(100) : vw(10);
    this.background.height = isMobileVertical() ? vh(10) : vh(100);
    this.background.position.x = 0;
    this.background.position.y = 0;

    if (mobileVertical) {
      this.iconHome.width = pxVwM(100);
      this.iconHome.height = pxVwM(100);
      this.iconHome.position.x = pxVwM(50);
      this.verticallyCenter(this.iconHome);
    } else {
      this.iconHome.width = vw(5);
      this.iconHome.height = vw(5);
      horizontallyCenter(this.iconHome, this.background.width);
      this.iconHome.position.y = vh(20) - vw(10);
    }

    if (mobileVertical) {
      this.iconHistory.width = pxVwM(100);
      this.iconHistory.height = pxVwM(100);
      this.iconHistory.position.x = pxVwM(250);
      this.verticallyCenter(this.iconHistory);
    } else {
      this.iconHistory.width = vw(5);
      this.iconHistory.height = vw(5);
      horizontallyCenter(this.iconHistory, this.background.width);
      this.iconHistory.position.y = vh(40) - vw(10);
    }

    if (mobileVertical) {
      this.iconInfoScreen.width = pxVwM(100);
      this.iconInfoScreen.height = pxVwM(100);
      this.iconInfoScreen.position.x = pxVwM(450);
      this.verticallyCenter(this.iconInfoScreen);
    } else {
      this.iconInfoScreen.width = vw(5);
      this.iconInfoScreen.height = vw(5);
      horizontallyCenter(this.iconInfoScreen, this.background.width);
      this.iconInfoScreen.position.y = vh(60) - vw(10);
    }

    if (mobileVertical) {
      this.iconSettings.width = pxVwM(100);
      this.iconSettings.height = pxVwM(100);
      this.iconSettings.position.x = pxVwM(650);
      this.verticallyCenter(this.iconSettings);
    } else {
      this.iconSettings.width = vw(5);
      this.iconSettings.height = vw(5);
      horizontallyCenter(this.iconSettings, this.background.width);
      this.iconSettings.position.y = vh(80) - vw(10);
    }

    if (mobileVertical) {
      this.iconBack.width = pxVwM(100);
      this.iconBack.height = pxVwM(100);
      this.iconBack.position.x = pxVwM(950);
      this.verticallyCenter(this.iconBack);
    } else {
      this.iconBack.width = vw(5);
      this.iconBack.height = vw(5);
      horizontallyCenter(this.iconBack, this.background.width);
      this.iconBack.position.y = vh(100) - vw(10);
    }
  }
}

export default Burger;
