import { ResourceManager } from '../managers/resource-manager';
import { SceneManager } from '../managers/scene-manager';
import { NormalizedRgbaColor } from '../math/color';
import { AABB } from '../math/geometry/aabb';
import { Camera } from '../rendering/camera';
import { Sprite } from '../rendering/sprite';
import { Texture } from '../textures/texture';

export interface Background {
  type: 'color' | 'texture';
  color?: NormalizedRgbaColor;
  texture?: Texture;
}

export interface Scene {
  name: string;
  bg: Background;
  sprites: Sprite[];
  bounds: AABB;
  trauma: number;
  traumaDampening: number;
  camera: Camera;
  sceneTime: number;
  onPush(): void;
  onPop(): void;
  fixedTick(): void;
  variableTick(): void;
  sceneManager: SceneManager;
  resourceManager: ResourceManager;
}
