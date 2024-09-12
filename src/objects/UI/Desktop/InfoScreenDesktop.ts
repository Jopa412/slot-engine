import * as PIXI from 'pixi.js';
import Options from '../Options';
import RenderObject from '../../RenderObject';
import { Scrollbox } from 'pixi-scrollbox';
import { horizontallyCenter, pxVw, pxVwM, vw } from '../../../utils/size';
import { isMobileVertical } from '../../../utils/helpers';

class InfoScreenDesktop implements RenderObject {
  pixiObject!: PIXI.Container;

  wrapper: Options;
  scrollbox: Scrollbox;

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

  constructor(container: PIXI.Container, events: PIXI.EventSystem) {
    this.wrapper = new Options('paytableOptions', global.language.infoscreenTitle);

    this.scrollbox = new Scrollbox({
      scrollbarBackground: 0x222222,
      scrollbarForeground: 0xf9cd00,
      events: events,
    });

    this.textStyleTitle = new PIXI.TextStyle({
      fill: '0xf9cd00',
      fontSize: vw(isMobileVertical() ? 4 : 2),
      fontFamily: 'oswaldregular',
      fontWeight: 'bold',
      align: 'center',
    });
    this.textStyleFreeSpin = new PIXI.TextStyle({
      fill: '#fff',
      fontSize: vw(isMobileVertical() ? 2.5 : 1.5),
      fontFamily: 'oswaldregular',
      fontWeight: 'bold',
      wordWrap: true,
      wordWrapWidth: isMobileVertical() ? pxVwM(900) : pxVw(700),
      align: 'center',
    });
    this.textStylePaylines = new PIXI.TextStyle({
      fill: '#ffffff',
      fontSize: vw(isMobileVertical() ? 2.5 : 1.5),
      fontFamily: 'oswaldregular',
      fontWeight: 'bold',
      wordWrap: true,
      wordWrapWidth: isMobileVertical() ? pxVwM(900) : pxVw(900),
      align: 'center',
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

    this.scrollbox.content.addChild(
      this.symbolPayoutsTitle,
      this.symbolPayoutsSymbols,
      this.specialFreeSpinsTitle,
      this.specialFreeSpinsSymbols,
      this.specialFreeSpinsText,
      this.paylinesTitle,
      this.paylinesVisual,
      this.paylinesText,
    );

    this.scrollbox.update();

    this.wrapper.addChild(this.scrollbox);
    container.addChild(this.wrapper.pixiObject);
  }

  scrollBoxWidth = (): number => this.wrapper.width - this.wrapper.pxBg(180);

  calculateSizes(): void {
    this.wrapper.calculateSizes();

    //===========================================================[FONTS]===========================================================
    this.textStyleTitle.fontSize = isMobileVertical() ? vw(4) : vw(2);
    this.textStyleFreeSpin.fontSize = vw(isMobileVertical() ? 2.5 : 1.5);
    this.textStyleFreeSpin.wordWrapWidth = isMobileVertical() ? pxVwM(900) : pxVw(1100);
    this.textStylePaylines.wordWrapWidth = isMobileVertical() ? pxVwM(900) : pxVw(1100);
    this.textStylePaylines.fontSize = vw(isMobileVertical() ? 2.5 : 1.5);

    //=============================================================[1]=============================================================
    this.symbolPayoutsTitle.position.y = 0;
    horizontallyCenter(this.symbolPayoutsTitle, this.scrollBoxWidth());

    this.symbolPayoutsSymbols.width = this.scrollBoxWidth();
    this.symbolPayoutsSymbols.height = this.wrapper.pxBgSpec(950);
    this.symbolPayoutsSymbols.position.y = this.symbolPayoutsTitle.position.y + this.wrapper.pxBgSpec(100);
    horizontallyCenter(this.symbolPayoutsSymbols, this.scrollBoxWidth());

    //=============================================================[2]=============================================================
    this.specialFreeSpinsTitle.position.y =
      this.symbolPayoutsSymbols.position.y + this.symbolPayoutsSymbols.height + this.wrapper.pxBgSpec(20);
    horizontallyCenter(this.specialFreeSpinsTitle, this.scrollBoxWidth());

    this.specialFreeSpinsSymbols.width = this.wrapper.pxBgSpec(200);
    this.specialFreeSpinsSymbols.height = this.wrapper.pxBgSpec(200);
    horizontallyCenter(this.specialFreeSpinsSymbols, this.scrollBoxWidth());
    this.specialFreeSpinsSymbols.position.y = this.specialFreeSpinsTitle.position.y + this.wrapper.pxBgSpec(100);

    this.specialFreeSpinsText.position.y =
      this.specialFreeSpinsSymbols.position.y + this.specialFreeSpinsSymbols.height + this.wrapper.pxBgSpec(20);
    horizontallyCenter(this.specialFreeSpinsText, this.scrollBoxWidth());

    //=============================================================[3]=============================================================
    this.paylinesTitle.position.y =
      this.specialFreeSpinsText.position.y + this.specialFreeSpinsText.height + this.wrapper.pxBgSpec(20);
    horizontallyCenter(this.paylinesTitle, this.scrollBoxWidth());

    this.paylinesVisual.width = this.wrapper.pxBgSpec(1500);
    this.paylinesVisual.height = this.wrapper.pxBgSpec(750);
    horizontallyCenter(this.paylinesVisual, this.scrollBoxWidth());
    this.paylinesVisual.position.y = this.paylinesTitle.position.y + this.wrapper.pxBgSpec(50);

    horizontallyCenter(this.paylinesText, this.scrollBoxWidth());
    this.paylinesText.position.y =
      this.paylinesVisual.position.y + this.paylinesVisual.height + this.wrapper.pxBgSpec(20);

    //=============================================================================================================================
    this.scrollbox.resize({
      boxWidth: this.scrollBoxWidth() + 10,
      boxHeight: this.wrapper.pxBg(1025),
    });
    horizontallyCenter(this.scrollbox, this.wrapper.width);
    this.scrollbox.position.y = this.wrapper.pxBg(200);

    this.wrapper.recenter();
  }
}

export default InfoScreenDesktop;
