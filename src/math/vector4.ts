export type Vector4 = [number, number, number, number];
export function add(out: Vector4, a: Vector4, b: Vector4): Vector4 {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    return out;
  }