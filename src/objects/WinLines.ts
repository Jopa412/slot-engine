import * as PIXI from 'pixi.js';
import { applyMainContainerSizing, centerOnWindow } from '../utils/size';
import RenderObject from './RenderObject';
import { isMobileVertical } from '../utils/helpers';
import AppStateManager from '../managers/AppStateManager';
import EventManager from '../managers/EventManager';
import SoundManager from '../managers/SoundManager';
import { SYMBOL_WILD } from '../constants/constants';
import ReelColumn from './ReelColumn';

export type Reward = {
  symbolID: string;
  winnings: number;
  count: number;
  offsets: string;
  offsetsList: number[][];
  winLine: number;
};

class WinLines implements RenderObject {
  appStateManager: AppStateManager;
  eventManager: EventManager;
  soundManager: SoundManager;

  readonly pixiObject: PIXI.Container;

  columns: ReelColumn[] = [];
  background!: PIXI.Sprite;
  lastRewards: Reward[] = [];
  currentTimeout1: any;
  cancelCurrentAnimation1: any;
  cancelAnimations1 = false;
  currentTimeout2: any;
  cancelCurrentAnimation2: any;
  cancelAnimations2 = false;
  totalWin = 0;
  animateIterations = 0;
  animationsStopped: boolean = true;

  constructor(container: PIXI.Container) {
    this.appStateManager = AppStateManager.getInstance();
    this.eventManager = EventManager.getInstance();
    this.soundManager = SoundManager.getInstance();

    this.pixiObject = new PIXI.Container();
    this.pixiObject.name = 'WinLines';

    this.background = PIXI.Sprite.from(PIXI.Texture.WHITE);
    this.background.alpha = 0;
    this.pixiObject.addChild(this.background);

    container.addChild(this.pixiObject);

    this.appStateManager.addListener('data.engine.slot.slotGameData.wins', this.rewardsChanged);
    this.eventManager.on('startAnimations', this.startAnimations);
    this.eventManager.on('stopAnimations', this.stopAnimations);
    this.eventManager.on('lines#change', this.stopAnimations);
  }

  rewardsChanged = (rewards: Reward[]): void => {
    if (rewards) {
      this.lastRewards = rewards;
    }
  };

  startAnimations = async (totalWin: number): Promise<any> => {
    this.animationsStopped = false;

    if (AppStateManager.isFreeSpins && (AppStateManager.freeSpinsStart || AppStateManager.freeSpinsAdded)) {
      this.eventManager.emit('freeSpins#start');
      await this.animateWildWin();
    }

    if (AppStateManager.freeSpinsEnd) {
      this.eventManager.emit('freeSpins#end');
    }

    if (this.lastRewards.length) {
      this.eventManager.emit('totalWin', totalWin);

      for (let i = 0; i < this.lastRewards.length; i++) {
        const reward = this.lastRewards[i];

        await this.animateWin(reward.symbolID, reward.winnings, reward.offsetsList, totalWin);

        if (this.cancelAnimations1) {
          this.cancelAnimations1 = false;
          break;
        }

        if (i === this.lastRewards.length - 1) {
          if (!AppStateManager.isFreeSpins && !AppStateManager.freeSpinsEnd) {
            i = -1;
          }
        }
      }
    }

    if (AppStateManager.isFreeSpins && AppStateManager.freeSpinsCountTotal - AppStateManager.freeSpinsCount >= 1) {
      this.eventManager.emit('freeSpinEasings');
    }
  };

  stopAnimations = (): void => {
    this.animationsStopped = true;

    this.totalWin = 0;
    this.animateIterations = 0;

    if (this.currentTimeout1) {
      clearTimeout(this.currentTimeout1);
      this.cancelAnimations1 = true;
      this.cancelCurrentAnimation1();
    }

    if (this.currentTimeout2) {
      clearTimeout(this.currentTimeout2);
      this.cancelAnimations2 = true;
      this.cancelCurrentAnimation2();
    }

    this.lastRewards = [];
  };

  animateWin = (symbolID: string, winnings: number, offsetList: number[][], totalWin: number): Promise<void> => {
    return new Promise((resolve) => {
      //===SOUND===
      if (this.animateIterations < this.lastRewards.length) {
        switch (parseInt(symbolID)) {
          case SYMBOL_WILD:
            this.soundManager.play('soundNormalWin');
            break;
          default:
            this.soundManager.play('soundNormalWin');
        }

        this.totalWin += winnings;
      }

      //===WIN===
      this.eventManager.emit('animateWin', isMobileVertical() ? winnings : totalWin);

      this.eventManager.emit('darkSymbols');

      offsetList.forEach((element) => {
        this.eventManager.emit(`animateSymbol`, {
          columnId: element[1],
          rowId: element[0] + 3,
          symbolId: parseInt(symbolID),
        });
      });

      this.cancelCurrentAnimation1 = () => {
        this.soundManager.stop('soundNormalWin');
        this.eventManager.emit(`animateSymbol#stop`);
        this.currentTimeout1 = null;
        this.cancelCurrentAnimation1 = null;
        resolve();
      };

      this.currentTimeout1 = setTimeout(this.cancelCurrentAnimation1, 3000);

      this.animateIterations++;
    });
  };

  animateWildWin = (): Promise<void> => {
    return new Promise((resolve) => {
      //===SOUND===
      this.soundManager.play('soundNormalWin');

      this.eventManager.emit('darkSymbols');

      this.cancelCurrentAnimation2 = () => {
        this.soundManager.stop('soundNormalWin');
        this.eventManager.emit(`animateSymbol#stop`);
        this.currentTimeout2 = null;
        this.cancelCurrentAnimation2 = null;
        resolve();
      };

      this.currentTimeout2 = setTimeout(this.cancelCurrentAnimation2, 3000);
    });
  };

  calculateSizes(): void {
    applyMainContainerSizing(this.background);

    centerOnWindow(this.pixiObject);
  }
}

export default WinLines;
