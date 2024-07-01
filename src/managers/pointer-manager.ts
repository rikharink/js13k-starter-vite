import { Vector2, copy, mul, subtract } from '../math/vector2';

export class PointerManager {
  private pointerState: boolean[] = [];
  private previousPointerState: boolean[] = [];
  private pointerLocation: Vector2[] = [];
  private previousPointerLocation: Vector2[] = [];
  private lastActivePointer?: number;
  private game: HTMLCanvasElement;

  private eventCache: PointerEvent[] = [];

  public constructor(game: HTMLCanvasElement) {
    game.addEventListener('pointerdown', this.onPointerDown.bind(this));
    game.addEventListener('pointerup', this.onPointerUp.bind(this));
    game.addEventListener('pointermove', this.onPointerMove.bind(this));
    game.addEventListener('pointercancel', this.onPointerUp.bind(this));
    game.addEventListener('contextmenu', (ev) => ev.preventDefault());
    this.game = game;
  }

  public hasPointerDown(pointerId?: number): boolean {
    return this.pointerState[pointerId ?? this.lastActivePointer ?? 0];
  }

  public hasPointerUp(pointerId?: number): boolean {
    const pid = pointerId ?? this.lastActivePointer ?? 0;
    return this.previousPointerState[pid] && !this.pointerState[pid];
  }

  public getPointerLocation(): Vector2 {
    return this.pointerLocation[this.lastActivePointer ?? 0] ?? [0, 0];
  }

  public getPointerDelta(): Vector2 {
    const now = this.pointerLocation[this.lastActivePointer ?? 0] ?? [0, 0];
    const then = this.previousPointerLocation[this.lastActivePointer ?? 0] ?? [0, 0];
    return subtract([0, 0], now, then);
  }

  private onPointerDown(ev: PointerEvent): void {
    this.game.setPointerCapture(ev.pointerId);
    this.lastActivePointer = ev.pointerId;
    this.previousPointerState[ev.pointerId] = false;
    this.pointerState[ev.pointerId] = true;
    this.eventCache.push(ev);
  }

  private onPointerUp(ev: PointerEvent): void {
    this.game.releasePointerCapture(ev.pointerId);
    this.lastActivePointer = ev.pointerId;
    this.previousPointerState[ev.pointerId] = true;
    this.pointerState[ev.pointerId] = false;

    const index = this.eventCache.findIndex((cachedEv) => cachedEv.pointerId === ev.pointerId);
    this.eventCache.splice(index, 1);
  }

  private onPointerMove(ev: PointerEvent): void {
    this.lastActivePointer = ev.pointerId;
    this.pointerLocation[ev.pointerId] = [ev.clientX - this.game.offsetLeft, ev.clientY - this.game.offsetTop];
    mul(this.pointerLocation[ev.pointerId], this.pointerLocation[ev.pointerId], [
      this.game.width / this.game.clientWidth,
      this.game.height / this.game.clientHeight,
    ]);
    const index = this.eventCache.findIndex((cachedEv) => cachedEv.pointerId === ev.pointerId);
    this.eventCache[index] = ev;
  }

  public tick(): void {
    this.previousPointerLocation = [...this.pointerLocation.map((l) => copy([0, 0], l))];
    this.previousPointerState = [...this.pointerState];
  }
}
