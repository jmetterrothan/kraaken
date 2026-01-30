#version 300 es

precision mediump float;

in vec2 v_texture_coord;

uniform sampler2D u_image;
uniform vec2 u_size;
uniform bool u_outline;
uniform vec4 u_outline_color;
uniform vec4 u_tint_color;
uniform int u_tint_effect; 
uniform bool u_grayscale;
uniform float u_alpha;

out vec4 fragColor;

vec4 grayscale(vec4 c) {
  float f = dot(c.xyz, vec3(0.299, 0.587, 0.114));
  return vec4(f, f, f, c.a);
}
void main() {
  vec2 px = vec2(1.0, 1.0) / u_size;

  vec4 textureColor = texture(u_image, v_texture_coord);

  // IMPORTANT: convert the sampled texture to premultiplied immediately
  textureColor.rgb *= textureColor.a;

  vec4 color = textureColor;

  // premultiplied tint + outline colors
  vec4 tintPM    = vec4(u_tint_color.rgb * u_tint_color.a, u_tint_color.a);
  vec4 outlinePM = vec4(u_outline_color.rgb * u_outline_color.a, u_outline_color.a);

  // tint
  if (u_tint_effect == 0) {
    // multiply (premultiplied-safe)
    color = textureColor * tintPM;
  }
  else if (u_tint_effect == 1) {
    // do the mix in *straight* space, then re-premultiply
    float a = textureColor.a;
    vec3 baseStraight = (a > 0.0) ? (textureColor.rgb / a) : vec3(0.0);

    vec3 outStraight = mix(baseStraight, u_tint_color.rgb, a);
    float outA = a * u_tint_color.a;

    color = vec4(outStraight * outA, outA); // premultiplied output
  }
  else if (u_tint_effect == 2) {
    // solid tint masked by texture alpha (premultiplied)
    float outA = textureColor.a * u_tint_color.a;
    color = vec4(u_tint_color.rgb * outA, outA);
  }

  // grayscale (works fine on premultiplied)
  if (u_grayscale) {
    float f = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    // keep premultiplied relationship: grayscale on rgb only
    color.rgb = vec3(f);
  }

  // outline
  if (u_outline) {
    float c1 = texture(u_image, v_texture_coord + vec2(0.0, px.y)).a;
    float c2 = texture(u_image, v_texture_coord + vec2(-px.x, 0.0)).a;
    float c3 = texture(u_image, v_texture_coord + vec2(0.0, -px.y)).a;
    float c4 = texture(u_image, v_texture_coord + vec2(px.x, 0.0)).a;

    if (textureColor.a == 0.0 && max(max(c1, c3), max(c2, c4)) == 1.0) {
      color = outlinePM;
    }
  }

  // global alpha for premultiplied blending: scale EVERYTHING
  color *= u_alpha;

  fragColor = color;
}
