import { Vector2, add, copy } from '../math/vector2';
import { Sprite } from '../rendering/sprite';
import { gl, pointerManager, resourceManager } from '../game';
import { generateTextureFromText } from '../textures/textures';
import { UIElement } from './ui-element';
import { Texture } from '../textures/texture';
import { rgbaString } from '../math/color';
import { BASE01, BASE02, BASE05, BASE07 } from '../palette';

type ButtonClickHandler = (btn: Button) => void;

let buttonId = 0xdead;
export class Button implements UIElement {
  sprites: Sprite[] = [];
  onClick: ButtonClickHandler;
  fg: Texture;
  disabled = false;

  constructor(
    text: string,
    private fontSize: number,
    position: Vector2,
    private _size: Vector2,
    onClick: ButtonClickHandler,
  ) {
    const texture = resourceManager.textures.get('sc')!;
    this.sprites.push(new Sprite(buttonId++, _size, position, texture));
    this.fg = generateTextureFromText(gl, text, {
      fontSize: fontSize,
      fillStyle: rgbaString(BASE05, 255),
      fontFamily: 'monospace',
    });
    const pos: Vector2 = [...position];
    pos[0] += _size[0] * 0.5 - this.fg.size[0] * 0.5;
    pos[1] += _size[1] * 0.5 - fontSize * 0.5;
    this.sprites.push(new Sprite(buttonId++, this.fg.size, pos, this.fg));
    this.onClick = onClick;
  }

  public get size(): Vector2 {
    return this.sprites[0].size;
  }

  public get position(): Vector2 {
    return this.sprites[0].position;
  }

  public set position(pos: Vector2) {
    copy(this.sprites[0].position, pos);
    const textDisplacement: Vector2 = [
      this._size[0] * 0.5 - this.fg.size[0] * 0.5,
      this._size[1] * 0.5 - this.fontSize * 0.5,
    ];
    copy(this.sprites[1].position, this.sprites[0].position);
    add(this.sprites[1].position, this.sprites[1].position, textDisplacement);
  }

  public tick() {
    if (
      pointerManager.hasPointerUp() &&
      this.sprites[0].contains(pointerManager.getPointerLocation()) &&
      !this.disabled
    ) {
      this.disabled = true;
      this.onClick(this);
    }
    if (this.disabled) {
      this.sprites[0].color = BASE07;
    } else if (this.sprites[0].contains(pointerManager.getPointerLocation())) {
      this.sprites[0].color = BASE02;
    } else {
      this.sprites[0].color = BASE01;
    }
  }
}
