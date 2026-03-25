if (!navigator.gpu)
    console.log("WebGPU not supported.");

const adapter = await navigator.gpu.requestAdapter();
if (!adapter) {
    throw Error("Couldn't request WebGPU adapter.");
}

const adapterInfo = adapter.info;
console.log(adapterInfo.vendor);
console.log(adapterInfo.architecture);

let container = document.getElementById('canvas-container');
let p1 = document.createElement("p")
let p2 = document.createElement("p")
p1.innerText = "Fabriquant du GPU: " + adapterInfo.vendor
p2.innerText = "Architecture du GPU: " + adapterInfo.architecture
container.appendChild(p1)
container.appendChild(p2)