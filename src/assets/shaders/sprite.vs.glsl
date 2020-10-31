#version 300 es

in vec2 a_position;
in vec2 a_texture_coord;

uniform mat3 u_projection;
uniform mat3 u_view;
uniform mat3 u_model;

uniform vec2 u_frame;

out vec2 v_texture_coord;

void main() {
  gl_Position = vec4(u_projection * u_view * u_model * vec3(a_position, 1.0), 1.0);
  v_texture_coord = a_texture_coord + u_frame;
}
