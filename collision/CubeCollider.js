class CubeCollider extends Collider {

    constructor(object, width, height, depth) {
        super(object);

        this.width = width;
        this.height = height;
        this.depth = depth;
    }

    attemptCollide(cubeCollider) {
        let bounds = this.calculateBounds(this.object, this.object.collider);
        let objBounds = this.calculateBounds(cubeCollider.object, cubeCollider);

        return (bounds[0] <= objBounds[3] && bounds[3] >= objBounds[0]) &&
            (bounds[1] <= objBounds[4] && bounds[4] >= objBounds[1]) &&
            (bounds[2] <= objBounds[5] && bounds[5] >= objBounds[2])
    }

    attemptCollidePoint(x, y, z) {
        let bounds = this.calculateBounds(this.object, this.object.collider);
        return (x >= bounds[0] && x <= bounds[3]) &&
            (y >= bounds[1] && y <= bounds[4]) &&
            (z >= bounds[2] && z <= bounds[5]);
    }

    calculateBounds(object, collider) {
        let transform = object.transform;

        let x_min = ((transform.getTranslate().getX() + collider.localTranslate.getX()) - (collider.width / 2) * (collider.localScale.getX() === 0 ? 1 : collider.localScale.getX()));
        let y_min = ((transform.getTranslate().getY() + collider.localTranslate.getY()) - (collider.height / 2) * (collider.localScale.getY() === 0 ? 1 : collider.localScale.getY()));
        let z_min = ((transform.getTranslate().getZ() + collider.localTranslate.getZ()) - (collider.depth / 2) * (collider.localScale.getZ() === 0 ? 1 : collider.localScale.getZ()));

        let x_max = ((transform.getTranslate().getX() + collider.localTranslate.getX()) + (collider.width / 2) * (collider.localScale.getX() === 0 ? 1 : collider.localScale.getX()));
        let y_max = ((transform.getTranslate().getY() + collider.localTranslate.getY()) + (collider.height / 2) * (collider.localScale.getY() === 0 ? 1 : collider.localScale.getY()));
        let z_max = ((transform.getTranslate().getZ() + collider.localTranslate.getZ()) + (collider.depth / 2) * (collider.localScale.getZ() === 0 ? 1 : collider.localScale.getZ()));

        return [x_min, y_min, z_min, x_max, y_max, z_max];
    }

    getWallNormal(vertices, enemyPosition) {
        // Find the two vertices closest to the enemy
        let closestVertices = [];
        let closestDistances = [Number.MAX_VALUE, Number.MAX_VALUE];
        vertices.forEach(vertex => {
            let distance = enemyPosition.distanceTo(vertex);
            if (distance < closestDistances[0]) {
                closestDistances[1] = closestDistances[0];
                closestVertices[1] = closestVertices[0];
                closestDistances[0] = distance;
                closestVertices[0] = vertex;
            } else if (distance < closestDistances[1]) {
                closestDistances[1] = distance;
                closestVertices[1] = vertex;
            }
        });

        // Calculate the normal using the cross product of the two vectors
        let vec1 = closestVertices[0].clone().sub(enemyPosition);
        let vec2 = closestVertices[1].clone().sub(enemyPosition);
        return vec1.clone().cross(vec2).normalize();
    }


    findCollisionNormal(velocity) {
        let normals = [
            new Vector3(1, 0, 0),
            new Vector3(-1, 0, 0),
            new Vector3(0, 1, 0),
            new Vector3(0, -1, 0),
            new Vector3(0, 0, 1),
            new Vector3(0, 0, -1),
        ];

        let maxDot = 0;
        let collidedWith;
        normals.forEach(normal => {
            let dot = velocity.dot(normal);
            if(dot < maxDot) {
                maxDot = dot;
                collidedWith = normal;
            }
        });

        return collidedWith;
    }

    getOutlineObject(alpha) {
        return new Cube(this.width, this.height, this.depth)
            .setColor(255, 0, 255, alpha)
            .toggleFixedRotation();
    }
}