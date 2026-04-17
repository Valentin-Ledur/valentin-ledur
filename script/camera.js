import {
    vec3,
    mat4
} from 'https://wgpu-matrix.org/dist/3.x/wgpu-matrix.module.js';

export class Camera {
    constructor(width, height) {
        this.position = [0, 0, 0];
        this.right = [-1, 0, 0];
        this.up = [0, 1, 0];

        this.yaw = 90;
        this.pitch = 0;

        this.fovy = 60;
        this.zNear = 0.1;
        this.zFar = 2000;

        this.width = width;
        this.height = height;
        this.aspectRatio = width / height;

        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();

        this.invDir = [0, 0, 1];

        this.move_forward = false;
        this.move_backward = false;
        this.move_right = false;
        this.move_left = false;

        this.isMouseDown = false

        this.sensitivity = 0.5;
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
        });

        document.addEventListener("keyup", (event) => {
            if (event.key == "z" || event.key == "w")
                this.move_forward = false;
            if (event.key == "s")
                this.move_backward = false;
            if (event.key == "d")
                this.move_right = false;
            if (event.key == "q" || event.key == "a")
                this.move_left = false;
        });

        document.addEventListener("mousedown", (event) => {
            if (event.button === 0) {
                this.isMouseDown = true;
            }
        });

        document.addEventListener("mouseup", (event) => {
            if (event.button === 0) {
                this.isMouseDown = false;
            }
        });

        document.addEventListener("mousemove", (event) => {
            if (this.isMouseDown) {
                this.rotate(event.movementX * this.sensitivity, -event.movementY * this.sensitivity);
            }
        });

        document.addEventListener("mouseleave", () => {
            this.isMouseDown = false;
        });
    }

    setPosition(position) {
        this.position = position;
    }

    setScreenSize(width, height) {
        this.width = width;
        this.height = height;
        this.aspectRatio = width / height;
        this.updateVectors();
        this.computeViewMatrix();
        this.computeProjectionMatrix();
    }

    setFov(fov) {
        this.fovy = fov;
        this.computeProjectionMatrix();
    }

    rotate(yaw, pitch) {
        this.yaw = (this.yaw + yaw) % 360;
        this.pitch = Math.max(-89, Math.min(89, this.pitch + pitch));

        this.updateVectors();
    }

    computeViewMatrix() {
        mat4.lookAt(this.position, vec3.sub(this.position, this.invDir), this.up, this.viewMatrix);
    }

    computeProjectionMatrix() {
        mat4.perspective(this.fovy * (Math.PI / 180), this.aspectRatio, this.zNear, this.zFar, this.projectionMatrix);
    }

    updateVectors() {
        const tmp_yaw = this.yaw * (Math.PI / 180);
        const tmp_pitch = this.pitch * (Math.PI / 180);

        vec3.normalize([
            Math.cos(tmp_yaw) * Math.cos(tmp_pitch),
            Math.sin(tmp_pitch),
            Math.sin(tmp_yaw) * Math.cos(tmp_pitch)
        ], this.invDir);

        vec3.normalize(vec3.cross([0, 1, 0], this.invDir), this.right);
        vec3.normalize(vec3.cross(this.invDir, this.right), this.up);
    }

    getViewMatrix() {
        return mat4.lookAt(this.position, vec3.sub(this.position, this.invDir), this.up);
    }

    move(deltaTime) {
        const reelSpeed = this.speed * deltaTime;

        if (!this.tempMoveDir) this.tempMoveDir = vec3.create();

        if (this.move_forward) {
            vec3.mulScalar(this.invDir, reelSpeed, this.tempMoveDir);
            vec3.sub(this.position, this.tempMoveDir, this.position);
        }
        if (this.move_backward) {
            vec3.mulScalar(this.invDir, reelSpeed, this.tempMoveDir);
            vec3.add(this.position, this.tempMoveDir, this.position);
        }
        if (this.move_right) {
            vec3.mulScalar(this.right, reelSpeed, this.tempMoveDir);
            vec3.add(this.position, this.tempMoveDir, this.position);
        }
        if (this.move_left) {
            vec3.mulScalar(this.right, reelSpeed, this.tempMoveDir);
            vec3.sub(this.position, this.tempMoveDir, this.position);
        }
    }
}