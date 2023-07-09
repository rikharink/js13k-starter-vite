#version 300 es

precision highp float;

in vec2 uv;

uniform sampler2D t;
uniform vec4 cf;
uniform bool inv;
out vec4 c;

vec4 invert(vec4 i) {
    return vec4(1) - i;
}

void main() {
    vec4 s = texture(t, uv) * cf;
    if(inv) {
        s = invert(s);
    }
    s.a = 1.;
    c = s;
}