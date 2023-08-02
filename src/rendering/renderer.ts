export interface Renderer {
  begin(gl: WebGL2RenderingContext): void;
  end(gl: WebGL2RenderingContext): void;
}
