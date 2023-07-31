#version 300 es
precision highp float;

in vec2 v_texcoord;

out vec4 outputColor;

uniform sampler2D u_atlas;
uniform vec4 u_blend;

void main() {
  outputColor = texture(u_atlas, v_texcoord) * u_blend;
}