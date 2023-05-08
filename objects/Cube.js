class Cube extends GameObject {

    constructor(width, height, depth) {
        super();
        this.setScale(new Vector3(width, height, depth));
    }

    setColor(red, green, blue, alpha) {
        this.setModelWithColors('resources/models/cube.obj',
            {
                'cube': [red, green, blue, alpha]
            });
        return this;
    }

    setTexture(texturepath) {
        super.setTexture(texturepath);
        this.setModel('resources/models/cube.obj');

        return this;
    }
}