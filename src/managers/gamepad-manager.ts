export class GamepadManager {
  public constructor() {
    window.addEventListener('gamepadconnected', this._onGamepadConnected.bind(this));

    window.addEventListener('gamepaddisconnected', this._onGamepadDisconnected.bind(this));

    for (const gp of navigator.getGamepads()) {
      if (gp == null) continue;
      this._connectGamepad(gp);
    }
  }

  private _onGamepadConnected(ev: GamepadEvent): void {
    this._connectGamepad(ev.gamepad);
  }
  private _onGamepadDisconnected(ev: GamepadEvent): void {
    this._disconnectGamepad(ev.gamepad);
  }

  private _connectGamepad(gamepad: Gamepad): void {
    console.log(`connected gamepad ${gamepad.id}`);
  }

  private _disconnectGamepad(gamepad: Gamepad): void {
    console.log(`disconnected gamepad ${gamepad.id}`);
  }

  public tick(): void {
    //TICK
  }
}
