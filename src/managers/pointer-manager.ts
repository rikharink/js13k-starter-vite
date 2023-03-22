export class PointerManager {
  private pointerState: boolean[] = [];
  private previousPointerState: boolean[] = [];
  private pointerLocation: [number, number][] = [];
  private lastActivePointer?: number;
  private game: HTMLCanvasElement;

  public constructor(game: HTMLCanvasElement) {
    game.addEventListener('pointerdown', this.onPointerDown.bind(this));
    game.addEventListener('pointerup', this.onPointerUp.bind(this));
    game.addEventListener('pointermove', this.onPointerMove.bind(this));
    game.addEventListener('contextmenu', (ev) => ev.preventDefault());
    this.game = game;
  }

  public hasPointerDown(pointerId = 0): boolean {
    return this.pointerState[pointerId];
  }

  public hasPointerUp(pointerId = 0): boolean {
    return this.previousPointerState[pointerId] && !this.pointerState[pointerId];
  }

  public getPointerLocation(): [number, number] {
    return this.pointerLocation[this.lastActivePointer ?? 0] ?? [0, 0];
  }

  private onPointerDown(ev: PointerEvent): void {
    this.lastActivePointer = ev.pointerId;
    this.previousPointerState[ev.pointerId] = false;
    this.pointerState[ev.pointerId] = true;
  }

  private onPointerUp(ev: PointerEvent): void {
    this.lastActivePointer = ev.pointerId;
    this.previousPointerState[ev.pointerId] = true;
    this.pointerState[ev.pointerId] = false;
  }

  private onPointerMove(ev: PointerEvent): void {
    this.lastActivePointer = ev.pointerId;
    this.pointerLocation[ev.pointerId] = [ev.clientX - this.game.offsetLeft, ev.clientY - this.game.offsetTop];
  }

  public tick(): void {
    this.previousPointerState = [];
  }
}
