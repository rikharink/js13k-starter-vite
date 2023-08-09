import { Camera } from '../rendering/camera';
import { Sprite } from '../rendering/sprite';

export interface Scene {
  name: string;
  sprites: Sprite[];
  trauma: number;
  onPush(): void;
  onPop(): void;
  tick(camera: Camera): void;
}
