import { Matrix4x4, create, lookAt, multiply, ortho } from '../math/matrix4x4';
import { Vector2 } from '../math/vector2';

export class Camera {
  private projection!: Matrix4x4;
  private view!: Matrix4x4;

  public projectionViewMatrix: Matrix4x4;

  constructor(private viewport: Vector2) {
    this.projectionViewMatrix = create();
  }

  public update() {
    this.projection = ortho(create(), 0, this.viewport[0], this.viewport[1], 0, -1, 1);
    this.view = lookAt(create(), [0, 0, 1], [0, 0, 0], [0, 1, 0]);
    multiply(this.projectionViewMatrix, this.projection, this.view);
  }
}
