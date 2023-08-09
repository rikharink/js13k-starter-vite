import { LinkedList } from './linked-list';
import { clamp } from '../math/util';
import { Vector2 } from '../math/vector2';
import { Rectangle } from '../rendering/sprite';

interface SpatialHashGridCells {
  min: number[];
  max: number[];
  nodes: LinkedList<Client>[][];
}

export class Client {
  constructor(
    public entityId: number,
    public boundingBox: Rectangle,
  ) {
    this.cells = {
      min: [],
      max: [],
      nodes: [],
    };
    this.queryId = -1;
  }

  cells: SpatialHashGridCells;
  queryId;
}

export class SpatialHashGrid {
  private _cells: (LinkedList<Client> | null)[][];
  private _dimensions: Vector2;
  private _bounds: Rectangle;
  private _queryIds: number;

  constructor(bounds: Rectangle, dimensions: Vector2) {
    this._cells = [...Array(dimensions[0])].map((_) => [...Array(dimensions[1])].map((_) => null));
    this._dimensions = dimensions;
    this._bounds = bounds;
    this._queryIds = 0;
  }

  public newClient(entityId: number, boundingBox: Rectangle): Client {
    const client: Client = new Client(entityId, boundingBox);
    this.insert(client);
    return client;
  }

  public updateClient(client: Client): void {
    const [x, y] = client.boundingBox.position;
    const [w, h] = client.boundingBox.size;

    const i1 = this.getCellIndex([x - w / 2, y - h / 2]);
    const i2 = this.getCellIndex([x + w / 2, y + h / 2]);

    if (
      client.cells.min &&
      client.cells.max &&
      client.cells.min[0] == i1[0] &&
      client.cells.min[1] == i1[1] &&
      client.cells.max[0] == i2[0] &&
      client.cells.max[1] == i2[1]
    ) {
      return;
    }

    this.remove(client);
    this.insert(client);
  }

  public findNear(boundingBox: Rectangle): Client[] {
    const [x, y] = boundingBox.position;
    const [w, h] = boundingBox.size;

    const i1 = this.getCellIndex([x - w / 2, y - h / 2]);
    const i2 = this.getCellIndex([x + w / 2, y + h / 2]);

    const clients = [];
    const queryId = this._queryIds++;

    for (let x = i1[0], xn = i2[0]; x <= xn; ++x) {
      for (let y = i1[1], yn = i2[1]; y <= yn; ++y) {
        let head = this._cells[x][y];

        while (head) {
          const v = head.value;
          head = head.next;

          if (v.queryId != queryId) {
            v.queryId = queryId;
            clients.push(v);
          }
        }
      }
    }
    return clients;
  }

  public remove(client: Client): void {
    const i1 = client.cells.min;
    const i2 = client.cells.max;

    for (let x = i1[0], xn = i2[0]; x <= xn; ++x) {
      for (let y = i1[1], yn = i2[1]; y <= yn; ++y) {
        const xi = x - i1[0];
        const yi = y - i1[1];
        const node = client.cells.nodes[xi][yi];

        if (node.next) {
          node.next.prev = node.prev;
        }
        if (node.prev) {
          node.prev.next = node.next;
        }

        if (!node.prev) {
          this._cells[x][y] = node.next;
        }
      }
    }

    client.cells.min = [];
    client.cells.max = [];
    client.cells.nodes = [];
  }

  private insert(client: Client): void {
    const [x, y] = client.boundingBox.position;
    const [w, h] = client.boundingBox.size;

    const i1 = this.getCellIndex([x - w / 2, y - h / 2]);
    const i2 = this.getCellIndex([x + w / 2, y + h / 2]);

    const nodes: LinkedList<Client>[][] = [];

    for (let x = i1[0], xn = i2[0]; x <= xn; ++x) {
      nodes.push([]);

      for (let y = i1[1], yn = i2[1]; y <= yn; ++y) {
        const xi = x - i1[0];

        const head: LinkedList<Client> = new LinkedList<Client>(client);

        nodes[xi].push(head);

        head.next = this._cells[x][y];
        if (this._cells[x][y] !== null) {
          this._cells[x][y]!.prev = head;
        }
        this._cells[x][y] = head;
      }
    }

    client.cells.min = i1;
    client.cells.max = i2;
    client.cells.nodes = nodes;
  }

  private getCellIndex(position: Vector2): Vector2 {
    const x = clamp(0, 1, (position[0] - this._bounds.position[0]) / (this._bounds.size[0] - this._bounds.position[0]));
    const y = clamp(0, 1, (position[1] - this._bounds.position[1]) / (this._bounds.size[1] - this._bounds.position[1]));

    const xIndex = Math.floor(x * (this._dimensions[0] - 1));
    const yIndex = Math.floor(y * (this._dimensions[1] - 1));

    return [xIndex, yIndex];
  }
}
