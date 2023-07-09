#version 300 es
precision highp float;

in vec3 pos;

uniform mat4 matrix;
uniform mat4 tmatrix;

out vec2 uv;

void main(){
    gl_Position=matrix*vec4(pos,1.);
    uv=(tmatrix*vec4(pos,1.)).xy;
}