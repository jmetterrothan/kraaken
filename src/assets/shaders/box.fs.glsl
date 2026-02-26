#version 300 es
precision mediump float;

uniform float u_outline_thickness;    // framebuffer pixels
uniform vec4  u_outline_color;
uniform vec4  u_fill_color;   // set alpha < 1 for transparency

in vec2 v_uv;
out vec4 fragColor;

void main() {
  vec2 uv = clamp(v_uv, 0.0, 1.0);

  float dx = min(uv.x, 1.0 - uv.x);
  float dy = min(uv.y, 1.0 - uv.y);

  float fwX = fwidth(uv.x);
  float fwY = fwidth(uv.y);

  float tX  = u_outline_thickness * fwX;
  float tY  = u_outline_thickness * fwY;

  float aaX = 1.5 * fwX;
  float aaY = 1.5 * fwY;

  // Outline masks (anti-aliased)
  float ax = 1.0 - smoothstep(tX - aaX, tX + aaX, dx);
  float ay = 1.0 - smoothstep(tY - aaY, tY + aaY, dy);
  float outlineA = max(ax, ay);

  // Fill mask: inside the rect (excluding outline thickness)
  float innerX = smoothstep(tX, tX + aaX, dx);
  float innerY = smoothstep(tY, tY + aaY, dy);
  float fillA  = innerX * innerY; // 1 in interior, 0 near/outside border

  // If you want to discard pixels that are neither fill nor outline:
  float outA = max(outlineA * u_outline_color.a, fillA * u_fill_color.a);
  if (outA < 0.001) discard;

  // Compose: fill first, outline on top
  vec4 fill    = vec4(u_fill_color.rgb, u_fill_color.a * fillA);
  vec4 outline = vec4(u_outline_color.rgb, u_outline_color.a * outlineA);

  // "Over" operator: outline over fill
  vec3 rgb = mix(fill.rgb, outline.rgb, outline.a);
  float a  = fill.a + outline.a * (1.0 - fill.a);

  fragColor = vec4(rgb, a);
}
