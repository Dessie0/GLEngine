class Level {

    constructor(ambientLight) {
        this.objects = [];
        this.ambientLight = ambientLight;
    }

    createObject(object) {
        this.objects.push(object);
        return object;
    }

    destroyObject(id) {
        this.objects = this.objects.filter(obj => obj.id !== id);
    }

    getLights() {
        return this.objects.filter(obj => obj instanceof Light);
    }

    getAmbientLight() {
        return this.ambientLight;
    }

    setAmbientLight(ambientLight) {
        this.ambientLight = ambientLight;
        return this;
    }

    renderLighting(program) {
        let lightTypes = [];
        let lightPositions = [];
        let lightColors = [];
        let lightIntensities = [];
        let lightData = [];
        let numLights = 0.0;

        this.getLights().forEach(light => {
            lightTypes.push(light.getLightType());
            lightPositions.push(light.getTransform().getTranslate().getX(), light.getTransform().getTranslate().getY(), light.getTransform().getTranslate().getZ());
            lightColors.push(light.getColor().getX(), light.getColor().getY(), light.getColor().getZ());
            lightIntensities.push(light.getIntensity());
            lightData.push(light.getData().getX(), light.getData().getY(), light.getData().getZ());

            numLights = Math.min(++numLights, 64);
        });

        if(numLights > 0) {
            gl.uniform3fv(gl.getUniformLocation(program, "u_lightPosition"), lightPositions);
            gl.uniform3fv(gl.getUniformLocation(program, "u_lightColor"), lightColors);
            gl.uniform3fv(gl.getUniformLocation(program, "u_lightData"), lightData);

            gl.uniform1fv(gl.getUniformLocation(program, "u_lightIntensity"), lightIntensities);
            gl.uniform1fv(gl.getUniformLocation(program, "u_lightType"), lightTypes);
            gl.uniform1i(gl.getUniformLocation(program, "u_activeLights"), numLights);
        }

        gl.uniform3fv(gl.getUniformLocation(program, "u_ambientColor"), this.getAmbientLight().getColor().toArray());
        gl.uniform1f(gl.getUniformLocation(program, "u_ambientIntensity"), this.getAmbientLight().getIntensity());
    }
}