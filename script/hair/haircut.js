import * as THREE from 'three';
import { Hair } from './hair.js'

export class Haircut {

    constructor(hairNumber) {
        this.hairNumber = hairNumber;

        this.hairs = [];
    }

    addHaircut(scene) {

        for (let hairID = 0; hairID < this.hairNumber; hairID++) {
            let offsetX = Math.random();
            let offsetZ = Math.random();

            this.hairs.push(new Hair(new THREE.Vector3(offsetX, 0, offsetZ)));

            for (let i = 0; i < 50; i++) {
                this.hairs[hairID].addElement(0.1, 3, 4, 0);
            }
        }

        for (let i = 0; i < this.hairNumber; i++) {
            scene.add(this.hairs[i].makeHair())
        }
    }

}