import * as PIXI from 'pixi.js';

import assetsJson from '../data/assets';
import uiDesktopAssetsJson from '../data/UIDesktopAssets';
import uiMobileAssetsJson from '../data/UIMobileAssets';
import loadingScreenAssetsJson from '../data/loadingScreenAssets';

import Response from '../models/Response';

import EventManager from '../managers/EventManager';
import RenderObject from '../objects/RenderObject';
import { vh, vw } from './size';
import { getSymbolIndex, inIframe, isMobile, isIos } from './helpers';

import AnimationEntry from '../objects/AnimationEntry';
import AnimationBigWin from '../objects/AnimationBigWin';
import Autoplay from '../objects/UI/Autoplay';
import Background from '../objects/Background';
import BottomDesktop from '../objects/UI/Desktop/BottomDesktop';
import BottomMobile from '../objects/UI/Mobile/BottomMobile';
import FreeSpin from '../objects/FreeSpin';
import FullScreen from '../objects/FullScreen';
import Header from '../objects/Header';
import InfoScreenDesktop from '../objects/UI/Desktop/InfoScreenDesktop';
import InfoScreenMobile from '../objects/UI/Mobile/InfoScreenMobile';
import LoadingScreen from '../objects/LoadingScreen';
import ReelContainer from '../objects/ReelContainer';
import ReelColumn from '../objects/ReelColumn';
import ReelSymbol from '../objects/ReelSymbol';
import SettingsDesktop from '../objects/UI/Desktop/SettingsDesktop';
import SettingsMobile from '../objects/UI/Mobile/SettingsMobile';
import { COLUMNS, ROWS } from '../constants/constants';

class Renderer {
  static instance: Renderer;
  renderObjects: RenderObject[];
  eventManager: EventManager;

  app!: PIXI.Application<HTMLCanvasElement>;
  initialData!: Response;

  loadingScreen!: LoadingScreen;

  constructor() {
    this.eventManager = EventManager.getInstance();
    this.renderObjects = [];
  }

  static getInstance = (): Renderer => {
    if (!Renderer.instance) {
      Renderer.instance = new Renderer();
    }

    return Renderer.instance;
  };

  init = (initialData: Response): void => {
    this.initialData = initialData;

    this.app = new PIXI.Application<HTMLCanvasElement>({
      resolution: devicePixelRatio,
      backgroundColor: 0x000000,
    });

    // For Pixi.js dev tools
    (globalThis as any).__PIXI_APP__ = this.app;

    if (isMobile() && !isIos() && !inIframe()) this.renderObjects.push(new FullScreen(this.app.stage));

    const loadingScreenAssets = Object.entries(loadingScreenAssetsJson);
    loadingScreenAssets.forEach(([alias, src]) => {
      PIXI.Assets.add({ alias, src });
    });
    PIXI.Assets.load(loadingScreenAssets.map(([alias, src]) => alias)).then((resources) => {
      this.loadingScreen = new LoadingScreen(this.loadAssets);
      this.renderObjects.push(this.loadingScreen);

      this.app.stage.sortableChildren = true;
      this.app.stage.addChild(this.loadingScreen.pixiObject);
      document.getElementById('brim-main')!.appendChild(this.app.view);

      window.addEventListener('resize', this.calculateSizes);
      window.addEventListener('orientationchange', this.calculateSizes);

      this.calculateSizes();
    });

    window.addEventListener('online', () => {
      const errorbar = document.getElementById('errorbar')!;
      errorbar.className = errorbar.className.replace('show', '');
      document.removeEventListener('click', this.handler, true);
      document.removeEventListener('pointerdown', this.handler, true);
      document.removeEventListener('touchstart', this.handler, true);
      document.removeEventListener('touchend', this.handler, true);
    });

    window.addEventListener('offline', () => {
      const errorbar = document.getElementById('errorbar')!;
      errorbar.innerText = 'No internet connection! This message will disappear once internet connection is back!';
      errorbar.className = 'show';
      document.addEventListener('click', this.handler, true);
      document.addEventListener('pointerdown', this.handler, true);
      document.addEventListener('touchstart', this.handler, true);
      document.addEventListener('touchend', this.handler, true);
    });
  };

  handler = (e: any): void => {
    e.stopPropagation();
    e.preventDefault();
  };

  calculateSizes = (): void => {
    this.app.renderer.resize(vw(100), vh(100));
    this.renderObjects.forEach((renderObject) => renderObject.calculateSizes());
  };

  loadAssets = (): void => {
    const defaultAssets = Object.entries(assetsJson);
    const uiAssets = isMobile() ? Object.entries(uiMobileAssetsJson) : Object.entries(uiDesktopAssetsJson);
    const allAssets = [...defaultAssets, ...uiAssets];

    allAssets.forEach(([alias, src]) => {
      PIXI.Assets.add({ alias, src });
    });
    PIXI.Assets.load(
      allAssets.map(([alias, src]) => alias),
      (progress) => {
        this.loadingScreen.percent = progress;
        this.loadingScreen.calculateSizes();
      },
    ).then((resources) => {
      this.initializeObjects();
      this.calculateSizes();
      this.eventManager.emit('assetsLoaded');
    });
  };

  initializeObjects = (): void => {
    this.renderObjects.push(new Background(this.app.stage));

    const reelContainer = new ReelContainer(this.app.stage, this.app.ticker);
    this.renderObjects.push(reelContainer);

    for (let columnIndex = 0; columnIndex < COLUMNS; columnIndex++) {
      const reelColumn = new ReelColumn(reelContainer.reelOnly, columnIndex);
      reelContainer.addReelColumn(reelColumn);
      this.renderObjects.push(reelColumn);

      for (let rowIndex = 0; rowIndex < ROWS * 3; rowIndex++) {
        const reelSymbol = new ReelSymbol(
          reelColumn.pixiObject,
          getSymbolIndex(this.initialData.data.engine.slot.slotGameData.view, rowIndex, columnIndex),
          columnIndex,
          rowIndex,
        );
        reelColumn.addReelSymbol(reelSymbol);
        this.renderObjects.push(reelSymbol);
      }
    }

    this.renderObjects.push(new Header(this.app.stage));

    if (isMobile()) {
      this.renderObjects.push(new BottomMobile(this.app.stage));
      this.renderObjects.push(new InfoScreenMobile(this.app.stage, this.app.renderer.events));
      this.renderObjects.push(new SettingsMobile(this.app.stage));
    } else {
      this.renderObjects.push(new InfoScreenDesktop(this.app.stage, this.app.renderer.events));
      this.renderObjects.push(new SettingsDesktop(this.app.stage));
      this.renderObjects.push(new BottomDesktop(this.app.stage));
    }

    this.renderObjects.push(new Autoplay(this.app.stage));

    this.renderObjects.push(new FreeSpin(this.app.stage));

    this.renderObjects.push(new AnimationBigWin(this.app.stage));

    this.renderObjects.push(new AnimationEntry(this.app.stage));
  };
}

export default Renderer;
