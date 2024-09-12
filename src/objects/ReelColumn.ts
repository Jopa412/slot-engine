import * as PIXI from 'pixi.js';
import RenderObject from './RenderObject';
import EventManager from '../managers/EventManager';
import SettingsStateManager from '../managers/SettingsStateManager';
import ReelSymbol from './ReelSymbol';
import { reelColumnWidth, reelSeparatorWidth } from '../utils/size';

class ReelColumn implements RenderObject {
  eventManager: EventManager;
  settingsStateManager: SettingsStateManager;

  readonly pixiObject: PIXI.Container;

  symbols: ReelSymbol[] = [];
  position = 0;
  previousPosition = 0;
  index = 0;

  constructor(container: PIXI.Container, index: number) {
    this.eventManager = EventManager.getInstance();
    this.settingsStateManager = SettingsStateManager.getInstance();

    this.index = index;

    this.pixiObject = new PIXI.Container();
    this.pixiObject.name = 'ReelColumn';
    this.pixiObject.sortableChildren = true;

    container.addChild(this.pixiObject);

    this.eventManager.on('spin#endForce', this.onSpinEndForce);
  }

  onSpinEndForce = (): void => {
    this.position = 0;
  };

  addReelSymbol(symbol: ReelSymbol): void {
    this.symbols = [...this.symbols, symbol];
  }

  calculateSizes(): void {
    this.pixiObject.position.x = (reelColumnWidth() + reelSeparatorWidth()) * this.index;

    this.symbols.forEach((reelSymbol) => reelSymbol.calculateSizes());
  }
}

export default ReelColumn;
