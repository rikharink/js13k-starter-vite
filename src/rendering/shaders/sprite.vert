#version 300 es
precision mediump float;

layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_uv;
layout(location = 2) in vec3 a_color;

out vec2 v_uv;
out vec3 v_color;

uniform mat4 u_projectionViewMatrix;

void main() {
    gl_Position = u_projectionViewMatrix * vec4(a_position, 0.0f, 1.0f);
    v_uv = a_uv;
    v_color = a_color;
}