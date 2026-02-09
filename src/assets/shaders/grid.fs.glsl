#version 300 es
precision highp float;

uniform vec4 u_color;
uniform vec4 u_active_cell_color;
uniform vec2 u_tilesize;
uniform vec2 u_active_cell;

in vec2 v_world;
out vec4 fragColor;

void main() {
  vec2 cell = fract(v_world / u_tilesize);
  vec2 cellIndex = floor(v_world / u_tilesize);

  float gridW = 0.02;
  float gridLine = (cell.x < gridW || cell.y < gridW) ? 1.0 : 0.0;

  bool isHovered =
    cellIndex.x == u_active_cell.x &&
    cellIndex.y == u_active_cell.y;

  float outlineW = 0.03;
  float outline =
    step(cell.x, outlineW) +
    step(cell.y, outlineW) +
    step(1.0 - outlineW, cell.x) +
    step(1.0 - outlineW, cell.y);

  outline = clamp(outline, 0.0, 1.0);

  vec4 base = mix(vec4(0.0), u_color, gridLine);

  if (isHovered && outline > 0.0) {
    fragColor = u_active_cell_color; // blue outline
  } else {
    fragColor = base;
  }
}
