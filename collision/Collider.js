class Collider {
    constructor(object) {
        this.oncollide = () => {};
        this.onclick = (event) => {};

        this.object = object;
        this.outline = null;

        //Local scale and translate are ADDED to the current scale and translate
        this.localScale = new Vector3(0, 0, 0);
        this.localTranslate = new Vector3(0, 0, 0);
    }

    attemptCollide(collider) {}
    attemptCollidePoint(x, y, z) {}

    getOutlineObject(alpha) {}

    updateLocalScale(vec) {
        this.localScale = vec;
        return this;
    }

    updateLocalTranslate(vec) {
        this.localTranslate = vec;
        return this;
    }

    toggleOutline(alpha) {
        if(this.outline === null) {
            this.outline = this.getOutlineObject(alpha);
            this.object.addChild(this.outline);
        } else {
            this.object.removeChild(this.outline.id);
            this.outline = null;
        }
    }
}