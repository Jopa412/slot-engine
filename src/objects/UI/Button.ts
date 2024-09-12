import * as PIXI from 'pixi.js';
import SoundManager from '../../managers/SoundManager';

class Button extends PIXI.Sprite {
  private soundManager: SoundManager;

  isDown = false;
  isHover = false;
  isDisabled = false;
  isHit = false;
  defaultTexture: PIXI.Texture;
  downTexture: PIXI.Texture;
  hoverTexture: PIXI.Texture;
  disabledTexture: PIXI.Texture;

  constructor(
    defaultTexture: PIXI.Texture,
    downTexture: PIXI.Texture,
    hoverTexture: PIXI.Texture,
    disabledTexture: PIXI.Texture,
    isDisabled = false,
  ) {
    super();
    this.soundManager = SoundManager.getInstance();

    this.defaultTexture = defaultTexture;
    this.downTexture = downTexture;
    this.hoverTexture = hoverTexture;
    this.disabledTexture = disabledTexture;

    this.setDisabled(isDisabled);

    this.addListener('pointerover', () => {
      this.isHover = true;
      this.buttonAction();
    });

    this.addListener('pointerout', () => {
      this.isHover = false;
      this.buttonAction();
    });

    this.addListener('pointerdown', () => {
      this.soundManager.play('soundButton');
      this.isDown = true;
      this.isHit = true;
      this.buttonAction();
    });

    this.addListener('pointerup', () => {
      this.isDown = false;
      this.isHover = false;
      this.buttonAction();
    });

    this.addListener('pointerupoutside', () => {
      this.isDown = false;
      this.isHover = false;
      this.isHit = false;
      this.buttonAction();
    });
  }

  setDisabled(isDisabled: boolean) {
    this.isDisabled = isDisabled;
    this.eventMode = isDisabled ? 'auto' : 'static';
    this.cursor = isDisabled ? 'auto' : 'pointer';

    this.buttonAction();
  }

  buttonAction() {
    if (this.isDown) {
      this.texture = this.downTexture;
      return;
    }

    if (this.isHover) {
      this.texture = this.hoverTexture;
      return;
    }

    if (this.isDisabled) {
      this.texture = this.disabledTexture;
      return;
    }

    this.texture = this.defaultTexture;
  }
}

export default Button;
