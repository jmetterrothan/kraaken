#version 300 es

in vec2 a_position;

uniform mat3 u_projection;
uniform mat3 u_view;
uniform mat3 u_model;

void main() {
  gl_Position = vec4(u_projection * u_view * u_model * vec3(a_position, 1.0), 1.0);
}
