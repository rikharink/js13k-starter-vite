import { gl } from '../game';
import { RgbColor, rgbaString } from '../math/color';
import { Vector2 } from '../math/vector2';
import { Sprite } from '../rendering/sprite';
import { generateTextureFromText } from '../textures/textures';
import { UIElement } from './ui-element';

let labelId = 0xbeefcafe;
export class Label implements UIElement {
  public size: Vector2 = [0, 0];
  sprites: Sprite[] = [];

  constructor(text: string, fontSize: number, fontFamily: string, color: RgbColor, position: Vector2) {
    const texture = generateTextureFromText(gl, text, {
      fontSize,
      fontFamily,
      fillStyle: rgbaString(color, 255),
    });
    this.size = texture.size;
    this.sprites.push(new Sprite(labelId++, texture.size, position, texture));
  }

  public get position(): Vector2 {
    return this.sprites[0].position;
  }

  public set position(pos: Vector2) {
    this.sprites[0].position = pos;
    console.log(this.position);
  }

  tick(): void {}
}
