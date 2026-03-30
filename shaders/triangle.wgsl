// Vertex: appelé une fois par sommet

@vertex
fn vs_main(@builtin(vertex_index) in_vertex_index: u32) -> @builtin(position) vec4<f32>{
    var pos = array<vec2<f32>, 3>(
        vec2<f32>(0.0, 0.5),
        vec2<f32>(-0.5, -0.5),
        vec2<f32>(0.0, -0.5)
    );

    let p = pos[in_vertex_index];

    return vec4<f32>(p.x, p.y, 0, 1.0);
}

//Fragment: appelé sur chaque pixels du triangle
@fragment
fn fs_main() -> @location(0) vec4<f32> {
    return vec4<f32>(0.0, 1.0, 1.0, 1.0);
}