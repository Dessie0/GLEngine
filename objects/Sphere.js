class Sphere extends GameObject {
    constructor(radius, alpha) {
        super();

        this.alpha = alpha;
        this.vertices = [];
        this.indices = [];

        this.calculateVertices(radius, 20, 30);
        this.updateVertices();

        //Create the indices buffer as well.
        this.vertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
    }

    //Thank you ChatGPT for this lovely method
    calculateVertices(radius, longitudeBands, latitudeBands) {
        for (let lat = 0; lat <= latitudeBands; lat++) {
            const theta = lat * Math.PI / latitudeBands;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let long = 0; long <= longitudeBands; long++) {
                const phi = long * 2 * Math.PI / longitudeBands;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;

                this.vertices.push(radius * x, radius * y, radius * z);
                this.colors.push(1, 0, 0, this.alpha);
            }
        }

        for (let lat = 0; lat < latitudeBands; lat++) {
            for (let long = 0; long < longitudeBands; long++) {
                const first = (lat * (longitudeBands + 1)) + long;
                const second = first + longitudeBands + 1;
                this.indices.push(first, second, first + 1);
                this.indices.push(second, second + 1, first + 1);
            }
        }
    }

    render(program) {
        this.setupRenderingAttributes(program);
        this.setupRenderingTransformations(program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }

    update() {}
}