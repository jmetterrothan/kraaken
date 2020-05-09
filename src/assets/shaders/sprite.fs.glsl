#version 300 es

precision mediump float;

in vec2 v_texture_coord;

uniform float u_alpha;
uniform vec4 u_color;
uniform sampler2D u_image;
uniform bool u_grayscale;
uniform bool u_wireframe;

out vec4 fragColor;

vec4 toGrayscale(vec4 c) {
    float f = dot(c.xyz, vec3(0.299, 0.587, 0.114));
    return vec4(f, f, f, c.w);
}

vec4 color() {
    vec4 c = u_wireframe ? u_color : texture(u_image, v_texture_coord);

    if (u_grayscale) {
        c = toGrayscale(c);
    }
  
    return vec4(c.rgb, u_alpha * c.a);
}

void main() {
    fragColor = color();
}
