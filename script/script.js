import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.getElementById('canvas-container');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.setAnimationLoop(animate);
canvas.appendChild(renderer.domElement);

const light = new THREE.AmbientLight(0xFFFFFF);
scene.add(light);
const size = 100;
const divisions = 50;
const gridHelper = new THREE.GridHelper(size, divisions);
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

camera.position.set(0, 5, 15);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 5, 0);
controls.update();

const loader = new GLTFLoader();
const gltf = await loader.loadAsync('models/Untitled.glb');
scene.add(gltf.scene);

function animate() {
    renderer.render(scene, camera);
}
