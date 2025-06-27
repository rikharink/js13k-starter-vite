import { Vector2 } from '../math/vector2';
import { TextureAtlas } from '../textures/atlas';

export const enum Solidity {
  None = 0,
  Top = 1,
  Right = 2,
  Bottom = 4,
  Left = 8,
  Solid = 15,
}

export type Tile = [textureIndex: number, flipX: boolean, flipY: boolean, solidity: Solidity];
export type TTTileMapExport = [size: Vector2, ...tiles: (Tile | null)[]];

export class TTTileMap {
  public size: Vector2;
  public tiles: (Tile | null)[];
  public textureAtlas: TextureAtlas;

  constructor(map: TTTileMapExport, textureAtlas: TextureAtlas) {
    this.size = map[0];
    this.textureAtlas = textureAtlas;
    this.tiles = map.slice(1) as (Tile | null)[];
  }
}
