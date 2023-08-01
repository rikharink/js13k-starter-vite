#version 300 es

precision highp float;

in vec2 v_uv;

uniform sampler2D u_buffer;
uniform mat4 u_colorMatrix;
uniform vec4 u_offset;

out vec4 f_color;

void main() {
    f_color = u_colorMatrix * texture(u_buffer, v_uv) + u_offset;
}