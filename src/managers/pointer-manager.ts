export class PointerManager {
  private _game: HTMLCanvasElement;

  private _pointerState: boolean[] = [];
  private _previousPointerState: boolean[] = [];
  private _pointerLocation: [number, number][] = [];

  public constructor(game: HTMLCanvasElement) {
    this._game = game;
    game.addEventListener("pointerdown", this._onPointerDown.bind(this));
    game.addEventListener("pointerup", this._onPointerUp.bind(this));
    game.addEventListener("pointermove", this._onPointerMove.bind(this));
    game.addEventListener("contextmenu", (ev) => ev.preventDefault());
  }

  public hasPointerDown(pointerId: number = 0): boolean {
    return this._pointerState[pointerId];
  }

  public hasPointerUp(pointerId: number = 0): boolean {
    return (
      this._previousPointerState[pointerId] && !this._pointerState[pointerId]
    );
  }

  public getPointerLocation(pointerId: number = 0): [number, number] {
    return this._pointerLocation[pointerId] ?? [0, 0];
  }

  private _onPointerDown(ev: PointerEvent) {
    this._previousPointerState[ev.pointerId] = false;
    this._pointerState[ev.pointerId] = true;
  }

  private _onPointerUp(ev: PointerEvent) {
    this._previousPointerState[ev.pointerId] = true;
    this._pointerState[ev.pointerId] = false;
  }

  private _onPointerMove(ev: PointerEvent) {
    let bcr = this._game.getBoundingClientRect();
    let cx = ev.clientX - bcr.left;
    let cy = ev.clientY - bcr.top;
    let sx = this._game.width / bcr.width;
    let sy = this._game.height / bcr.height;
    let x = cx * sx;
    let y = cy * sy;
    this._pointerLocation[ev.pointerId] = [x, y];
  }

  public tick() {
    this._previousPointerState = [];
  }
}
