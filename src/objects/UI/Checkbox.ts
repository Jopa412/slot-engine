import * as PIXI from 'pixi.js';
import { isMobileVertical } from '../../utils/helpers';
import { pxVw, pxVwM } from '../../utils/size';

class Checkbox extends PIXI.Sprite {
  state: boolean;

  textureOn = PIXI.Texture.from('buttonSwitchOn');
  textureOff = PIXI.Texture.from('buttonSwitchOff');

  constructor(onChange: (value: boolean) => void, state = false) {
    super();

    this.state = state;
    this.eventMode = 'static';
    this.texture = this.state ? this.textureOn : this.textureOff;

    this.addListener('pointerup', () => {
      this.changeValue(!this.state);
      onChange(this.state);
    });
  }

  changeValue = (newValue: boolean): void => {
    this.state = newValue;

    this.texture = this.state ? this.textureOn : this.textureOff;
  };

  calculateSizes(width = 0, height = 0) {
    if (width !== 0 && height !== 0) {
      this.width = width;
      this.height = height;
    } else if (isMobileVertical()) {
      this.width = pxVwM(172);
      this.height = pxVwM(75);
    } else {
      this.width = pxVw(172);
      this.height = pxVw(75);
    }
  }
}

export default Checkbox;
