import * as PIXI from 'pixi.js';
import { vw } from '../../utils/size';
import { isMobileVertical } from '../../utils/helpers';

class Slider extends PIXI.Container {
  background: PIXI.Sprite;
  fill: PIXI.Sprite;
  button: PIXI.Sprite;
  valueLabel: PIXI.Text;
  startLabel: PIXI.Text;
  endLabel: PIXI.Text;

  valueTextStyle: PIXI.TextStyle;
  startEndTextStyle: PIXI.TextStyle;

  isMouseDown = false;
  value = 0;
  currentStep = 0;
  steps: string[];
  onChange: (stepIndex: number) => void;

  constructor(steps: string[], onChange: (stepIndex: number) => void) {
    super();

    this.steps = steps;
    this.onChange = onChange;

    this.background = PIXI.Sprite.from(PIXI.Texture.WHITE);
    this.background.tint = 0x909090;

    this.fill = PIXI.Sprite.from(PIXI.Texture.WHITE);
    this.fill.tint = 0xffffff;

    this.valueTextStyle = new PIXI.TextStyle({
      fill: 'white',
      fontSize: vw(isMobileVertical() ? 4 : 2),
      fontWeight: 'bold',
    });
    this.startEndTextStyle = new PIXI.TextStyle({
      fill: 'white',
      fontSize: vw(isMobileVertical() ? 4 : 2),
    });

    this.valueLabel = new PIXI.Text(steps[this.currentStep], this.valueTextStyle);
    this.startLabel = new PIXI.Text(steps[0], this.startEndTextStyle);
    this.endLabel = new PIXI.Text(steps[steps.length - 1], this.startEndTextStyle);

    this.button = PIXI.Sprite.from('sliderButtonV');

    this.addChild(this.background, this.fill, this.button, this.valueLabel, this.startLabel, this.endLabel);

    this.button.eventMode = 'static';
    this.button.cursor = 'pointer';
    this.button.addListener('pointerdown', () => {
      this.isMouseDown = true;
    });

    this.button.addListener('pointerup', this.dragEnd);
    this.button.addListener('pointerupoutside', this.dragEnd);

    this.background.eventMode = 'static';
    this.background.cursor = 'pointer';
    this.background.addListener('pointermove', this.onMove);
  }

  onMove = (event: any) => {
    if (!this.isMouseDown) return;

    const x = event.data.getLocalPosition(this).x - this.background.position.x;
    let value = x / this.background.width;

    if (x < 0) {
      value = 0;
    }

    if (x > this.background.width) {
      value = 1;
    }

    const oneStepValue = 1 / (this.steps.length - 1);
    const currentStep = Math.min(Math.floor(value / oneStepValue), this.steps.length - 1);
    if (currentStep !== this.currentStep) {
      this.setStep(currentStep);
    }

    this.value = value;
    this.calculateMoving();
  };

  dragEnd = () => {
    this.isMouseDown = false;

    this.value = this.currentStep / (this.steps.length - 1);
    this.onChange(this.currentStep);
    this.calculateMoving();
  };

  setStep = (step: number) => {
    this.currentStep = step;
    this.valueLabel.text = this.steps[step];
    this.startLabel.text = this.steps[0];
    this.endLabel.text = this.steps[this.steps.length - 1];
  };

  setStepValue = (step: number, steps: string[]) => {
    this.steps = steps;
    this.setStep(step);
    this.dragEnd();
  };

  calculateMoving() {
    this.fill.width = this.background.width * this.value;
    this.button.position.x = this.background.position.x + this.background.width * this.value - this.button.width / 2;
    this.valueLabel.position.x =
      this.background.position.x + this.background.width * this.value - this.valueLabel.width / 2;
  }

  calculateSizes(containerWidth = vw(100)) {
    this.valueTextStyle.fontSize = containerWidth * 0.05;
    this.startEndTextStyle.fontSize = containerWidth * 0.05;

    this.background.width = containerWidth * 0.4;
    this.background.height = containerWidth * 0.04;
    this.background.position.y = containerWidth * 0.035;
    this.background.position.x = this.startLabel.width + this.background.width * 0.1;

    this.fill.width = this.background.width * this.value;
    this.fill.height = this.background.height;
    this.fill.position.y = this.background.position.y;
    this.fill.position.x = this.background.position.x;

    this.button.width = this.background.width * 0.2;
    this.button.height = this.button.width;
    this.button.position.x = this.background.position.x + this.background.width * this.value - this.button.width / 2;
    this.button.position.y = this.background.position.y + this.background.height / 2 - this.button.height / 2;

    this.valueLabel.position.x =
      this.background.position.x + this.background.width * this.value - this.valueLabel.width / 2;
    this.valueLabel.position.y = this.button.position.y - this.valueLabel.height * 1.1;

    this.startLabel.position.y = this.background.position.y + this.background.height / 2 - this.startLabel.height / 2;

    this.endLabel.position.x = this.background.position.x + this.background.width + this.background.width * 0.1;
    this.endLabel.position.y = this.background.position.y + this.background.height / 2 - this.endLabel.height / 2;
  }
}

export default Slider;
