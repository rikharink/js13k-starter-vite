import { AABB } from '../math/geometry/aabb';
import { Camera } from '../rendering/camera';
import { Sprite } from '../rendering/sprite';

export interface Scene {
  name: string;
  sprites: Sprite[];
  bounds: AABB;
  trauma: number;
  traumaDampening: number;
  camera: Camera;
  onPush(): void;
  onPop(): void;
  tick(camera: Camera): void;
}
