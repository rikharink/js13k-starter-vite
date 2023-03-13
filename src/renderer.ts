import { Scene } from "./managers/scene-manager";
import { Settings } from "./settings";

export class Renderer {
  public render(ctx: CanvasRenderingContext2D, scene: Scene, _alpha: number) {
    ctx.canvas.style.background = scene.clearColor;
    ctx.clearRect(0, 0, Settings.resolution[0], Settings.resolution[1]);
  }
}
