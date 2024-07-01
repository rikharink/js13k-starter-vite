import { Vector2, copy, scale, subtract } from '../math/vector2';
import { Camera } from '../rendering/camera';
import { Sprite } from '../rendering/sprite';
import { UIElement } from './ui-element';

export const enum Orientation {
  Horizontal = 1,
  Vertical = 2,
}

export class StackLayout implements UIElement {
  private elements: UIElement[] = [];
  private nextPosition: Vector2;
  public size: Vector2 = [0, 0];

  constructor(
    public spacing = 0,
    private _position: Vector2 = [0, 0],
    private orientation: Orientation = Orientation.Vertical,
  ) {
    this.nextPosition = [..._position];
    const sizeIndex = this.orientation === Orientation.Vertical ? 0 : 1;
    this.size[sizeIndex] -= spacing;
  }

  public add(element: UIElement): void {
    this.elements.push(element);
    copy(element.position, this.nextPosition);

    const index = this.orientation === Orientation.Vertical ? 1 : 0;
    const sizeIndex = this.orientation === Orientation.Vertical ? 0 : 1;

    this.nextPosition[index] += element.size[index] + this.spacing;
    this.size[index] += element.size[index] + this.spacing;
    if (element.size[sizeIndex] > this.size[sizeIndex]) {
      this.size[sizeIndex] = element.size[sizeIndex];
    }
  }

  public get sprites(): Sprite[] {
    return this.elements.flatMap((element) => element.sprites);
  }

  public get position(): Vector2 {
    return this._position;
  }

  public set position(pos: Vector2) {
    this._position = pos;
    this.nextPosition = [...pos];
    for (let element of this.elements) {
      const pos: Vector2 = [0, 0];
      copy(pos, this.nextPosition);
      element.position = pos;
      const index = this.orientation === Orientation.Vertical ? 1 : 0;
      this.nextPosition[index] += element.size[index] + this.spacing;
    }
  }

  public center(camera: Camera): void {
    const center = camera.center;
    const size = this.size;
    const pos: Vector2 = [0, 0];
    copy(pos, center);
    subtract(pos, pos, scale([0, 0], size, 0.5));
    this.position = pos;
    const sizeIndex = this.orientation === Orientation.Vertical ? 0 : 1;

    for (let ele of this.elements) {
      const delta = size[sizeIndex] - ele.size[sizeIndex];
      if (this.orientation === Orientation.Vertical) {
        ele.position = [ele.position[0] + delta * 0.5, ele.position[1]];
      } else {
        ele.position = [ele.position[0], ele.position[1] + delta * 0.5];
      }
    }
  }

  tick(): void {
    this.elements.forEach((element) => element.tick());
  }
}
