#version 300 es

precision highp float;

in vec2 v_uv;

uniform sampler2D u_buffer;
uniform mat4 u_colorMatrix;
uniform vec4 u_colorFilter;
uniform vec4 u_offset;
uniform vec2 u_time;

out vec4 f_color;

void main() {
    vec4 col = texture(u_buffer, v_uv) * u_colorFilter;
    f_color = u_colorMatrix * col + u_offset;
}