import StateManager from './StateManager';
import EventManager from './EventManager';
import { getCurrency, getProp } from '../utils/helpers';
import Response from '../models/Response';

class AppStateManager extends StateManager<Response> {
  static instance: AppStateManager;
  eventManager: EventManager;

  public static isFreeSpins: boolean;
  public static freeSpinsStart: boolean;
  public static freeSpinsAdded: boolean;
  public static freeSpinsEnd: boolean;
  public static freeSpinsCount: number;
  public static freeSpinsCountTotal: number;
  public static freeSpinsWin: number;
  public static preventSpin: string[] = [];

  constructor() {
    super();
    this.eventManager = EventManager.getInstance();

    this.attachListeners();
  }

  static getInstance = (): AppStateManager => {
    if (!AppStateManager.instance) {
      AppStateManager.instance = new AppStateManager();
    }

    return AppStateManager.instance;
  };

  private attachListeners = (): void => {
    this.addListener('data.player.currency', async (currency) => {
      if (currency) {
        await getCurrency().then((response) => {
          if (response) {
            global.currency = response[currency];
          } else {
            global.currency = { currencySymbol: currency, beforeAmount: true };
          }
        });
      }
    });

    this.eventManager.once('credit#load', () => {
      this.eventManager.emit('credit#change', getProp(this.state, 'data.player.balance'));
    });
  };

  updateFreeSpinsState = (): void => {
    AppStateManager.isFreeSpins =
      (this.state.data.engine.game.nextAction === 'freespin' && this.state.data.engine.slot.freeSpinData) ||
      this.state.data.fsb.offer ||
      this.state.data.fsb.active
        ? true
        : false;
    AppStateManager.isFreeSpins ? AppStateManager.preventSpin.push('isFreeSpins') : AppStateManager.preventSpin.pop();
    AppStateManager.freeSpinsStart = !this.state.data.fsb.active && this.state.data.fsb.offer ? true : false;
    AppStateManager.freeSpinsAdded = this.state.data.fsb.offer ? true : false;
    // AppStateManager.freeSpinsEnd = !this.state.data.fsb.active ? true : false;
    AppStateManager.freeSpinsCount = AppStateManager.isFreeSpins
      ? this.state.data.engine.slot.freeSpinData?.spinsRemaining
        ? this.state.data.engine.slot.freeSpinData?.spinsRemaining
        : this.state.data.fsb.active?.remaining_spins
          ? this.state.data.fsb.active?.remaining_spins
          : 0
      : 0;
    AppStateManager.freeSpinsCountTotal = AppStateManager.isFreeSpins
      ? this.state.data.engine.slot.freeSpinData?.spinsAwarded
        ? this.state.data.engine.slot.freeSpinData?.spinsAwarded
        : this.state.data.fsb.active?.spin_number
          ? this.state.data.fsb.active?.spin_number
          : 0
      : 0;
    AppStateManager.freeSpinsWin = AppStateManager.isFreeSpins
      ? (this.state.data.engine.slot.freeSpinData?.totalFreeSpinWin as number)
      : 0;
  };
}

export default AppStateManager;
