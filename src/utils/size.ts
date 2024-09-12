import { PixiObject } from '../objects/RenderObject';
import { isIos, isMobileVertical } from './helpers';

export type WHObject = {
  width: number;
  height: number;
};

export const vw = (percentage: number): number => {
  let width = isIos() ? window.innerWidth : document.documentElement.clientWidth;
  if (width < 150) {
    width = 150;
  }
  return (width * percentage) / 100;
};

export const vh = (percentage: number): number => {
  let height = isIos() ? window.innerHeight : document.documentElement.clientHeight;
  if (height < 150) {
    height = 150;
  }
  return (height * percentage) / 100;
};

export const isHeightBased = (): boolean => vw(47.16) > vh(100) - vw(6.04);

export const applyMainContainerSizing = (object: PixiObject | WHObject): void => {
  if (isMobileVertical()) {
    object.width = vw(100);
    object.height = vw(75.7575);
  } else if (isHeightBased()) {
    object.height = vh(100) - vw(8);
    object.width = object.height * 1.3203;
  } else {
    object.width = vw(63.0416);
    object.height = vw(47.7479);
  }

  object.width = Math.abs(object.width);
  object.height = Math.abs(object.height);
};

export const getMainContainerSizing = (): WHObject => {
  const object = { width: 0, height: 0 };
  applyMainContainerSizing(object);

  return object;
};

export const reelColumnWidth = (): number => {
  const mainContainerSize = getMainContainerSizing();

  return mainContainerSize.width * 0.263888;
};

export const reelSeparatorWidth = (): number => {
  const mainContainerSize = getMainContainerSizing();

  return mainContainerSize.width * 0.027777;
};

export const reelSymbolHeight = (): number => {
  const mainContainerSize = getMainContainerSizing();

  return mainContainerSize.width * 0.201234;
};

export const reelSymbolWidth = (): number => {
  const mainContainerSize = getMainContainerSizing();

  return mainContainerSize.width * 0.263888;
};

export const centerOnWindow = (object: PixiObject): void => {
  if (isMobileVertical()) {
    const mainContainerSize = getMainContainerSizing();
    const spaceBelow = vh(100) - vw(26.2037037037037) * 2 - mainContainerSize.height;

    object.position.y = (vh(100) - spaceBelow - object.height) / 2;
  } else {
    object.position.y = (vh(100) - vw(6.9) - object.height) / 2;
  }
  object.position.x = (vw(100) - object.width) / 2;
};

export const horizontallyCenter = (object: PixiObject, fullWidth = vw(100)): void => {
  object.position.x = fullWidth / 2 - object.width / 2;
};

export const pxVw = (fullHDPixels: number): number => {
  return vw(fullHDPixels / 19.2);
};

export const pxVwM = (fullHDPixels: number): number => {
  return vw(fullHDPixels / 10.8);
};
