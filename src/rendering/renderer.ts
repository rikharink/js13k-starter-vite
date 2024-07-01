import { Camera } from "./camera";

export interface Renderer {
  begin(gl: WebGL2RenderingContext, camera: Camera): void;
  end(gl: WebGL2RenderingContext): void;
}
