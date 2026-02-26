#version 300 es
in vec2 a_position;

uniform mat3 u_projection;
uniform mat3 u_view;
uniform mat3 u_model;

uniform vec2 u_size;   // (width, height) in the same space as a_position

out vec2 v_uv;

void main() {
  v_uv = a_position / u_size;

  gl_Position = vec4(u_projection * u_view * u_model * vec3(a_position, 1.0), 1.0);
}
