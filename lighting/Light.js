class Light extends GameObject {
    constructor(intensity) {
        super();
        this.color = new Vector3(1, 1, 1);
        this.intensity = intensity;
    }

    getData() {
        return new Vector3(0,0, 0);
    }

    setColor(vec) {
        this.color = vec;
        return this;
    }

    getColor() {
        return this.color;
    }

    getIntensity() {
        return this.intensity;
    }

    getLightType() {
        throw new Error("Should be implemented.");
    }
}