#version 300 es

precision mediump float;

in vec2 v_texture_coord;

uniform sampler2D u_image;
uniform vec2 u_size;
uniform bool u_outline;
uniform vec4 u_tint_color;
uniform int u_tint_effect;
uniform bool u_grayscale;

out vec4 fragColor;

vec4 grayscale(vec4 c) {
  float f = dot(c.xyz, vec3(0.299, 0.587, 0.114));
  return vec4(f, f, f, c.a);
}

void main() {
  vec2 px = vec2(1.0, 1.0) / u_size;

  vec4 textureColor = texture(u_image, v_texture_coord);
  vec4 color = textureColor;
  vec4 texel = vec4(u_tint_color.rgb * u_tint_color.a, u_tint_color.a);

  // tint
  if (u_tint_effect == 0) {
    color = textureColor * texel;
  }
  if (u_tint_effect == 1) {
    color.rgb = mix(textureColor.rgb, u_tint_color.rgb * u_tint_color.a, textureColor.a);
    color.a = textureColor.a * texel.a;
  }
  if (u_tint_effect == 2) {
    color = texel;
  }

  // grayscale
  if (u_grayscale) {
    color = grayscale(color);
  }

  // outline
  if (u_outline) {
    float c1 = texture(u_image, v_texture_coord + vec2(0.0, px.y)).a;
    float c2 = texture(u_image, v_texture_coord + vec2(-px.x, 0.0)).a;
    float c3 = texture(u_image, v_texture_coord + vec2(0.0, -px.y)).a;
    float c4 = texture(u_image, v_texture_coord + vec2(px.x, 0.0)).a;

    if (textureColor.a == 0.0 && max(max(c1, c3), max(c2, c4)) == 1.0) {
      color = vec4(1.0, 1.0, 1.0, 1.0);
    }
    // color = vec4(1.0, 1.0, 1.0, 0.0);
  }

  fragColor = color;
}
