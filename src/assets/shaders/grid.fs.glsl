#version 300 es
precision highp float;

uniform vec4 u_color;
uniform vec2 u_tilesize;
uniform bool u_show_selection;
uniform vec4 u_selection_color;
uniform vec2 u_selection_min;
uniform vec2 u_selection_max;

in vec2 v_world;
out vec4 fragColor;

void main() {
  vec2 cell = fract(v_world / u_tilesize);
  vec2 cellIndex = floor(v_world / u_tilesize);

  float gridW = 0.02;
  float gridLine = (cell.x < gridW || cell.y < gridW) ? 1.0 : 0.0; 

  bool inSelection =
  cellIndex.x >= u_selection_min.x &&
  cellIndex.y >= u_selection_min.y &&
  cellIndex.x <= u_selection_max.x &&
  cellIndex.y <= u_selection_max.y;

  float outlineW = 0.03;
  float outline =
    step(cell.x, outlineW) +
    step(cell.y, outlineW) +
    step(1.0 - outlineW, cell.x) +
    step(1.0 - outlineW, cell.y);

  outline = clamp(outline, 0.0, 1.0);

  vec4 base = mix(vec4(0.0), u_color, gridLine);

  if (u_show_selection && inSelection && outline > 0.0) {
    bool leftEdge =
      cellIndex.x == u_selection_min.x && cell.x < outlineW;

    bool rightEdge =
      cellIndex.x == u_selection_max.x && cell.x > 1.0 - outlineW;

    bool topEdge =
      cellIndex.y == u_selection_min.y && cell.y < outlineW;

    bool bottomEdge =
      cellIndex.y == u_selection_max.y && cell.y > 1.0 - outlineW;

    bool selectionOutline = leftEdge || rightEdge || topEdge || bottomEdge;

    fragColor = selectionOutline ? u_selection_color : base;
  } else {
    fragColor = base;
  }
}
