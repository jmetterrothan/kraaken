#version 300 es
precision highp float;

uniform vec4 u_color;
uniform vec2 u_tilesize;

in vec2 v_world;
out vec4 fragColor;

void main() {
  // Position within a tile (0..1)
  vec2 cell = fract(v_world / u_tilesize);

  // 1-pixel-ish line in world units is tricky; simplest is a small fraction of the tile
  float w = 0.02; // 2% of tile size (tweak)

  float onLine = (cell.x < w || cell.y < w) ? 1.0 : 0.0;
  fragColor = mix(vec4(0.0), u_color, onLine);
}
