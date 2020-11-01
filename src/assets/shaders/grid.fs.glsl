#version 300 es

precision mediump float;

uniform vec4 u_color;
uniform float u_scale;
uniform vec2 u_tilesize;

out vec4 fragColor;

void main() {
  float offsetX = gl_FragCoord.x;
  float offsetY = gl_FragCoord.y;

  if (int(mod(offsetX, u_tilesize.x * u_scale)) == 0 || int(mod(offsetY, u_tilesize.y * u_scale)) == 0) {
    fragColor = u_color;
  } else {
    fragColor = vec4(0, 0, 0, 0);
  }
}
