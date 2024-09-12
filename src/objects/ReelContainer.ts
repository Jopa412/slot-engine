import * as PIXI from 'pixi.js';
import RenderObject from './RenderObject';
import EventManager from '../managers/EventManager';
import SoundManager from '../managers/SoundManager';
import Lines from './Lines';
import WinLines, { Reward } from './WinLines';
import { applyMainContainerSizing, centerOnWindow, reelSymbolHeight, vw } from '../utils/size';
import { ease } from 'pixi-ease';
import { getSymbolIndex, hide, isMobileVertical } from '../utils/helpers';
import Animator, { backout } from '../utils/Animator';
import ReelColumn from './ReelColumn';
import { Spine } from 'pixi-spine';
import Response from '../models/Response';
import { COLUMNS, ROWS } from '../constants/constants';
import AppStateManager from '../managers/AppStateManager';
import SettingsStateManager from '../managers/SettingsStateManager';

class ReelContainer implements RenderObject {
  eventManager: EventManager;
  soundManager: SoundManager;
  appStateManager: AppStateManager;
  settingsStateManager: SettingsStateManager;

  currentState!: Response;

  readonly pixiObject: PIXI.Container;

  winLines!: WinLines;
  lines!: Lines;
  columns: ReelColumn[] = [];
  running = false;
  animator: Animator;
  isQuickSpinning = false;
  columnsComplete = new Array(COLUMNS).fill(false);

  reelContainer: PIXI.Container;
  background: PIXI.Sprite;
  reelOnly: PIXI.Container;
  mask: PIXI.Sprite;
  panda: Spine;

  constructor(container: PIXI.Container, ticker: PIXI.Ticker) {
    this.eventManager = EventManager.getInstance();
    this.soundManager = SoundManager.getInstance();
    this.appStateManager = AppStateManager.getInstance();
    this.settingsStateManager = SettingsStateManager.getInstance();
    this.animator = new Animator(ticker);

    this.pixiObject = new PIXI.Container();
    this.pixiObject.name = 'ReelContainer';
    this.pixiObject.sortableChildren = true;
    hide(this.pixiObject);

    this.reelContainer = new PIXI.Container();

    this.background = PIXI.Sprite.from('reelBackground');
    this.background.name = 'ReelContainer.background';
    this.reelContainer.addChild(this.background);

    this.reelOnly = new PIXI.Container();
    this.reelOnly.name = 'ReelContainer.reelOnly';
    this.reelContainer.addChild(this.reelOnly);

    this.mask = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.mask.name = 'ReelContainer.mask';
    this.reelContainer.addChild(this.mask);

    this.reelOnly.mask = this.mask;

    this.panda = new Spine(PIXI.Assets.get('panda')?.spineData);
    this.panda.state.setAnimation(1, 'animation', true);

    this.pixiObject.addChild(this.reelContainer, this.panda);
    container.addChild(this.pixiObject);

    this.lines = new Lines(container);
    this.winLines = new WinLines(container);
    this.eventManager.on('responseReceived', this.onResponseReceived);
    this.eventManager.on('spin#start', this.spinStart);
    this.eventManager.on('spin#end', this.spinEnd);
    this.eventManager.on('intro#end', this.animate);
    ticker.add(() => this.symbolChanger());

    this.eventManager.on('quickSpin#start', () => {
      this.isQuickSpinning = true;
    });

    this.eventManager.on('quickSpin#end', () => {
      this.isQuickSpinning = false;
    });
  }

  animate = (): void => {
    ease.add(this.pixiObject, { alpha: 1, visible: true }, { duration: 500, ease: 'easeInQuad' });
  };

  onResponseReceived = (newState: Response): void => {
    this.currentState = newState;

    this.columns.forEach((reelColumn, columnIndex) => {
      reelColumn.symbols.forEach((reelSymbol, index) => {
        const reels = this.currentState.data.engine.slot.slotGameData.view;
        const symbolIndex = getSymbolIndex(reels, index, columnIndex);
        reelSymbol.setTexture(symbolIndex);
      });
    });

    this.animator.tweening.forEach((t) => {
      t.start = Date.now();
      t.target /= 5;
      t.time /= 5;
    });
  };

  spinStart = (): void => {
    if (this.running) return;

    this.soundManager.play('soundReelSpin');
    this.running = true;
    this.columnsComplete = new Array(COLUMNS).fill(false);

    this.columns.forEach((reelColumn, index) => {
      reelColumn.position = 0;
      let target = reelColumn.position + 10 + index * 5;
      target = target + ROWS * 3 - (target % (ROWS * 3));
      let time = (this.isQuickSpinning ? 500 : 1000) + index * (this.isQuickSpinning ? 100 : 300);

      this.animator.tweenTo(
        reelColumn,
        'position',
        target * 5,
        time * 5,
        AppStateManager.isFreeSpins ? backout(0) : backout(0.5),
        () => ({}),
        () => {
          reelColumn.symbols.forEach((reelSymbol) => {
            reelSymbol.unblurSymbols();
          });
          this.columnsComplete[index] = true;
          if (index === this.columns.length - 1) {
            this.eventManager.emit('spin#end');
          }
        },
      );
    });
  };

  spinEnd = async (): Promise<void> => {
    this.running = false;
    this.soundManager.stop('soundReelSpin');
    this.animator.tweening = [];
    const rewards = this.currentState.data.engine.slot.slotGameData.wins;
    const totalWin = this.currentState.data.engine.game.total_win;
    let rewardsCount = 0;

    this.columns.forEach((reelColumn, index) => {
      reelColumn.symbols.forEach((reelSymbol) => {
        reelSymbol.unblurSymbols();
      });
    });

    if (!this.currentState.data.fsb.active && this.currentState.data.fsb.offer) {
      AppStateManager.isFreeSpins = true;
      AppStateManager.preventSpin.push('isFreeSpins');
      AppStateManager.freeSpinsStart = true;
    } else {
      AppStateManager.freeSpinsStart = false;
    }

    if (this.currentState.data.fsb.offer) {
      AppStateManager.preventSpin.push('isFreeSpins');
      AppStateManager.freeSpinsAdded = true;
    } else {
      AppStateManager.freeSpinsAdded = false;
    }

    // if (!this.currentState.data.fsb.active) {
    //   AppStateManager.isFreeSpins = false;
    //   AppStateManager.freeSpinsEnd = true;
    //   AppStateManager.freeSpinsCount = 0;
    //   AppStateManager.freeSpinsCountTotal = 0;
    // } else {
    //   AppStateManager.freeSpinsEnd = false;
    // }

    if (AppStateManager.isFreeSpins) {
      AppStateManager.freeSpinsCount = this.currentState.data.engine.slot.freeSpinData?.spinsRemaining
        ? this.currentState.data.engine.slot.freeSpinData?.spinsRemaining
        : this.currentState.data.fsb.active?.remaining_spins
          ? this.currentState.data.fsb.active?.remaining_spins
          : 0;
      AppStateManager.freeSpinsCountTotal = this.currentState.data.engine.slot.freeSpinData?.spinsAwarded
        ? this.currentState.data.engine.slot.freeSpinData?.spinsAwarded
        : this.currentState.data.fsb.active?.spin_number
          ? this.currentState.data.fsb.active?.spin_number
          : 0;
      AppStateManager.freeSpinsWin = this.currentState.data.engine.slot.freeSpinData?.totalFreeSpinWin as number;
    }

    if (rewards) {
      rewardsCount = rewards.length;
      if (AppStateManager.isFreeSpins && (AppStateManager.freeSpinsStart || AppStateManager.freeSpinsAdded)) {
        rewardsCount++;
      }
    }

    if (!this.currentState.data.fsb.active && !this.currentState.data.fsb.offer) {
      this.eventManager.emit('autoSpinTrigger', rewardsCount);
    }
    this.eventManager.emit('reel#end');
    this.eventManager.emit('startAnimations', totalWin);

    if (
      totalWin >= this.settingsStateManager.stakePerLine * this.settingsStateManager.selectedLines * 15 &&
      totalWin < this.settingsStateManager.stakePerLine * this.settingsStateManager.selectedLines * 25
    ) {
      this.eventManager.emit(`animateBigWin`, 0);
    } else if (
      totalWin >= this.settingsStateManager.stakePerLine * this.settingsStateManager.selectedLines * 25 &&
      totalWin < this.settingsStateManager.stakePerLine * this.settingsStateManager.selectedLines * 50
    ) {
      this.eventManager.emit(`animateBigWin`, 1);
    } else if (totalWin >= this.settingsStateManager.stakePerLine * this.settingsStateManager.selectedLines * 50) {
      this.eventManager.emit(`animateBigWin`, 2);
    }
  };

  addReelColumn(column: ReelColumn): void {
    this.columns = [...this.columns, column];
  }

  symbolChanger = (fromCalculateSize = false): void => {
    this.columns.forEach((reelColumn) => {
      if (reelColumn.previousPosition !== reelColumn.position || fromCalculateSize) {
        const positionDifference = reelColumn.position - reelColumn.previousPosition > 0.15;
        reelColumn.previousPosition = reelColumn.position;
        const symbolHeight = reelSymbolHeight();

        reelColumn.symbols.forEach((reelSymbol, index) => {
          const s = reelSymbol.pixiObject;
          s.y = ((reelColumn.position + index) % reelColumn.symbols.length) * symbolHeight - symbolHeight * ROWS;

          if (!reelSymbol.animationStarted) {
            if (positionDifference) {
              reelSymbol.blurSymbols();
            } else {
              reelSymbol.unblurSymbols();
            }
          }
        });
      }
    });
  };

  calculateSizes(): void {
    applyMainContainerSizing(this.background);

    this.reelOnly.y = this.background.width * 0.157407;
    this.reelOnly.x = this.background.width * 0.083333;

    this.mask.width = this.background.width * 0.839814;
    this.mask.height = this.background.width * 0.603703;
    this.mask.position.y = this.background.width * 0.157407;
    this.mask.position.x = this.background.width * 0.083333;

    this.symbolChanger(true);

    this.columns.forEach((reelColumn) => reelColumn.calculateSizes());

    this.lines.calculateSizes();
    this.winLines.calculateSizes();

    centerOnWindow(this.reelContainer);

    if (isMobileVertical()) {
      this.panda.width = this.background.width * 0.2;
      this.panda.height = this.background.width * 0.4;
      this.panda.position.y = this.reelContainer.position.y;
      this.panda.position.x = this.reelContainer.position.x + vw(10);
      this.panda.zIndex = 1;
    } else {
      this.panda.width = this.background.width * 0.2;
      this.panda.height = this.background.width * 0.4;
      this.panda.position.y = this.background.position.y + this.background.height - this.panda.height / 2;
      this.panda.position.x = this.reelContainer.position.x - vw(3);
      this.panda.zIndex = 1;
    }
  }
}

export default ReelContainer;
