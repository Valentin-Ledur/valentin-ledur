import {
    vec3,
    mat4
} from 'https://wgpu-matrix.org/dist/3.x/wgpu-matrix.module.js';

export class Camera {
    constructor(position, front) {
        this.position = position;
        this.front = front;
        this.up = [0, 1, 0];

        this.right = vec3.create();
        this.target = vec3.create();
        this.viewMatrix = mat4.create();

        this.moveDir = vec3.create();

        this.move_forward = false;
        this.move_backward = false;
        this.move_right = false;
        this.move_left = false;

        this.speed = 10;

        this.updateVectors();

    }

    initMovement() {
        document.addEventListener("keydown", (event) => {
            if (event.key == "z" || event.key == "w")
                this.move_forward = true;
            if (event.key == "s")
                this.move_backward = true;
            if (event.key == "d")
                this.move_right = true;
            if (event.key == "q" || event.key == "a")
                this.move_left = true;
        })

        document.addEventListener("keyup", (event) => {
            if (event.key == "z" || event.key == "w")
                this.move_forward = false;
            if (event.key == "s")
                this.move_backward = false;
            if (event.key == "d")
                this.move_right = false;
            if (event.key == "q" || event.key == "a")
                this.move_left = false;
        })

    }

    updateVectors() {
        vec3.cross(this.front, this.up, this.right);
        vec3.normalize(this.right, this.right);
    }

    getViewMatrix() {
        return mat4.lookAt(this.position, vec3.add(this.position, this.front), this.up);
    }

    move(deltaTime) {
        const reelSpeed = this.speed * deltaTime;

        if (this.move_forward) {
            vec3.mulScalar(this.front, reelSpeed, this.moveDir);
            vec3.add(this.position, this.moveDir, this.position);
        }
        if (this.move_backward) {
            vec3.mulScalar(this.front, reelSpeed, this.moveDir);
            vec3.sub(this.position, this.moveDir, this.position);
        }
        if (this.move_right) {
            vec3.mulScalar(this.right, reelSpeed, this.moveDir);
            vec3.add(this.position, this.moveDir, this.position);
        }
        if (this.move_left) {
            vec3.mulScalar(this.right, reelSpeed, this.moveDir);
            vec3.sub(this.position, this.moveDir, this.position);
        }
    }
}