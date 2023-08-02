#version 300 es
precision highp float;

in vec2 v_uv;

out vec4 f_color;

uniform sampler2D u_atlas;
uniform vec4 u_blend;

void main() {
  f_color = texture(u_atlas, v_uv) * u_blend;
}