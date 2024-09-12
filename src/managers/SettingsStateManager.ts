import StateManager from './StateManager';
import SettingsState from '../models/SettingsState';
import EventManager from './EventManager';
import { getProp } from '../utils/helpers';
import { LINES } from '../constants/constants';

export interface SpinData {
  stakePerLine: number;
  selectedLines: number;
  total_stake: number;
}

class SettingsStateManager extends StateManager<SettingsState> {
  static instance: SettingsStateManager;
  eventManager: EventManager;

  constructor() {
    super();
    this.eventManager = EventManager.getInstance();

    this.attachListeners();
  }

  attachListeners = (): void => {
    this.eventManager.on(`lines#decrement`, this.decreaseLines);
    this.eventManager.on(`lines#increment`, this.increaseLines);
    this.eventManager.on(`lines#toggle`, this.toggleLines);
    this.eventManager.on(`lines#set`, this.setLines);
    this.eventManager.on(`bet#decrement`, this.decreaseBet);
    this.eventManager.on(`bet#increment`, this.increaseBet);
    this.eventManager.on(`bet#toggle`, this.toggleBet);
    this.eventManager.on(`bet#set`, this.setBet);
    this.eventManager.on(`maxBet`, this.maxBet);
    this.addListener('total_stake', (value) => this.eventManager.emit('bet#change', value));
    this.addListener('selectedLines', (value) => this.eventManager.emit('lines#change', value));

    this.eventManager.once('bet#load', () => {
      this.eventManager.emit('bet#change', getProp(this.state, 'total_stake'));
    });

    this.eventManager.once('lines#load', () => {
      this.eventManager.emit('lines#change', getProp(this.state, 'selectedLines'));
    });
  };

  static getInstance = (): SettingsStateManager => {
    if (!SettingsStateManager.instance) {
      SettingsStateManager.instance = new SettingsStateManager();
    }

    return SettingsStateManager.instance;
  };

  get currentBetIndex(): number {
    return this.state.stakeList.indexOf(this.state.stakePerLine);
  }

  decreaseLines = (): void => {
    if (this.state.selectedLines > 1) {
      const selectedLines = this.state.selectedLines - 1;

      this.updateState({
        ...this.state,
        selectedLines: selectedLines,
        total_stake: this.state.stakePerLine * selectedLines,
      });
    } else {
      this.eventManager.emit('lines#changeForce', this.state.selectedLines);
    }
  };

  increaseLines = (): void => {
    if (this.state.selectedLines < LINES.length - 1) {
      const selectedLines = this.state.selectedLines + 1;

      this.updateState({
        ...this.state,
        selectedLines: selectedLines,
        total_stake: this.state.stakePerLine * selectedLines,
      });
    } else {
      this.eventManager.emit('lines#changeForce', this.state.selectedLines);
    }
  };

  toggleLines = (): void => {
    if (this.state.selectedLines === LINES.length - 1) {
      const selectedLines = 1;

      this.updateState({
        ...this.state,
        selectedLines: selectedLines,
        total_stake: this.state.stakePerLine * selectedLines,
      });
    } else {
      const selectedLines = this.state.selectedLines + 1;

      this.updateState({
        ...this.state,
        selectedLines: selectedLines,
        total_stake: this.state.stakePerLine * selectedLines,
      });
    }
  };

  setLines = (lines: number): void => {
    const selectedLines = lines;

    this.updateState({
      ...this.state,
      selectedLines: selectedLines,
      total_stake: this.state.stakePerLine * selectedLines,
    });
  };

  decreaseBet = (): void => {
    if (this.currentBetIndex > 0) {
      const stakePerLine = this.state.stakeList[this.currentBetIndex - 1];

      this.updateState({
        ...this.state,
        stakePerLine: stakePerLine,
        total_stake: stakePerLine * this.state.selectedLines,
      });
    }
  };

  increaseBet = (): void => {
    if (this.currentBetIndex < this.state.stakeList.length - 1) {
      const stakePerLine = this.state.stakeList[this.currentBetIndex + 1];

      this.updateState({
        ...this.state,
        stakePerLine: stakePerLine,
        total_stake: stakePerLine * this.state.selectedLines,
      });
    }
  };

  toggleBet = (): void => {
    if (this.currentBetIndex < this.state.stakeList.length - 1) {
      const stakePerLine = this.state.stakeList[this.currentBetIndex + 1];

      this.updateState({
        ...this.state,
        stakePerLine: stakePerLine,
        total_stake: stakePerLine * this.state.selectedLines,
      });
    } else {
      const stakePerLine = this.state.stakeList[0];

      this.updateState({
        ...this.state,
        stakePerLine: stakePerLine,
        total_stake: stakePerLine * this.state.selectedLines,
      });
    }
  };

  setBet = (index: number): void => {
    const stakePerLine = this.state.stakeList[index];

    this.updateState({
      ...this.state,
      stakePerLine: stakePerLine,
      total_stake: stakePerLine * this.state.selectedLines,
    });
  };

  maxBet = (): void => {
    const stakePerLine = this.state.stakeList[this.state.stakeList.length - 1];
    const selectedLines = LINES.length - 1;

    this.updateState({
      ...this.state,
      stakePerLine: stakePerLine,
      selectedLines: selectedLines,
      total_stake: stakePerLine * selectedLines,
    });

    this.eventManager.emit('lines#changeForce', selectedLines);
  };

  get spinData(): SpinData {
    return {
      stakePerLine: this.state.stakePerLine,
      selectedLines: this.state.selectedLines,
      total_stake: this.state.total_stake,
    };
  }

  get selectedLines(): number {
    return this.state.selectedLines;
  }

  get stakePerLine(): number {
    return this.state.stakePerLine;
  }

  get total_stake(): number {
    return this.state.total_stake;
  }

  get stakeList(): number[] {
    return this.state.stakeList;
  }
}

export default SettingsStateManager;
