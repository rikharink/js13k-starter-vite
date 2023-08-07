#version 300 es
#define PI 3.14159265

precision highp float;

in vec2 v_uv;

uniform sampler2D u_buffer;
uniform sampler2D u_noise;
uniform float u_time;
uniform float u_bend;

vec3 tex2D(sampler2D _tex, vec2 _p) {
    vec3 col = texture(_tex, _p).xyz;
    if(0.5f < abs(_p.x - 0.5f)) {
        col = vec3(0.1f);
    }
    return col;
}

float noise(vec2 p) {
    return texture(u_noise, p).x;
}

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

out vec4 f_color;

void main() {
    vec2 uv = crt_coords(v_uv, u_bend);
    vec2 uvn = uv;
    vec3 col = vec3(0.0f);

    uvn.x += (noise(vec2(uvn.y, u_time)) - 0.5f) * 0.005f;
    uvn.x += (noise(vec2(uvn.y * 100.0f, u_time * 10.0f)) - 0.5f) * 0.01f;

    float tcPhase = clamp((sin(uvn.y * 8.0f - u_time * PI * 1.2f) - 0.92f) * noise(vec2(u_time)), 0.0f, 0.01f) * 10.0f;
    float tcNoise = max(noise(vec2(uvn.y * 100.0f, u_time * 10.0f)) - 0.5f, 0.0f);
    uvn.x = uvn.x - tcNoise * tcPhase;

    col = tex2D(u_buffer, uvn);
    col *= 1.0f - tcPhase;

    for(float x = -4.0f; x < 2.5f; x += 1.0f) {
        col.xyz += vec3(tex2D(u_buffer, uvn + vec2(x - 0.0f, 0.0f) * 7E-3f).x, tex2D(u_buffer, uvn + vec2(x - 2.0f, 0.0f) * 7E-3f).y, tex2D(u_buffer, uvn + vec2(x - 4.0f, 0.0f) * 7E-3f).z) * 0.1f;
    }
    col *= 0.6f;

    col *= 1.0f + clamp(noise(vec2(0.0f, uv.y + u_time * 0.2f)) * 0.6f - 0.25f, 0.0f, 0.1f);

    col *= vignette(v_uv, 1.9f, .6f, 8.f);
    f_color = vec4(col, 1);
    //f_color = vec4(vec3(noise(uv)), 1.f);
}
