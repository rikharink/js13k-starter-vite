#version 300 es

in vec4 a_position;
in vec2 a_uv;

out vec2 v_uv;

uniform mat4 u_mvpMatrix;
uniform mat4 u_textureMatrix;

void main() {
    gl_Position = u_mvpMatrix * a_position;
    v_uv = (u_textureMatrix * vec4(a_uv, 0, 1)).xy;
}