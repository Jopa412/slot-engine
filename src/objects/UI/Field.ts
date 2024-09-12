import * as PIXI from 'pixi.js';
import Button from './Button';
import { horizontallyCenter, vw } from '../../utils/size';
import { hide, isMobileVertical, show } from '../../utils/helpers';

class Field extends PIXI.Container {
  button: Button;
  selected: PIXI.Sprite;
  text: PIXI.Text;

  textStyle: PIXI.TextStyle;

  isSelected: boolean;
  isUntilFeature: boolean;

  pxBg: (pixels: number) => number;

  constructor(
    text: string,
    isSelected = false,
    isUntilFeature = false,
    pxBg: (pixels: number) => number,
    onClick: () => void = () => null,
  ) {
    super();

    this.isSelected = isSelected;
    this.isUntilFeature = isUntilFeature;

    this.pxBg = pxBg;

    this.textStyle = new PIXI.TextStyle({
      fill: '#fff',
      fontSize: isMobileVertical() ? vw(3) : vw(2),
      fontWeight: 'bold',
    });

    this.button = new Button(
      isUntilFeature ? PIXI.Texture.from('buttonFieldBigNormal') : PIXI.Texture.from('buttonFieldNormal'),
      isUntilFeature ? PIXI.Texture.from('buttonFieldBigDown') : PIXI.Texture.from('buttonFieldDown'),
      isUntilFeature ? PIXI.Texture.from('buttonFieldBigHover') : PIXI.Texture.from('buttonFieldHover'),
      isUntilFeature ? PIXI.Texture.from('buttonFieldBigDisabled') : PIXI.Texture.from('buttonFieldDisabled'),
    );

    this.selected = isUntilFeature
      ? PIXI.Sprite.from('buttonFieldBigSelected')
      : PIXI.Sprite.from('buttonFieldSelected');

    this.text = new PIXI.Text(text, this.textStyle);

    this.setSelected(isSelected);

    this.addChild(this.button, this.selected, this.text);

    this.button.addListener('pointerup', onClick);
  }

  setSelected = (isSelected: boolean): void => {
    this.isSelected = isSelected;

    if (this.isSelected) {
      show(this.selected);
      hide(this.button);
    } else {
      hide(this.selected);
      show(this.button);
    }
  };

  calculateSizes(): void {
    if (this.isUntilFeature) {
      this.button.width = this.selected.width = this.pxBg(350);
      this.button.height = this.selected.height = this.pxBg(75);
    } else {
      this.button.width = this.selected.width = this.pxBg(150);
      this.button.height = this.selected.height = this.pxBg(75);
    }

    this.textStyle.fontSize = this.pxBg(40);

    horizontallyCenter(this.text, this.button.width);
    this.text.position.y = this.button.height / 2 - this.text.height / 2;
  }
}

export default Field;
