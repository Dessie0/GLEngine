class SphereCollider extends Collider {
    constructor(object, radius) {
        super(object);
        this.radius = radius;
    }

    attemptCollide(sphereCollider) {
        let distance = Math.pow((this.object.getTransform().getTranslate().getX() - (sphereCollider.localTranslate.getX() + sphereCollider.object.getTransform().getTranslate().getX())), 2) +
            Math.pow((this.object.getTransform().getTranslate().getY() - (sphereCollider.localTranslate.getY() + sphereCollider.object.getTransform().getTranslate().getY())), 2) +
            Math.pow((this.object.getTransform().getTranslate().getZ() - (sphereCollider.localTranslate.getZ() + sphereCollider.object.getTransform().getTranslate().getZ())), 2);

        let selfScaledRadius = this.radius * ((this.object.getTransform().getScale().getX() + this.object.getTransform().getScale().getY() + this.object.getTransform().getScale().getZ()) / 3);
        let otherScaledRadius = sphereCollider.radius * ((sphereCollider.object.getTransform().getScale().getX() + sphereCollider.object.getTransform().getScale().getY() + sphereCollider.object.getTransform().getScale().getZ()) / 3);

        //Return if the spheres are colliding.
        return Math.pow(selfScaledRadius + otherScaledRadius, 2) >= distance;
    }

    //Attempts to collide with a point on the screen.
    attemptCollidePoint(x, y, z) {
        let transform = this.object.transform;

        //Get the average scale of all axis and scale the radius by that much.
        let scaledRadius = this.radius * ((transform.getScale().getX() + transform.getScale().getY() + transform.getScale().getZ()) / 3);

        return Math.pow(scaledRadius, 2) >= Math.pow((x - transform.getTranslate().getX()), 2) +
            Math.pow((y - transform.getTranslate().getY()), 2) +
            Math.pow((z - transform.getTranslate().getZ()), 2);
    }

    getOutlineObject(alpha) {
        return new Sphere(this.radius, this.alpha)
    }
}