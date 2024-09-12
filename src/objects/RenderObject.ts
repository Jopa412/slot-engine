import { Container, Sprite, AnimatedSprite, Text } from 'pixi.js';

export type PixiObject = Container | Sprite | AnimatedSprite | Text;

export default interface RenderObject {
  pixiObject: PixiObject;

  calculateSizes(): void;
}
