#version 300 es

in vec2 a_position;
in vec2 a_texture_coord;

uniform mat3 u_world;
uniform mat3 u_view;
uniform mat3 u_object;
uniform vec2 u_frame;

out vec2 v_texture_coord;

void main() {
    gl_Position = vec4(u_world * u_view * u_object * vec3(a_position, 1.0), 1.0);
    v_texture_coord = a_texture_coord + u_frame;
}
