#version 300 es
precision highp float;

in vec4 vertexPosition;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

void main(){
    gl_Position=projectionMatrix*viewMatrix*modelMatrix*vertexPosition;
}