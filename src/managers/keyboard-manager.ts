export class KeyboardManager {
  private previousKeyState: Set<string> = new Set<string>();
  private currentKeyState: Set<string> = new Set<string>();

  public constructor() {
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  private onKeyDown(ev: KeyboardEvent): void {
    if (this.currentKeyState.has(ev.code)) {
      return;
    }
    console.debug(ev.code);
    this.previousKeyState.delete(ev.code);
    this.currentKeyState.add(ev.code);
  }

  private onKeyUp(ev: KeyboardEvent): void {
    if (!this.currentKeyState.has(ev.code)) {
      return;
    }
    this.previousKeyState.add(ev.code);
    this.currentKeyState.delete(ev.code);
  }

  public hasKeyDown(key: string): boolean {
    return this.currentKeyState.has(key);
  }

  public hasKeyUp(key: string): boolean {
    return this.previousKeyState.has(key) && !this.currentKeyState.has(key);
  }

  public tick(): void {}

  public clear(): void {
    this.previousKeyState.clear();
  }
}
