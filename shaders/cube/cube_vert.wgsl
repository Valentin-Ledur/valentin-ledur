struct Uniforms {
    modelViewProjectionMatrix: mat4x4f,
}
@binding(0) @group(0) var<uniform> uniforms: Uniforms;

struct VertexOutput {
    @builtin(position) Position: vec4f,
    @location(0) fragPosition: vec4f,
    @location(1) fragUV: vec2f,
}
@vertex
fn main(
    @location(0) position: vec4f,
    @location(1) uv: vec2f
) -> VertexOutput {
    var output: VertexOutput;
    output.Position = uniforms.modelViewProjectionMatrix * position;
    output.fragUV = uv;
    output.fragPosition = 0.5 * (position + vec4(1.0, 1.0, 1.0, 1.0));
    return output;
}