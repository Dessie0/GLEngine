class BaseCamera extends MoveableGameObject {

    constructor(speed, fov) {
        super(speed);

        //A collider of 2.1 should prevent the camera from clipping into Cubes.
        this.setCollider(new CubeCollider(this, 2.1,2.1, 2.1));
        this.fov = fov;

        this.movingForward = false;
        this.movingBackward = false;
        this.movingUpward = false;
        this.movingDownward = false;

        this.attachKeyListener('A', () => {
            this.setRotation(this.getTransform().getRotation().duplicate().addY(-0.02));
        }, () => {});

        this.attachKeyListener('D', () => {
            this.setRotation(this.getTransform().getRotation().duplicate().addY(0.02));
        }, () => {});

        this.attachKeyListener('W', () => {
            this.movingForward = true;
        }, () => {
            this.movingForward = false;
        });

        this.attachKeyListener('S', () => {
            this.movingBackward = true;
        }, () => {
            this.movingBackward = false;
        });

        this.attachKeyListener('Z', () => {
            this.movingUpward = true;
        }, () => {
            this.movingUpward = false;
        });

        this.attachKeyListener('X', () => {
            this.movingDownward = true;
        }, () => {
            this.movingDownward = false;
        });

        this.shouldRender = true;
    }

    calculateVelocity() {
        let forwardVector = this.getTransform().getForwardVector();
        let upVector = this.getTransform().getUpVector();

        return new Vector3(
            (this.movingForward ? this.movingBackward ? 0 : this.speed : this.movingBackward ? -this.speed : 0) * forwardVector.getX(),
            (this.movingUpward ? this.movingDownward ? 0 : this.speed : this.movingDownward ? -this.speed : 0) * upVector.getY(),
            (this.movingForward ? this.movingBackward ? 0 : this.speed : this.movingBackward ? -this.speed : 0) * forwardVector.getZ());
    }

    update() {
        super.update();
    }

    render(program) {
        gl.uniform1f(gl.getUniformLocation(program, 'fov'), this.fov * (Math.PI / 180));
        gl.uniform3fv(gl.getUniformLocation(program,'cameraLoc'), new Float32Array(this.getTransform().getTranslate().toArray()));
        gl.uniform3fv(gl.getUniformLocation(program,'cameraRotation'), new Float32Array(this.getTransform().getRotation().toArray()));
    }
}
