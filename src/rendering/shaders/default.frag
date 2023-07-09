#version 300 es
precision highp float;

in vec2 uv;

uniform sampler2D t;
uniform vec4 color;

out highp vec4 c;

void main(void){
  c=texture(t,uv)*color;
}