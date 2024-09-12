import * as PIXI from 'pixi.js';
import { sound } from '@pixi/sound';
import StorageManager from './StorageManager';
import { isMobile } from '../utils/helpers';

type ChangeListener = (isSoundEnabled: boolean) => void;

class SoundManager {
  static instance: SoundManager;
  storageManager: StorageManager;
  listeners: ChangeListener[];

  soundEnabled = true;

  hidden!: keyof Document;
  visibilityChange!: string;

  constructor() {
    this.listeners = [];
    this.storageManager = StorageManager.getInstance();
    this.soundEnabled = this.storageManager.get('soundEnabled', true);

    if (isMobile()) {
      if (this.soundEnabled) {
        sound.unmuteAll();
      } else {
        sound.muteAll();
      }
    } else {
      sound.volumeAll = this.storageManager.get('soundVolume', 1);
    }

    this.visibilityListener();
    document.addEventListener(this.visibilityChange, this.handleVisibilityChange, false);
  }

  static getInstance = (): SoundManager => {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }

    return SoundManager.instance;
  };

  toggleSound = (): boolean => {
    this.soundEnabled = !this.soundEnabled;

    if (this.soundEnabled) {
      sound.unmuteAll();
    } else {
      sound.muteAll();
    }

    this.storageManager.set('soundEnabled', this.soundEnabled);

    this.listeners.forEach((listener) => listener(this.soundEnabled));

    return this.soundEnabled;
  };

  setVolume = (volume: number): void => {
    sound.volumeAll = volume;

    this.storageManager.set('soundVolume', volume);
  };

  play = async (file: string, loop = false, volume = 1): Promise<void> => {
    const sound = PIXI.Assets.get(file);

    if (sound?.isPlaying) return;

    sound?.play({
      loop,
      volume,
    });
  };

  stop = (file: string): void => {
    PIXI.Assets.get(file)?.stop();
  };

  onChange = (callback: ChangeListener): void => {
    this.listeners.push(callback);
  };

  visibilityListener = (): void => {
    const document: Document = window.document;

    this.hidden = null!;
    this.visibilityChange = '';

    if (typeof document.hidden !== 'undefined') {
      this.hidden = 'hidden';
      this.visibilityChange = 'visibilitychange';
    }
  };

  handleVisibilityChange = (): void => {
    if (document[this.hidden]) {
      sound.pauseAll();
    } else {
      sound.resumeAll();
    }
  };
}

export default SoundManager;
