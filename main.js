async function initWebGPU() {
    const canvas = document.getElementById("canvas-container");
    if (!navigator.gpu) throw new Error("WebGPU non supporté!");

    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();
    const context = canvas.getContext("webgpu");

    //Configuration du canvas pour WabGPU
    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({ device: device, format: format, });

    //Chargement des shaders
    const vertex = await fetch("shaders/vertex.wgsl");
    const fragment = await fetch("shaders/fragment.wgsl");
    const vertexCode = await vertex.text();
    const fragmentCode = await fragment.text();

    //Compilation des shaders
    const vertexShaderModule = device.createShaderModule({ label: "Vertex shader", code: vertexCode, });
    const fragmentShaderModule = device.createShaderModule({ label: "Fragment shader", code: fragmentCode, });

    //Positions et couleurs
    // X, Y, R, G, B
    const vertices = new Float32Array([
        0.0, 0.5, 1.0, 0.0, 0.0, // Sommet 0 : Haut (Rouge)
        -0.5, -0.5, 0.0, 1.0, 0.0, // Sommet 1 : Bas Gauche (Vert)
        0.5, -0.5, 0.0, 0.0, 1.0 // Sommet 2 : Bas Droite (Bleu)
    ]);

    //Création du buffer¨
    const vertexBuffer = device.createBuffer({
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(vertexBuffer, 0, vertices);

    const vertexBuffersLayout = [{
        // Nombre d'octet de chaque partie
        arrayStride: 5 * 4,
        attributes: [
            {
                format: "float32x2", // 2 float pour la position X et Y
                offset: 0, // Commence au début
                shaderLocation: 0 //location(0) ici la position
            },
            {
                format: "float32x3", // 2 float pour la position X et Y
                offset: 2 * 4, // Commence au début
                shaderLocation: 1 //location(0) ici la position
            }
        ]
    }];

    //Pipeline: comment lier les shaders
    const pipeline = device.createRenderPipeline({
        label: "triangle",
        layout: "auto", //Gestion de la mémoire, ici, automatique
        vertex: {
            module: vertexShaderModule,
            entryPoint: "vs_main", //Nom de la fonction dans le vertex
            buffers: vertexBuffersLayout
        },
        fragment: {
            module: fragmentShaderModule,
            entryPoint: "fs_main", //Nom de la fonction dans le framgent
            targets: [{ format: format }] //Format de couleur de sortie
        }
    });

    //Boucle de rendu
    function draw() {
        const commandEncoder = device.createCommandEncoder();

        const renderPassDescriptor = {
            colorAttachments: [
                {
                    view: context.getCurrentTexture().createView(), //Image actuel du canvas
                    clearValue: { r: 0.1, g: 0.1, b: 0.2, a: 1.0 }, //Couleur de fond
                    loadOp: "clear", //On efface l'image précédente
                    storeOp: "store", //On garde le resultat pour l'afficher
                },
            ],
        };

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

        passEncoder.setPipeline(pipeline);
        //Ajout du vertex buffer a l'emplacement 0
        passEncoder.setVertexBuffer(0, vertexBuffer);
        passEncoder.draw(3); //draw(nombre de point)

        passEncoder.end();
        device.queue.submit([commandEncoder.finish()]);
        requestAnimationFrame(draw);
    }

    draw();

}

initWebGPU();