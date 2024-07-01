import { ResourceManager } from '../managers/resource-manager';
import { SceneManager } from '../managers/scene-manager';
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
  sceneTime: number;
  onPush(): void;
  onPop(): void;
  tick(): void;
  sceneManager: SceneManager;
  resourceManager: ResourceManager;
}
