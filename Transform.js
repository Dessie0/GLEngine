class Transform {
    constructor() {
        this.translate = new Vector3(0, 0, 0);
        this.rotate = new Vector3(0, 0, 0);
        this.scale = new Vector3(1, 1, 1);
    }

    getTranslate() {
        return this.translate;
    }

    getRotation() {
        return this.rotate;
    }

    getScale() {
        return this.scale;
    }

    setTranslate(vec) {
        this.translate = vec;
        return this;
    }

    setRotation(vec) {
        this.rotate = vec;
    }

    setScale(vec) {
        this.scale = vec;
    }

    getForwardVector() {
        let matrix = VectorUtils.rotationVectorTo3x3Matrix(this.rotate);
        return VectorUtils.multiplyVectorByMatrix(new Vector3(0, 0, 1), matrix);
    }

    getUpVector() {
        let matrix = VectorUtils.rotationVectorTo3x3Matrix(this.rotate);
        return VectorUtils.multiplyVectorByMatrix(new Vector3(0, 1, 0), matrix);
    }

    getRightVector() {
        let matrix = VectorUtils.rotationVectorTo3x3Matrix(this.rotate);
        return VectorUtils.multiplyVectorByMatrix(new Vector3(1, 0, 0), matrix);
    }

}