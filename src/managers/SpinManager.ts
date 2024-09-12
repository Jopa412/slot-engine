import SettingsStateManager, { SpinData } from './SettingsStateManager';
import Api from '../utils/Api';
import AppStateManager from './AppStateManager';
import EventManager from './EventManager';
import Response from '../models/Response';

class SpinManager {
  static instance: SpinManager;
  settingsStateManager: SettingsStateManager;
  appStateManager: AppStateManager;
  eventManager: EventManager;

  currentState!: Response;

  preventSpin = false;
  isSpinning = false;
  isAutoSpinning = false;
  isQuickSpinning = false;
  currentTimeout: any;

  spinsLeft = 0;
  isUntilFeature = false;
  ofAnyWin = false;
  ifSingleWinExceeds = false;
  ifCashIncreasesBy = false;
  ifCashDecreasesBy = false;
  ifSingleWinExceedsInput = '';
  ifCashIncreasesByInput = '';
  ifCashDecreasesByInput = '';
  savedCash = 0;

  constructor() {
    this.settingsStateManager = SettingsStateManager.getInstance();
    this.appStateManager = AppStateManager.getInstance();
    this.eventManager = EventManager.getInstance();

    this.eventManager.on('spin#end', this.onSpinEnd);

    this.eventManager.on('autoSpinTrigger', (rewardsCount: number) => {
      if (this.isAutoSpinning) {
        this.currentTimeout = setTimeout(
          () => {
            this.handleSpin();
          },
          3000 * rewardsCount + (AppStateManager.isFreeSpins ? 1500 : 0),
        );
      }
    });

    this.eventManager.on('autoSpinTrigger#end', () => {
      if (this.isAutoSpinning) {
        this.handleAutoSpin();
      }
    });
  }

  static getInstance(): SpinManager {
    if (!SpinManager.instance) {
      SpinManager.instance = new SpinManager();
    }

    return SpinManager.instance;
  }

  updateState = (state: Response): void => {
    this.currentState = state;
  };

  isEnoughMoney = (): boolean => {
    const spinData: SpinData = this.settingsStateManager.spinData;
    return spinData.total_stake <= this.currentState.data.player.balance || AppStateManager.isFreeSpins;
  };

  spin = (): void => {
    this.onSpinStart();

    if (AppStateManager.isFreeSpins) {
      Api.feature()
        .then((res: Response) => {
          this.onResponseReceived(res);
        })
        .catch(() => (this.preventSpin = false));
    } else {
      const spinData: SpinData = this.settingsStateManager.spinData;
      const game_mode = AppStateManager.isFreeSpins ? 2 : 0;

      Api.gameStart(spinData.selectedLines, spinData.stakePerLine, spinData.total_stake, game_mode)
        .then((res: Response) => {
          this.onResponseReceived(res);
        })
        .catch(() => (this.preventSpin = false));
    }
  };

  // 0 - COLLECT, 1 - RED, 2 - BLACK
  gamble = (pickIndex: number): void => {
    Api.gamble(pickIndex)
      .then((res: Response) => {
        this.onResponseReceived(res);
      })
      .catch(() => (this.preventSpin = false));
  };

  fsbStart = (): void => {
    Api.fsbStart(this.currentState.data.fsb.offer?.[0].bonus_id as number)
      .then((res: Response) => {
        this.onResponseReceived(res);
      })
      .catch(() => (this.preventSpin = false));
  };

  fsbEnd = (): void => {
    Api.fsbEnd()
      .then((res: Response) => {
        this.onResponseReceived(res);
      })
      .catch(() => (this.preventSpin = false));
  };

  handleSpin = (): void => {
    if (this.preventSpin || AppStateManager.preventSpin.length > 0) {
      return;
    }

    if (this.isSpinning) {
      this.eventManager.emit('spin#end');
      this.eventManager.emit('spin#endForce');
      return;
    }

    if (this.isEnoughMoney()) {
      this.spin();
    } else {
      Api.balance();
    }
  };

  handleAutoSpin = (): void => {
    if (this.isAutoSpinning) {
      if (this.currentTimeout) {
        clearTimeout(this.currentTimeout);
      }

      this.isAutoSpinning = false;
      this.spinsLeft = 0;
      this.isUntilFeature = false;

      this.eventManager.emit('autoSpin#end');
      return;
    }

    if (!this.isEnoughMoney()) {
      Api.balance();
      return;
    }

    this.isAutoSpinning = true;

    this.eventManager.emit('autoSpin#start');

    if (!this.isSpinning) {
      this.handleSpin();
    }
  };

  handleQuickSpin = (): void => {
    if (this.isQuickSpinning) {
      this.isQuickSpinning = false;
      this.eventManager.emit('quickSpin#end');
      return;
    }

    this.isQuickSpinning = true;

    this.eventManager.emit('quickSpin#start');
  };

  onSpinStart = (): void => {
    this.preventSpin = true;
    this.isSpinning = true;

    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
    }

    this.eventManager.emit('stopAnimations');
    this.eventManager.emit('spin#start');
    this.eventManager.emit('reel#start');
  };

  onResponseReceived = (res: Response): void => {
    this.preventSpin = false;

    this.appStateManager.updateState(res);
    this.updateState(res);

    this.eventManager.emit('responseReceived', res);
  };

  onSpinEnd = (): void => {
    if (!AppStateManager.isFreeSpins) {
      Api.gameEnd(this.currentState.data.engine.game.game_id)
        .then((res: Response) => {
          // this.onResponseReceived(res);
        })
        .catch(() => (this.preventSpin = false));
    }

    this.preventSpin = false;
    this.isSpinning = false;

    const balance = this.currentState.data.player.balance;
    const rewards = this.currentState.data.engine.slot.slotGameData.wins;
    const payout = this.currentState.data.engine.game.total_win;

    if (this.isAutoSpinning) {
      if (this.isUntilFeature && AppStateManager.freeSpinsStart) {
        this.handleAutoSpin();
      } else if (this.spinsLeft === 0 && !AppStateManager.isFreeSpins) {
        this.handleAutoSpin();
      }

      if (this.ofAnyWin && rewards.length) {
        this.handleAutoSpin();
      }

      if (this.ifSingleWinExceeds && payout > parseFloat(this.ifSingleWinExceedsInput)) {
        this.handleAutoSpin();
      }

      if (this.ifCashIncreasesBy && balance >= this.savedCash + parseFloat(this.ifCashIncreasesByInput)) {
        this.savedCash = balance;
        this.handleAutoSpin();
      }

      if (this.ifCashDecreasesBy && balance + parseFloat(this.ifCashDecreasesByInput) <= this.savedCash) {
        this.savedCash = balance;
        this.handleAutoSpin();
      }
    }
  };
}

export default SpinManager;
