class Spotlight extends Light {
    constructor(intensity) {
        super(intensity);

        this.collider = new CubeCollider(this, 2, 1, 2)
            .updateLocalScale(new Vector3(1.5, 0, 1.5))
            .updateLocalTranslate(new Vector3(0, -6, 0));
    }

    getLightType() {
        return 2;
    }
    update() {
        super.update();
    }
}