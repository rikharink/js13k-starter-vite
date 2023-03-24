export class GamepadManager {
  private gamepads: Gamepad[] = [];

  public constructor() {
    window.addEventListener('gamepadconnected', (e) => this.handleGamepadEvent(e.gamepad, true));
    window.addEventListener('gamepaddisconnected', (e) => this.handleGamepadEvent(e.gamepad, false));
    for (const gp of navigator.getGamepads()) {
      if (gp == null) continue;
      this.handleGamepadEvent(gp, true);
    }
  }

  private handleGamepadEvent(gamepad: Gamepad, connecting: boolean): void {
    if (connecting) {
      this.gamepads[gamepad.index] = gamepad;
    } else {
      delete this.gamepads[gamepad.index];
    }
  }

  public tick(): void {
    //TICK
  }
}
