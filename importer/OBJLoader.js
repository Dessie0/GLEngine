class OBJLoader {
    constructor() {
        this.vertices = [];
        this.normals = [];
        this.textureCoords = [];

        this.passedColors = [];
        this.colors = [];
    }

    useColors(colors) {
        this.passedColors = colors;
        return this;
    }

    async load(filepath) {
        return this.extractFromFile(filepath).then(text => {
            //Parse the data
            this.parseData(text);
            return Promise.resolve(this);
        });
    }

    async extractFromFile(filepath) {
        let content = engine.modelCache.get(filepath);
        if(content !== undefined) {
            return content;
        }

        return await fetch(filepath).then(res => {
            let text = res.text();
            engine.modelCache.add(filepath, text);
            return text;
        });
    }

    async parseData(text) {
        let lines = text.split("\n");

        //Temporarily add all the `v` and `vn` attributes to these arrays.
        //We will use the `f` to determine the exact order later.
        let normals = [];
        let vertices = [];
        let textureCoords = [];

        let vertexIndices = [];
        let normalIndices = [];
        let textureIndices = [];

        let vertexColor = new Map();
        let currentColor;

        for(let i = 0; i < lines.length; i++) {
            let parts = lines[i].trim().split(/\s+/);

            if(parts[0] === 'o') {
                currentColor = this.passedColors[parts[1]] !== undefined ? this.passedColors[parts[1]] : null;
            }

            if(parts[0] === 'v') {
                vertices.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
                if(currentColor !== null) {
                    vertexColor.set(parts[1] + "," + parts[2] + "," + parts[3], currentColor);
                }
            }

            if(parts[0] === 'vn') {
                normals.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
            }

            if(parts[0] === 'vt') {
                //Reverse the coordinate because Blockbench not smort
                textureCoords.push(parseFloat(parts[1]), 1 - parseFloat(parts[2]));
            }

            if(parts[0] === 'f') {
                for (let j = 1; j < parts.length; j++) {
                    let faceParts = parts[j].split('/');
                    vertexIndices.push(parseInt(faceParts[0]) - 1);
                    textureIndices.push(parseInt(faceParts[1]) - 1);
                    normalIndices.push(parseInt(faceParts[2]) - 1);
                }
            }
        }

        for (let i = 0; i < vertexIndices.length; i++) {
            let vertexIndex = vertexIndices[i];
            let textureIndex = textureIndices[i];
            let normalIndex = normalIndices[i];

            this.vertices.push(vertices[vertexIndex * 3], vertices[vertexIndex * 3 + 1], vertices[vertexIndex * 3 + 2]);
            this.textureCoords.push(textureCoords[textureIndex * 2], textureCoords[textureIndex * 2 + 1]);
            this.normals.push(normals[normalIndex * 3], normals[normalIndex * 3 + 1], normals[normalIndex * 3  + 2]);

            if(vertexColor.size > 0) {
                let rgb = vertexColor.get(vertices[vertexIndex * 3] + "," + vertices[vertexIndex * 3 + 1] + "," + vertices[vertexIndex * 3 + 2]);
                this.colors.push(rgb[0] / 256, rgb[1] / 256, rgb[2] / 256, rgb.length > 3 ? rgb[3] : 1);
            }
        }
    }
}