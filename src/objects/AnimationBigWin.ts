import * as PIXI from 'pixi.js';
import RenderObject from './RenderObject';
import EventManager from '../managers/EventManager';
import SoundManager from '../managers/SoundManager';
import { horizontallyCenter, vh, vw } from '../utils/size';
import { ease } from 'pixi-ease';
import { hide, isMobileVertical, show } from '../utils/helpers';
import { Spine } from 'pixi-spine';
import AppStateManager from '../managers/AppStateManager';

class AnimationBigWin implements RenderObject {
  eventManager: EventManager;
  soundManager: SoundManager;

  readonly pixiObject: PIXI.Container;
  bigWins: Spine;
  bigWinNames: string[];
  coins: PIXI.AnimatedSprite;

  constructor(container: PIXI.Container) {
    this.eventManager = EventManager.getInstance();
    this.soundManager = SoundManager.getInstance();

    this.pixiObject = new PIXI.Container();
    this.pixiObject.name = 'AnimationBigWin';

    this.bigWinNames = ['SuperWin_Idle', 'BigWin_Idle', 'EpicWin_Idle'];

    this.bigWins = new Spine(PIXI.Assets.get('bigWins')?.spineData);
    this.bigWins.name = 'AnimationBigWin.bigWins';
    this.bigWins.state.timeScale = 1;
    hide(this.bigWins);

    this.coins = new PIXI.AnimatedSprite(PIXI.Assets.get('bigWinCoins')?.animations['coins']);
    this.coins.name = 'AnimationBigWin.coins';
    this.coins.animationSpeed = 0.5;

    this.pixiObject.addChild(this.bigWins, this.coins);

    hide(this.pixiObject);

    container.addChild(this.pixiObject);

    this.eventManager.on(`animateBigWin`, this.animate);
  }

  animate = (textType: number): void => {
    AppStateManager.preventSpin.push('AnimationBigWin');

    ease.add(this.pixiObject, { alpha: 1, visible: 1 }, { duration: 300, ease: 'easeInExpo' }).on('complete', () => {
      this.soundManager.play('soundBigWin');

      this.bigWins.state.setAnimation(0, this.bigWinNames[textType], false);
      show(this.bigWins);
      this.coins.play();
      this.calculateSizes();

      let animationIterator = 0;

      this.coins.onLoop = () => {
        if (animationIterator < 4) {
          animationIterator++;
        } else {
          this.soundManager.stop('soundBigWin');
          hide(this.bigWins);
          this.bigWins.state.clearTracks();
          this.bigWins.skeleton.setToSetupPose();
          this.coins.stop();
          ease.add(this.pixiObject, { alpha: 0, visible: 0 }, { duration: 300 });

          this.eventManager.emit(`animateBigWin#end`);
          AppStateManager.preventSpin.pop();
        }
      };
    });
  };

  calculateSizes(): void {
    if (isMobileVertical()) {
      this.bigWins.width = vw(100);
      this.bigWins.height = this.bigWins.width * 0.75;
      this.bigWins.position.x = vw(50);
      this.bigWins.position.y = vh(30);

      this.coins.width = vw(100);
      this.coins.height = this.coins.width * 0.5;
      horizontallyCenter(this.coins);
      this.coins.position.y = vh(30);
    } else {
      this.bigWins.width = vw(100);
      this.bigWins.height = this.bigWins.width * 0.75;
      this.bigWins.position.x = vw(50);
      this.bigWins.position.y = vh(50);

      this.coins.width = vw(100);
      this.coins.height = this.coins.width * 0.5;
      horizontallyCenter(this.coins);
      this.coins.position.y = vh(0);
    }
  }
}

export default AnimationBigWin;
