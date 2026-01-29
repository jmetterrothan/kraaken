#version 300 es
in vec2 a_position;

uniform mat3 u_projection;
uniform mat3 u_view;
uniform mat3 u_model;

out vec2 v_world;

void main() {
  vec3 world = u_model * vec3(a_position, 1.0);
  v_world = world.xy;
  gl_Position = vec4(u_projection * u_view * world, 1.0);
}
