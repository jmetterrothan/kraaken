#version 300 es

precision mediump float;

uniform sampler2D uTex;

in vec2 vUV;

out vec4 outColor;

void main() {
  vec2 uv = vec2(vUV.x, 1.0 - vUV.y);
  outColor = texture(uTex, uv);
}
