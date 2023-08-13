import { Rectangle, intersects, pointInRectangle } from '../math/geometry/rectangle';
import { Vector2 } from '../math/vector2';

interface OctTreeItem {
  entityId: number;
  position: Vector2;
}

export class OctTree<T extends OctTreeItem> {
  public children: T[] = [];
  public divided: boolean = false;
  public northwest!: OctTree<T>;
  public northeast!: OctTree<T>;
  public southwest!: OctTree<T>;
  public southeast!: OctTree<T>;

  //TODO: change to AABB?
  public constructor(
    private bounds: Rectangle,
    private maxChildren: number = 4,
  ) {}

  public insert(child: T): boolean {
    if (!pointInRectangle(child.position, this.bounds)) {
      return false;
    }

    if (this.children.length < this.maxChildren) {
      this.children.push(child);
      return true;
    }

    if (!this.divided) {
      this.divide();
    }

    return (
      this.northeast.insert(child) ||
      this.northwest.insert(child) ||
      this.southeast.insert(child) ||
      this.southwest.insert(child)
    );
  }

  public query(range: Rectangle, found: T[] = []): T[] {
    if (!intersects(this.bounds, range)) {
      return found;
    }
    found.push(...this.children.filter((c) => pointInRectangle(c.position, range)));
    if (this.divided) {
      this.northeast.query(range, found);
      this.northwest.query(range, found);
      this.southeast.query(range, found);
      this.southwest.query(range, found);
    }
    return found;
  }

  private divide() {
    const size: Vector2 = [this.bounds.size[0] / 2, this.bounds.size[1] / 2];
    this.northwest = new OctTree<T>(
      {
        position: [this.bounds.position[0], this.bounds.position[1]],
        size,
      },
      this.maxChildren,
    );
    this.northeast = new OctTree<T>(
      {
        position: [this.bounds.position[0] + size[0], this.bounds.position[1]],
        size,
      },
      this.maxChildren,
    );
    this.southwest = new OctTree<T>(
      {
        position: [this.bounds.position[0], this.bounds.position[1] + size[1]],
        size,
      },
      this.maxChildren,
    );
    this.southeast = new OctTree<T>(
      {
        position: [this.bounds.position[0] + size[0], this.bounds.position[1] + size[1]],
        size,
      },
      this.maxChildren,
    );
    this.divided = true;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = '1px solid black';
    ctx.rect(this.bounds.position[0], this.bounds.position[1], this.bounds.size[0], this.bounds.size[1]);
    if (this.divided) {
      this.northeast.draw(ctx);
      this.northwest.draw(ctx);
      this.southeast.draw(ctx);
      this.southwest.draw(ctx);
    }
  }
}
