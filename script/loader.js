import {
    mat4,
} from 'https://wgpu-matrix.org/dist/3.x/wgpu-matrix.module.js';

import { parseObjFile } from "./utils/objParser.js";

const objInput = document.getElementById("obj");
const textureInput = document.getElementById("texture");
const button = document.getElementById("start-renderer");

button.addEventListener("click", async (event) => {
    const obj = objInput.files[0];
    const texture = textureInput.files[0];
    if (!obj || !texture) return;

    button.disabled = true;
    button.innerText = "Chargement en cours...";
    try {
        await init(await obj.text(), texture);
    } catch (error) {
        console.log("C'est la merde !");
    }
});

async function init(objText, textureFile) {
    // Code de base
    if (!navigator.gpu) throw new Error("WebGPU non supporté!");
    const canvas = document.getElementById("canvas-container");

    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();
    const context = canvas.getContext("webgpu");

    //Configuration du canvas pour WabGPU
    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({ device: device, format: format, })

    const devicePixelRatio = window.devicePixelRatio;
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

    //Chargement des shaders
    const cubeVertexShaders = await fetch("shaders/cube/vert.wgsl");
    const cubeVertexShadersCode = await cubeVertexShaders.text();

    const cubeFragmentShaders = await fetch("shaders/cube/frag.wgsl");
    const cubeFragmentShadersCode = await cubeFragmentShaders.text();

    const obj = parseObjFile(objText);

    const buffer = []

    for (const face of obj.faces) {
        for (const faceVertex of face.vertices) {
            const position = obj.vertices[faceVertex.vertexIndex];

            const normal = faceVertex.normalIndex !== undefined
                ? obj.normals[faceVertex.normalIndex]
                : [0.0, 1.0, 0.0];

            const uv = faceVertex.uvIndex !== undefined
                ? obj.uvs[faceVertex.uvIndex]
                : [0.0, 0.0];
            buffer.push(position[0], position[1], position[2], normal[0], normal[1], normal[2], uv[0], uv[1]);
        }
    }

    const vertexData = new Float32Array(buffer);

    const verticesBuffer = device.createBuffer({
        size: vertexData.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
    });

    new Float32Array(verticesBuffer.getMappedRange()).set(vertexData);
    verticesBuffer.unmap();

    const pipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: {
            module: device.createShaderModule({
                code: cubeVertexShadersCode,
            }),
            buffers: [
                {
                    attributes: [
                        {
                            // Position
                            shaderLocation: 0,
                            offset: 0,
                            format: "float32x3",
                        },
                        {
                            // Normal
                            shaderLocation: 1,
                            offset: 12,
                            format: "float32x3",
                        },
                        {
                            // UV
                            shaderLocation: 2,
                            offset: 24,
                            format: "float32x2",
                        },
                    ],
                    arrayStride: (3 + 3 + 2) * 4,
                    stepMode: "vertex",
                },
            ],
        },
        fragment: {
            module: device.createShaderModule({
                code: cubeFragmentShadersCode,
            }),
            targets: [
                {
                    format: presentationFormat,
                },
            ],
        },
        primitive: {
            topology: "triangle-list",
            cullMode: "none",
        },
        depthStencil: {
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth24plus',
        }
    });


    const depthTexture = device.createTexture({
        size: [canvas.width, canvas.height],
        format: 'depth24plus',
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    const uniformBufferSize = 4 * 16; // 4x4 matrix
    const uniformBuffer = device.createBuffer({
        size: uniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Fetch the image and upload it into a GPUTexture.
    let objTexture;
    {
        const imageBitmap = await createImageBitmap(textureFile, { imageOrientation: 'flipY' });

        objTexture = device.createTexture({
            size: [imageBitmap.width, imageBitmap.height, 1],
            format: 'rgba8unorm',
            usage:
                GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT,
        });
        device.queue.copyExternalImageToTexture(
            { source: imageBitmap },
            { texture: objTexture },
            [imageBitmap.width, imageBitmap.height]
        );
    }

    // Create a sampler with linear filtering for smooth interpolation.
    const sampler = device.createSampler({
        magFilter: 'linear',
        minFilter: 'linear',
    });

    const uniformBindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: uniformBuffer } },
            { binding: 1, resource: sampler },
            { binding: 2, resource: objTexture.createView() },
        ],
    });

    const renderPassDescriptor = {
        colorAttachments: [
            {
                view: undefined, // Assigned later

                clearValue: { r: 0.1, g: 0.1, b: 0.2, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store',
            },
        ],
        depthStencilAttachment: {
            view: depthTexture.createView(),

            depthClearValue: 1.0,
            depthLoadOp: 'clear',
            depthStoreOp: 'store',
        },
    };

    const aspect = canvas.width / canvas.height;
    const projectionMatrix = mat4.perspective((2 * Math.PI) / 5, aspect, 1, 100.0);
    const modelViewProjectionMatrix = mat4.create()

    function getTransformationMatrix() {
        const viewMatrix = mat4.identity();
        mat4.translate(viewMatrix, [0, -5, -9], viewMatrix);
        const now = Date.now() / 1000;
        mat4.rotate(viewMatrix, [0, 1, 0], now, viewMatrix);

        mat4.multiply(projectionMatrix, viewMatrix, modelViewProjectionMatrix);

        return modelViewProjectionMatrix;
    }

    function frame() {
        const transformationMatrix = getTransformationMatrix();
        device.queue.writeBuffer(
            uniformBuffer,
            0,
            transformationMatrix.buffer,
            transformationMatrix.byteOffset,
            transformationMatrix.byteLength
        );
        renderPassDescriptor.colorAttachments[0].view = context
            .getCurrentTexture()
            .createView();

        const commandEncoder = device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(pipeline);
        passEncoder.setBindGroup(0, uniformBindGroup);
        passEncoder.setVertexBuffer(0, verticesBuffer);
        passEncoder.draw(buffer.length / 8);
        passEncoder.end();
        device.queue.submit([commandEncoder.finish()]);

        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame)
}