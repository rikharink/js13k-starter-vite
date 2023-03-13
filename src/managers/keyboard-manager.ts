export class KeyboardManager {
  private _previousKeyState: Set<string> = new Set<string>();
  private _currentKeyState: Set<string> = new Set<string>();

  public constructor() {
    document.addEventListener("keydown", this._onKeyDown.bind(this));
    document.addEventListener("keyup", this._onKeyUp.bind(this));
  }

  private _onKeyDown(ev: KeyboardEvent) {
    if (this._currentKeyState.has(ev.key)) {
      return;
    }
    this._currentKeyState.add(ev.key);
    this._previousKeyState.delete(ev.key);
  }

  private _onKeyUp(ev: KeyboardEvent) {
    if (!this._currentKeyState.has(ev.key)) {
      return;
    }
    this._previousKeyState.add(ev.key);
    this._currentKeyState.delete(ev.key);
  }

  public hasKeyDown(key: string): boolean {
    return this._currentKeyState.has(key);
  }

  public hasKeyUp(key: string): boolean {
    return this._previousKeyState.has(key) && !this._currentKeyState.has(key);
  }

  public tick() {
    this._previousKeyState.clear();
  }
}
