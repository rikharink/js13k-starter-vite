#version 300 es
precision highp float;

in vec3 vertexPosition;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

void main(){
    gl_Position=vec4(vertexPosition,1.);
}