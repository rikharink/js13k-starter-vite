import { Shader } from "../shader";
import { Mesh } from "./mesh"

export class Triangle extends Mesh {
    public constructor(gl: WebGL2RenderingContext, material: Shader) {
        super(gl, new Float32Array([-0.5, 0.5, 0.0, -0.5, -0.5, 0.0, 0.5, -0.5, 0.0]), new Uint16Array([0, 1, 2]), material);
    }

}