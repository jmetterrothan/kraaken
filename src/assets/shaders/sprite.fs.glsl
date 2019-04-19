#version 300 es

precision mediump float;

in vec2 v_texture_coord;

uniform sampler2D u_image;
uniform vec3 u_color;
uniform int u_wireframe;

out vec4 fragColor;

void main() {
    fragColor = u_wireframe == 1 ? vec4(u_color, 1) : texture(u_image, v_texture_coord);
}
