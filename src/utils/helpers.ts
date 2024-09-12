import * as PIXI from 'pixi.js';
import { PixiObject } from '../objects/RenderObject';
import Button from '../objects/UI/Button';
import Field from '../objects/UI/Field';

export const getSymbolIndex = (view: string[][], row: number, column: number): number => {
  return parseInt(view[row % 3][column], 10);
};

export const inIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isIos = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

export const isVertical = () => {
  return window.orientation === 0;
};

export const isMobileVertical = () => {
  return isMobile() && isVertical();
};

export const getProp = (object: any, keys: string | string[], defaultVal: any = undefined): any => {
  keys = Array.isArray(keys) ? keys : keys.split('.');
  object = object ? object[keys[0]] : undefined;
  if (object && keys.length > 1) {
    return getProp(object, keys.slice(1), defaultVal);
  }
  return object === undefined ? defaultVal : object;
};

export const show = (...objects: PixiObject[]): void => {
  objects.forEach((object) => {
    object.alpha = 1;
    object.visible = true;
  });
};

export const hide = (...objects: PixiObject[]): void => {
  objects.forEach((object) => {
    object.alpha = 0;
    object.visible = false;
  });
};

export const positionFields = (
  fields: Field[],
  xPosition: number,
  yPosition: number,
  rowCount: number,
  pxFunc: (px: number) => number,
) => {
  fields.forEach((button, index) => {
    const row = Math.ceil((index + 1) / rowCount);
    const column = Math.floor((index + 1) % rowCount) || rowCount;

    button.calculateSizes();
    button.position.x = xPosition + pxFunc(198) * (column - 1);
    button.position.y = yPosition + pxFunc(80) * (row - 1);
  });
};

export const getCurrency = async (): Promise<any> => {
  try {
    const response = await fetch('./currencies/currencies.json');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getLanguage = async (langString: string): Promise<any> => {
  try {
    const promises = [
      fetch(`./languages/${langString}.json`).then((response) => response.json()),
      fetch('./languages/en.json').then((response) => response.json()),
    ];

    const [langResponse, defaultResponse] = await Promise.all(promises);
    return [langResponse, defaultResponse];
  } catch (error) {
    throw error;
  }
};

export const popupCenter = (url: string, title: string, w: number, h: number): void => {
  const dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screenLeft;
  const dualScreenTop = window.screenTop != undefined ? window.screenTop : screenTop;

  const width = window.innerWidth
    ? window.innerWidth
    : document.documentElement.clientWidth
      ? document.documentElement.clientWidth
      : screen.width;
  const height = window.innerHeight
    ? window.innerHeight
    : document.documentElement.clientHeight
      ? document.documentElement.clientHeight
      : screen.height;

  const left = width / 2 - w / 2 + dualScreenLeft;
  const top = height / 2 - h / 2 + dualScreenTop;
  const newWindow = window.open(
    url,
    title,
    'location=yes, scrollbars=yes, status=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left,
  );

  newWindow?.focus();
};

export const makeButton = (buttonName: string): Button => {
  return new Button(
    PIXI.Texture.from(`${buttonName}Normal`),
    PIXI.Texture.from(`${buttonName}Down`),
    PIXI.Texture.from(`${buttonName}Hover`),
    PIXI.Texture.from(`${buttonName}Disabled`),
  );
};
