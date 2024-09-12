import * as PIXI from 'pixi.js';
import RenderObject from '../../RenderObject';
import { horizontallyCenter, pxVw, pxVwM, vh, vw } from '../../../utils/size';
import EventManager from '../../../managers/EventManager';
import { Scrollbox } from 'pixi-scrollbox';
import { hide, isMobileVertical, show } from '../../../utils/helpers';

class InfoScreenMobile implements RenderObject {
  eventManager: EventManager;

  pixiObject: PIXI.Container;

  background: PIXI.Sprite;
  heading: PIXI.Text;
  scrollbox: Scrollbox;

  textStyleHeading: PIXI.TextStyle;
  textStyleTitle: PIXI.TextStyle;
  textStyleFreeSpin: PIXI.TextStyle;
  textStylePaylines: PIXI.TextStyle;

  // PAYOUTS
  symbolPayoutsTitle: PIXI.Text;
  symbolPayoutsSymbols: PIXI.Sprite;

  // SPECIAL
  specialFreeSpinsTitle: PIXI.Text;
  specialFreeSpinsSymbols: PIXI.Sprite;
  specialFreeSpinsText: PIXI.Text;

  // PAYLINES
  paylinesTitle: PIXI.Text;
  paylinesVisual: PIXI.Sprite;
  paylinesText: PIXI.Text;

  // SECTION LINE
  sectionLine: PIXI.Sprite[];

  constructor(container: PIXI.Container, events: PIXI.EventSystem) {
    this.eventManager = EventManager.getInstance();

    this.pixiObject = new PIXI.Container();
    this.pixiObject.eventMode = 'static';
    hide(this.pixiObject);

    this.textStyleHeading = new PIXI.TextStyle({
      fill: '#ffffff',
      fontSize: vw(isMobileVertical() ? 6 : 3),
      fontFamily: 'oswaldregular',
      fontWeight: 'bold',
      align: 'center',
    });
    this.textStyleTitle = new PIXI.TextStyle({
      fill: '#f9cd00',
      fontSize: vw(isMobileVertical() ? 4 : 2),
      fontFamily: 'oswaldregular',
      fontWeight: 'bold',
      align: 'center',
    });
    this.textStyleFreeSpin = new PIXI.TextStyle({
      fill: '#ffffff',
      fontSize: vw(isMobileVertical() ? 2.5 : 1.5),
      fontFamily: 'oswaldregular',
      fontWeight: 'bold',
      wordWrap: true,
      wordWrapWidth: isMobileVertical() ? pxVwM(900) : pxVw(1000),
      align: 'center',
    });
    this.textStylePaylines = new PIXI.TextStyle({
      fill: '#ffffff',
      fontSize: vw(isMobileVertical() ? 2.5 : 1.5),
      fontFamily: 'oswaldregular',
      fontWeight: 'bold',
      wordWrap: true,
      wordWrapWidth: isMobileVertical() ? pxVwM(900) : pxVw(1000),
      align: 'center',
    });

    this.background = PIXI.Sprite.from('burgerOptionsBg');

    this.heading = new PIXI.Text(global.language.infoscreenTitle, this.textStyleHeading);

    this.scrollbox = new Scrollbox({
      scrollbarBackground: 0x222222,
      scrollbarForeground: 0xf9cd00,
      events: events,
    });

    // PAYOUTS
    this.symbolPayoutsTitle = new PIXI.Text(global.language.infoscreenSection1Title, this.textStyleTitle);
    this.symbolPayoutsSymbols = PIXI.Sprite.from('optionsPaytableSymbols');

    // SPECIAL
    this.specialFreeSpinsTitle = new PIXI.Text(global.language.infoscreenSection2Title, this.textStyleTitle);
    this.specialFreeSpinsSymbols = PIXI.Sprite.from('optionsPaytableWild');
    this.specialFreeSpinsText = new PIXI.Text(global.language.infoscreenSection2Text, this.textStyleFreeSpin);

    // PAYLINES
    this.paylinesTitle = new PIXI.Text(global.language.infoscreenSection3Title, this.textStyleTitle);
    this.paylinesVisual = PIXI.Sprite.from('optionsPaytableLines');
    this.paylinesText = new PIXI.Text(global.language.infoscreenSection3Text, this.textStylePaylines);

    // SECTION LINES
    this.sectionLine = [PIXI.Sprite.from('burgerSectionLine'), PIXI.Sprite.from('burgerSectionLine')];

    this.scrollbox.content.addChild(
      this.symbolPayoutsTitle,
      this.symbolPayoutsSymbols,
      this.specialFreeSpinsTitle,
      this.specialFreeSpinsSymbols,
      this.specialFreeSpinsText,
      this.paylinesTitle,
      this.paylinesVisual,
      this.paylinesText,
      ...this.sectionLine,
    );

    this.scrollbox.update();

    this.pixiObject.addChild(this.background, this.heading, this.scrollbox);

    container.addChild(this.pixiObject);

    this.eventManager.on('options#hide', () => {
      hide(this.pixiObject);
    });

    this.eventManager.on('options#infoscreen', () => {
      show(this.pixiObject);
    });
  }

  scrollBoxWidth = (): number => (isMobileVertical() ? vw(100) : vw(90));

  calculateSizes(): void {
    const mobileVertical = isMobileVertical();

    this.textStyleHeading.fontSize = vw(isMobileVertical() ? 6 : 3);
    this.textStyleTitle.fontSize = isMobileVertical() ? vw(4) : vw(2);
    this.textStyleFreeSpin.fontSize = vw(isMobileVertical() ? 2.5 : 1.5);
    this.textStyleFreeSpin.wordWrapWidth = isMobileVertical() ? pxVwM(900) : pxVw(1000);
    this.textStylePaylines.fontSize = vw(isMobileVertical() ? 2.5 : 1.5);
    this.textStylePaylines.wordWrapWidth = isMobileVertical() ? pxVwM(900) : pxVw(1000);

    this.background.width = mobileVertical ? vw(100) : vw(90);
    this.background.height = mobileVertical ? vh(90) : vh(100);
    this.background.position.x = mobileVertical ? 0 : vw(10);
    this.background.position.y = mobileVertical ? vh(10) : 0;

    if (isMobileVertical()) {
      horizontallyCenter(this.heading);
    } else {
      horizontallyCenter(this.heading);
      this.heading.position.x += vw(5);
    }
    this.heading.position.y = mobileVertical ? pxVwM(245) : pxVw(80);

    //=============================================================[1]=============================================================
    this.symbolPayoutsTitle.position.y = 0;
    horizontallyCenter(this.symbolPayoutsTitle, this.scrollBoxWidth());

    if (mobileVertical) {
      this.symbolPayoutsSymbols.width = this.scrollBoxWidth() - pxVwM(50);
      this.symbolPayoutsSymbols.height = pxVwM(550);
      this.symbolPayoutsSymbols.position.y = this.symbolPayoutsTitle.position.y + pxVwM(50);
      horizontallyCenter(this.symbolPayoutsSymbols, this.scrollBoxWidth());
    } else {
      this.symbolPayoutsSymbols.width = this.scrollBoxWidth() - pxVw(50);
      this.symbolPayoutsSymbols.height = pxVw(850);
      this.symbolPayoutsSymbols.position.y = this.symbolPayoutsTitle.position.y + pxVw(50);
      horizontallyCenter(this.symbolPayoutsSymbols, this.scrollBoxWidth());
    }

    //=============================================================[2]=============================================================
    if (mobileVertical) {
      this.specialFreeSpinsTitle.position.y =
        this.symbolPayoutsSymbols.position.y + this.symbolPayoutsSymbols.height + pxVwM(100);
      horizontallyCenter(this.specialFreeSpinsTitle, this.scrollBoxWidth());
    } else {
      this.specialFreeSpinsTitle.position.y =
        this.symbolPayoutsSymbols.position.y + this.symbolPayoutsSymbols.height + pxVw(150);
      horizontallyCenter(this.specialFreeSpinsTitle, this.scrollBoxWidth());
    }

    if (mobileVertical) {
      this.specialFreeSpinsSymbols.width = pxVwM(200);
      this.specialFreeSpinsSymbols.height = pxVwM(200);
      this.specialFreeSpinsSymbols.position.y = this.specialFreeSpinsTitle.position.y + pxVwM(50);
      horizontallyCenter(this.specialFreeSpinsSymbols, this.scrollBoxWidth());
    } else {
      this.specialFreeSpinsSymbols.width = pxVw(200);
      this.specialFreeSpinsSymbols.height = pxVw(200);
      this.specialFreeSpinsSymbols.position.y = this.specialFreeSpinsTitle.position.y + pxVw(50);
      horizontallyCenter(this.specialFreeSpinsSymbols, this.scrollBoxWidth());
    }

    if (mobileVertical) {
      this.specialFreeSpinsText.position.y =
        this.specialFreeSpinsSymbols.position.y + this.specialFreeSpinsSymbols.height + pxVwM(30);
      horizontallyCenter(this.specialFreeSpinsText, this.scrollBoxWidth());
    } else {
      this.specialFreeSpinsText.position.y =
        this.specialFreeSpinsSymbols.position.y + this.specialFreeSpinsSymbols.height + pxVw(30);
      horizontallyCenter(this.specialFreeSpinsText, this.scrollBoxWidth());
    }

    //=============================================================[3]=============================================================
    if (mobileVertical) {
      this.paylinesTitle.position.y =
        this.specialFreeSpinsText.position.y + this.specialFreeSpinsText.height + pxVwM(100);
      horizontallyCenter(this.paylinesTitle, this.scrollBoxWidth());
    } else {
      this.paylinesTitle.position.y =
        this.specialFreeSpinsText.position.y + this.specialFreeSpinsText.height + pxVw(100);
      horizontallyCenter(this.paylinesTitle, this.scrollBoxWidth());
    }

    if (mobileVertical) {
      this.paylinesVisual.width = pxVwM(1000);
      this.paylinesVisual.height = pxVwM(700);
      this.paylinesVisual.position.y = this.paylinesTitle.position.y + pxVwM(50);
      horizontallyCenter(this.paylinesVisual, this.scrollBoxWidth());
    } else {
      this.paylinesVisual.width = pxVw(1500);
      this.paylinesVisual.height = pxVw(750);
      this.paylinesVisual.position.y = this.paylinesTitle.position.y + pxVw(50);
      horizontallyCenter(this.paylinesVisual, this.scrollBoxWidth());
    }

    if (mobileVertical) {
      this.paylinesText.position.y = this.paylinesVisual.position.y + this.paylinesVisual.height + pxVwM(10);
      horizontallyCenter(this.paylinesText, this.scrollBoxWidth());
    } else {
      this.paylinesText.position.y = this.paylinesVisual.position.y + this.paylinesVisual.height + pxVw(10);
      horizontallyCenter(this.paylinesText, this.scrollBoxWidth());
    }

    //=============================================================[SECTION LINE]==================================================
    this.sectionLine.forEach((line, index) => {
      line.width = mobileVertical ? pxVwM(900) : pxVw(1400);
      line.height = mobileVertical ? pxVwM(15) : pxVw(15);
      horizontallyCenter(line, this.scrollBoxWidth());

      switch (index) {
        case 0:
          line.position.y = mobileVertical
            ? this.symbolPayoutsSymbols.position.y + this.symbolPayoutsSymbols.height + pxVwM(50)
            : this.symbolPayoutsSymbols.position.y + this.symbolPayoutsSymbols.height + pxVw(50);
          break;
        case 1:
          line.position.y = mobileVertical
            ? this.specialFreeSpinsText.position.y + this.specialFreeSpinsText.height + pxVwM(50)
            : this.specialFreeSpinsText.position.y + this.specialFreeSpinsText.height + pxVw(50);
          break;
        default:
          break;
      }
    });

    //=============================================================================================================================
    this.scrollbox.resize({
      boxWidth: this.scrollBoxWidth(),
      boxHeight: mobileVertical ? vh(85) : vh(80),
    });
    this.scrollbox.position.x = mobileVertical ? 0 : vw(10);
    this.scrollbox.position.y = mobileVertical ? pxVwM(325) : pxVw(175);
  }
}

export default InfoScreenMobile;
