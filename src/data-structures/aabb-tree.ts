//https://www.azurefromthetrenches.com/introductory-guide-to-aabb-tree-collision-detection/

import { AABB, intersects } from '../math/geometry/aabb';

export const enum NodeType {
  Leaf = 0,
  Branch = 1,
}

interface AABBNode {
  type: NodeType;
  aabb: AABB;
  entityId?: number;
  parent?: AABBNode;
  left?: AABBNode;
  right?: AABBNode;
}

export class AABBTree {
  public root: AABBNode;

  constructor() {
    this.root = {
      type: NodeType.Branch,
      aabb: { min: [Number.MIN_VALUE, Number.MIN_VALUE], max: [Number.MAX_VALUE, Number.MAX_VALUE] },
    };
  }

  public insert(_node: AABBNode) {}

  public query(aabb: AABB): AABBNode[] {
    const found: AABBNode[] = [];
    const fringe: AABBNode[] = [this.root];
    while (fringe.length > 0) {
      const n: AABBNode = fringe.pop()!;
      if (intersects(n?.aabb, aabb)) {
        if (n.type === NodeType.Leaf) {
          found.push(n);
        } else {
          fringe.push(n.left!, n.right!);
        }
      }
    }
    return found;
  }
}
