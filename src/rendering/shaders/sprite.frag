#version 300 es 
precision mediump float;

in vec2 v_uv;
in vec3 v_color;

uniform sampler2D u_texture;

out vec4 f_color;

void main() {
    f_color = texture(u_texture, v_uv) * vec4(v_color, 1.0f);
}