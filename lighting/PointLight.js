class PointLight extends Light {
    constructor(intensity) {
        super(intensity);

        //The bigger the attenuation values, the more drop-off the light has.
        this.constantAttenuation = 0.1;
        this.linearAttenuation = 1;
        this.quadraticAttenuation = 1;
    }

    setConstantAttenuation(attenuation) {
        this.constantAttenuation = attenuation;
        return this;
    }

    setLinearAttenuation(attenuation) {
        this.linearAttenuation = attenuation;
        return this;
    }

    setQuadraticAttenuation(attenuation) {
        this.quadraticAttenuation = attenuation;
        return this;
    }

    getLightType() {
        return 0;
    }

    getData() {
        return new Vector3(this.constantAttenuation, this.linearAttenuation, this.quadraticAttenuation);
    }
}