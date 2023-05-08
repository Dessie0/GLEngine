class DirectionalLight extends Light {


    constructor(intensity) {
        super(intensity);
    }

    getLightType() {
        return 1;
    }

}