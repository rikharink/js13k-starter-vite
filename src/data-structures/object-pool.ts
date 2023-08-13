export const OBJECTPOOL_OBJECT_NOT_USED = 0;
export const OBJECTPOOL_OBJECT_USED = 1;

type FuncReset<T> = (o: T) => void;

interface Entity {
  id: number;
}

interface Poolable<T extends Entity> {
  id: number;
  entity: T;
  status: number;
  reset: FuncReset<T>;
}

function poolableFactory<T extends Entity>(f: () => T, r: FuncReset<T>): Poolable<T> {
  return {
    id: -1,
    entity: f(),
    status: OBJECTPOOL_OBJECT_NOT_USED,
    reset: r,
  };
}

export class ObjectPool<T extends Entity> {
  private _objects: Poolable<T>[] = [];

  constructor(
    private _capacity: number,
    private _factory: () => T,
    private _reset: FuncReset<T>,
  ) {
    this._objects = Array.from({ length: _capacity }, (_v, _i) => poolableFactory(_factory, _reset));
  }

  public get(): T {
    let f = this._objects.find(objectNotInUse);
    if (!f) {
      this.increaseCapacity();
      return this.get();
    }

    f.status = OBJECTPOOL_OBJECT_USED;
    f.id = f.entity.id;
    return f.entity;
  }

  private increaseCapacity() {
    this._objects.push(...Array.from({ length: this._capacity }, () => poolableFactory(this._factory, this._reset)));
    this._capacity = this._capacity * 2;
  }

  public releaseObject(o: T) {
    const poolItem = this._objects.find((x) => objectHasId(x, o.id));
    if (!poolItem) return;

    poolItem.reset(o);
    poolItem.id = -1;
    poolItem.status = OBJECTPOOL_OBJECT_NOT_USED;
  }

  public get length(): number {
    return this._objects.filter(objectInUse).length;
  }

  public get capacity(): number {
    return this.capacity;
  }
}

function objectHasId<T extends Entity>(o: Poolable<T>, id: number): boolean {
  return o.id === id;
}

function objectInUse<T extends Entity>(o: Poolable<T>): boolean {
  return o.status === OBJECTPOOL_OBJECT_USED;
}

function objectNotInUse<T extends Entity>(o: Poolable<T>): boolean {
  return o.status === OBJECTPOOL_OBJECT_NOT_USED;
}
