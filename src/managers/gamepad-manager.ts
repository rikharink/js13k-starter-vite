export class GamepadManager {
  public constructor() {
    window.addEventListener(
      "gamepadconnected",
      this._onGamepadConnected.bind(this)
    );

    window.addEventListener(
      "gamepaddisconnected",
      this._onGamepadDisconnected.bind(this)
    );

    for (let gp of navigator.getGamepads()) {
      if (gp == null) continue;
      this._connectGamepad(gp);
    }
  }

  private _onGamepadConnected(ev: GamepadEvent) {
    this._connectGamepad(ev.gamepad);
  }
  private _onGamepadDisconnected(ev: GamepadEvent) {
    this._disconnectGamepad(ev.gamepad);
  }

  private _connectGamepad(gamepad: Gamepad) {
    console.log(`connected gamepad ${gamepad.id}`);
  }
  
  private _disconnectGamepad(gamepad: Gamepad) {
    console.log(`disconnected gamepad ${gamepad.id}`);
  }

  public tick() {}
}
