class MoveableGameObject extends GameObject {


    constructor(speed) {
        super();
        this.speed = speed;

        //Determines if the velocityX should be flipped.
        //The camera doesn't require this to be true, but modeled entities do.
        //Some weird artifacting with the rendering matrices probably.
        this.flipX = false;
        this.ignore = false;
    }

    setCollider(collider) {
        this.collider = collider;
    }

    //Should be implemented by the extending class.
    //Will trigger for all objects that collide with this one.
    onCollide(obj) {}

    calculateVelocity() {
        let forwardVector = this.getTransform().getForwardVector();
        return forwardVector.scale(this.speed);
    }

    update() {
        if(this.ignore) return;

        let initialPosition = this.collider.localTranslate;
        let velocity = this.calculateVelocity();

        //Move the next collider to their next position.
        this.collider.updateLocalTranslate(new Vector3(initialPosition.getX() + velocity.getX(), initialPosition.getY() + velocity.getY(), initialPosition.getZ() + velocity.getZ()));

        //Do collision with all other objects
        engine.level.objects.forEach(obj => {
            if(obj === this) return;
            if(obj.collider === null) return;

            if(obj.collider.attemptCollide(this.collider)) {
                velocity = this.onCollide(obj, velocity);
            }
        });

        //Call the super.update(), which updates all children.
        super.update();

        //Update the outline object, and reset the next collider's translation.
        this.collider.updateLocalTranslate(initialPosition);

        if(velocity.getX() === 0 && velocity.getY() === 0 && velocity.getZ() === 0) return;

        //Finally, we update the objects position, if it wasn't cancelled.
        this.setTranslate(this.getTransform().getTranslate().duplicate()
            .addX((this.flipX ? -velocity.getX() : velocity.getX()))
            .addY(velocity.getY())
            .addZ(velocity.getZ()));
    }
}