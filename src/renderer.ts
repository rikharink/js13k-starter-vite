import { TAU } from './math/const';
import { Settings } from './settings';
import { State } from './state';

export class Renderer {
  public render(ctx: CanvasRenderingContext2D, state: State, _alpha: number): void {
    ctx.canvas.style.background = state.clearColor;
    ctx.clearRect(0, 0, Settings.resolution[0], Settings.resolution[1]);

    const [mx, my] = state.pointer;
    ctx.strokeStyle = 'hotpink';
    ctx.beginPath();
    ctx.arc(mx, my, 10, 0, TAU);
    ctx.stroke();
  }
}
