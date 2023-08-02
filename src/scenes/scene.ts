import { Sprite } from '../rendering/sprite';

export interface Scene {
  name: string;
  sprites: Sprite[];
  onPush(): void;
  onPop(): void;
  tick(gl: WebGL2RenderingContext): void;
}
