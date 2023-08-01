#version 300 es

precision highp float;

in vec2 v_uv;

uniform sampler2D u_buffer;
uniform sampler2D u_noise;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_bend;

out vec4 f_color;

vec2 crt_coords(vec2 uv, float bend) {
    uv -= 0.5f;
    uv *= 2.f;
    uv.x *= 1.f + pow(abs(uv.y) / bend, 2.f);
    uv.y *= 1.f + pow(abs(uv.x) / bend, 2.f);

    uv /= 2.f;
    return uv + .5f;
}

float vignette(vec2 uv, float size, float smoothness, float edgeRounding) {
    uv -= .5f;
    uv *= size;
    float amount = sqrt(pow(abs(uv.x), edgeRounding) + pow(abs(uv.y), edgeRounding));
    amount = 1.f - amount;
    return smoothstep(0.f, smoothness, amount);
}

float scanline(vec2 uv, float lines, float speed) {
    return sin(uv.y * lines + u_time * speed);
}

float random(vec2 uv) {
    return fract(sin(dot(uv, vec2(15.5151f, 42.2561f))) * 12341.14122f * sin(u_time * 0.03f));
}

float noise(vec2 uv) {
    return texture(u_noise, uv).x;
}

void main() {
    vec2 crt_uv = crt_coords(v_uv, u_bend);
    float s1 = scanline(v_uv, 200.f, -10.f);
    float s2 = scanline(v_uv, 20.f, -3.f);
    vec4 col = mix(texture(u_buffer, crt_uv), vec4(s1 + s2), 0.05f) * vignette(v_uv, 1.9f, .6f, 8.f);
    f_color = mix(col, vec4(noise(v_uv * 75.f)), 0.05f);
}