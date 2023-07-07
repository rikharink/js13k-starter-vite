#version 300 es

precision highp float;

in vec2 uv;

uniform sampler2D t;
out vec4 c;

void main() {
    vec4 s = texture(t, uv);
    c = s;
}