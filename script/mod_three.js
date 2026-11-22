import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { Haircut } from './hair/haircut.js'

const canvas = document.getElementById('canvas-container');

const scene = new THREE.Scene();
const fogColor = 0x111111;
scene.background = new THREE.Color(fogColor);
scene.fog = new THREE.Fog(fogColor, 10, 50);
const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.setAnimationLoop(animate);
canvas.appendChild(renderer.domElement);

const light = new THREE.AmbientLight(0xFFFFFF, 1);
scene.add(light);
const size = 100;
const divisions = 50;
const gridHelper = new THREE.GridHelper(size, divisions);
scene.add(gridHelper);

camera.position.set(0, 5, 15);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 5, 0);
controls.update();

/* -------------------------- test cheveux -------------------------- */

/*
const myHair = new Hair(new THREE.Vector3(0, 0, 0));

for (let i = 0; i < 50; i++) {
    myHair.addElement(0.1, 3, 4, 0);
}

const hair3DObject = myHair.makeHair();
scene.add(hair3DObject);
*/

const h = new Haircut(10);

h.addHaircut(scene);

window.addEventListener('resize', () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
});

function animate() {
    renderer.render(scene, camera);
}
