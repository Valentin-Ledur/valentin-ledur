import * as THREE from 'three';

export class Hair {
    constructor(p0) {
        this.elements = [];

        this.p0 = p0;

        this.F0 = {
            t0: new THREE.Vector3(0, 1, 0),
            u0: new THREE.Vector3(1, 0, 0),
            v0: new THREE.Vector3(0, 0, 1)
        };
    }

    addElement(l, k0, k1, k2) {
        this.elements.push({
            l: l,
            q: new THREE.Vector3(k0, k1, k2)
        })
    }

    makeHair() {
        let currentP = this.p0.clone();
        let currentF = {
            t: this.F0.t0.clone(),
            u: this.F0.u0.clone(),
            v: this.F0.v0.clone()
        }

        let points = [];
        points.push(currentP.clone());

        for (const elmt of this.elements) {
            let omega = new THREE.Vector3();

            let T = currentF.t.clone().multiplyScalar(elmt.q.x);
            let U = currentF.u.clone().multiplyScalar(elmt.q.y);
            let V = currentF.v.clone().multiplyScalar(elmt.q.z);

            omega.add(T).add(U).add(V);

            let omegaNormalized = omega.clone().normalize();
            let omegaNorme = omega.length();

            let dotProductT = currentF.t.dot(omegaNormalized);
            let dotProductU = currentF.u.dot(omegaNormalized);
            let dotProductV = currentF.v.dot(omegaNormalized);

            // T

            let part1T = omegaNormalized.clone().multiplyScalar(dotProductT);
            let part2T = currentF.t.clone().sub(part1T).multiplyScalar(Math.cos(omegaNorme * elmt.l));
            let part3T = omegaNormalized.clone().cross(currentF.t).multiplyScalar(Math.sin(omegaNorme * elmt.l));

            let newT = part1T.clone().add(part2T).add(part3T);

            // U

            let part1U = omegaNormalized.clone().multiplyScalar(dotProductU);
            let part2U = currentF.u.clone().sub(part1U).multiplyScalar(Math.cos(omegaNorme * elmt.l));
            let part3U = omegaNormalized.clone().cross(currentF.u).multiplyScalar(Math.sin(omegaNorme * elmt.l));

            let newU = part1U.clone().add(part2U).add(part3U);

            // V

            let part1V = omegaNormalized.clone().multiplyScalar(dotProductV);
            let part2V = currentF.v.clone().sub(part1V).multiplyScalar(Math.cos(omegaNorme * elmt.l));
            let part3V = omegaNormalized.clone().cross(currentF.v).multiplyScalar(Math.sin(omegaNorme * elmt.l));

            let newV = part1V.clone().add(part2V).add(part3V);

            // R

            let tau = omega.dot(currentF.t);
            let tmp = omega.clone().divideScalar(omegaNorme * omegaNorme).multiplyScalar(tau);

            let part1R = currentP.clone().add(tmp.clone().multiplyScalar(elmt.l));
            let part2R = currentF.t.clone().sub(tmp).multiplyScalar(Math.sin(omegaNorme * elmt.l) / omegaNorme);
            let part3R = omegaNormalized.clone().cross(currentF.t).multiplyScalar((1 - Math.cos(omegaNorme * elmt.l)) / omegaNorme);

            let R = part1R.clone().add(part2R).add(part3R);

            points.push(R.clone());

            currentP = R;
            currentF.t = newT;
            currentF.u = newU;
            currentF.v = newV;
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: 0x4a2e15,
            linewidth: 1 
        });

        const hairMesh = new THREE.Line(geometry, material);

        return hairMesh;
    }
}