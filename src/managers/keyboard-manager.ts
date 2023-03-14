export class KeyboardManager {
  private previousKeyState: Set<string> = new Set<string>();
  private currentKeyState: Set<string> = new Set<string>();

  public constructor() {
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  private onKeyDown(ev: KeyboardEvent): void {
    if (this.currentKeyState.has(ev.key)) {
      return;
    }
    this.previousKeyState.delete(ev.key);
    this.currentKeyState.add(ev.key);
  }

  private onKeyUp(ev: KeyboardEvent): void {
    if (!this.currentKeyState.has(ev.key)) {
      return;
    }
    this.previousKeyState.add(ev.key);
    this.currentKeyState.delete(ev.key);
  }

  public hasKeyDown(key: string): boolean {
    return this.currentKeyState.has(key);
  }

  public hasKeyUp(key: string): boolean {
    return this.previousKeyState.has(key) && !this.currentKeyState.has(key);
  }

  public tick(): void {
    this.previousKeyState.clear();
  }
}
