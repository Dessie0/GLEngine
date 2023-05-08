//ChatGPT is a legend!
class VectorUtils {

    static createIdentityMatrix() {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    }

    static translationVectorToMatrix(vec) {
        let matrix = this.createIdentityMatrix();

        matrix[10] = -1;
        matrix[12] = -1 * vec[0];
        matrix[13] = -1 * vec[1];
        matrix[14] = vec[2];

        return matrix;
    }

    static rotationVectorTo3x3Matrix(vec) {
        let cosTheta = Math.cos(vec.getZ());
        let sinTheta = Math.sin(vec.getZ());
        let cosPhi = Math.cos(vec.getY());
        let sinPhi = Math.sin(vec.getY());
        let cosPsi = Math.cos(vec.getX());
        let sinPsi = Math.sin(vec.getX());

        return [
            cosTheta * cosPhi, cosTheta * sinPhi * sinPsi - sinTheta * cosPsi, cosTheta * sinPhi * cosPsi + sinTheta * sinPsi,
            sinTheta * cosPhi, sinTheta * sinPhi * sinPsi + cosTheta * cosPsi, sinTheta * sinPhi * cosPsi - cosTheta * sinPsi,
            -sinPhi, cosPhi * sinPsi, cosPhi * cosPsi
        ];
    }

    static rotationVectorTo4x4Matrix(vec) {
        const sx = Math.sin(vec[0]);
        const cx = Math.cos(vec[0]);
        const sy = Math.sin(vec[1]);
        const cy = Math.cos(vec[1]);
        const sz = Math.sin(vec[2]);
        const cz = Math.cos(vec[2]);

        const xRotationMatrix = [
            1.0,  0.0,	 0.0, 0.0,
            0.0,  cx,	 sx,  0.0,
            0.0,  -sx,   cx,  0.0,
            0.0,  0.0,	 0.0, 1.0
        ];

        const yRotationMatrix = [
            cy, 0, -sy, 0,
            0, 1, 0, 0,
            sy, 0, cy, 0,
            0, 0, 0, 1
        ];

        const zRotationMatrix = [
            cz, sz, 0, 0,
            -sz, cz, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];

        const tempMatrix = this.multiplyMatrixByMatrix(xRotationMatrix, yRotationMatrix);
        return this.multiplyMatrixByMatrix(tempMatrix, zRotationMatrix);
    }

    static multiply4DVectorByMatrix4(vec, matrix) {
        let x = vec[0];
        let y = vec[1];
        let z = vec[2];
        let w = vec[3];

        return [matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12] * w,
                matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13] * w,
                matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14] * w,
                matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15] * w];
    }

    static multiplyVectorByMatrix(vector, matrix) {
        let array = vector.toArray();

        let rows = array.length;
        let result = [];
        for(let i = 0; i < rows; i++) {
            result[i] = 0;
            for(let j = 0; j < rows; j++) {
                result[i] += (array[j] * matrix[(i * rows) + j]);
            }
        }

        return new Vector3(result[0], result[1], result[2]);
    }

    static multiplyMatrixByMatrix(matrix1, matrix2) {
        let output = [];

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let sum = 0;
                for (let k = 0; k < 4; k++) {
                    sum += matrix1[i * 4 + k] * matrix2[k * 4 + j];
                }
                output[i * 4 + j] = sum;
            }
        }

        return output;
    }

    //Yoinked and slightly modified from
    //https://stackoverflow.com/questions/1148309/inverting-a-4x4-matrix
    static inverseMatrix(m) {
        let inverse = [];

        inverse[0]  =  m[5] * m[10] * m[15] - m[5] * m[11] * m[14] - m[9] * m[6] * m[15] + m[9] * m[7] * m[14] + m[13] * m[6] * m[11] - m[13] * m[7] * m[10];
        inverse[4]  = -m[4] * m[10] * m[15] + m[4] * m[11] * m[14] + m[8] * m[6] * m[15] - m[8] * m[7] * m[14] - m[12] * m[6] * m[11] + m[12] * m[7] * m[10];
        inverse[8]  =  m[4] * m[9]  * m[15] - m[4] * m[11] * m[13] - m[8] * m[5] * m[15] + m[8] * m[7] * m[13] + m[12] * m[5] * m[11] - m[12] * m[7] * m[9];
        inverse[12] = -m[4] * m[9]  * m[14] + m[4] * m[10] * m[13] + m[8] * m[5] * m[14] - m[8] * m[6] * m[13] - m[12] * m[5] * m[10] + m[12] * m[6] * m[9];
        inverse[1]  = -m[1] * m[10] * m[15] + m[1] * m[11] * m[14] + m[9] * m[2] * m[15] - m[9] * m[3] * m[14] - m[13] * m[2] * m[11] + m[13] * m[3] * m[10];
        inverse[5]  =  m[0] * m[10] * m[15] - m[0] * m[11] * m[14] - m[8] * m[2] * m[15] + m[8] * m[3] * m[14] + m[12] * m[2] * m[11] - m[12] * m[3] * m[10];
        inverse[9]  = -m[0] * m[9]  * m[15] + m[0] * m[11] * m[13] + m[8] * m[1] * m[15] - m[8] * m[3] * m[13] - m[12] * m[1] * m[11] + m[12] * m[3] * m[9];
        inverse[13] =  m[0] * m[9]  * m[14] - m[0] * m[10] * m[13] - m[8] * m[1] * m[14] + m[8] * m[2] * m[13] + m[12] * m[1] * m[10] - m[12] * m[2] * m[9];
        inverse[2]  =  m[1] * m[6]  * m[15] - m[1] * m[7]  * m[14] - m[5] * m[2] * m[15] + m[5] * m[3] * m[14] + m[13] * m[2] * m[7]  - m[13] * m[3] * m[6];
        inverse[6]  = -m[0] * m[6]  * m[15] + m[0] * m[7]  * m[14] + m[4] * m[2] * m[15] - m[4] * m[3] * m[14] - m[12] * m[2] * m[7]  + m[12] * m[3] * m[6];
        inverse[10] =  m[0] * m[5]  * m[15] - m[0] * m[7]  * m[13] - m[4] * m[1] * m[15] + m[4] * m[3] * m[13] + m[12] * m[1] * m[7]  - m[12] * m[3] * m[5];
        inverse[14] = -m[0] * m[5]  * m[14] + m[0] * m[6]  * m[13] + m[4] * m[1] * m[14] - m[4] * m[2] * m[13] - m[12] * m[1] * m[6]  + m[12] * m[2] * m[5];
        inverse[3]  = -m[1] * m[6]  * m[11] + m[1] * m[7]  * m[10] + m[5] * m[2] * m[11] - m[5] * m[3] * m[10] - m[9]  * m[2] * m[7]  + m[9]  * m[3] * m[6];
        inverse[7]  =  m[0] * m[6]  * m[11] - m[0] * m[7]  * m[10] - m[4] * m[2] * m[11] + m[4] * m[3] * m[10] + m[8]  * m[2] * m[7]  - m[8]  * m[3] * m[6];
        inverse[11] = -m[0] * m[5]  * m[11] + m[0] * m[7]  * m[9]  + m[4] * m[1] * m[11] - m[4] * m[3] * m[9]  - m[8]  * m[1] * m[7]  + m[8]  * m[3] * m[5];
        inverse[15] =  m[0] * m[5]  * m[10] - m[0] * m[6]  * m[9]  - m[4] * m[1] * m[10] + m[4] * m[2] * m[9]  + m[8]  * m[1] * m[6]  - m[8]  * m[2] * m[5];

        let det = m[0] * inverse[0] + m[1] * inverse[4] + m[2] * inverse[8] + m[3] * inverse[12];
        if (det === 0) return null;
        det = 1.0 / det;

        let result = [];
        for (let i = 0; i < 16; i++)
            result[i] = inverse[i] * det;

        return result;
    }

    static getViewMatrix(rotation, translation) {
        return this.multiplyMatrixByMatrix(this.rotationVectorTo4x4Matrix(rotation), this.translationVectorToMatrix(translation));
    }

    static getPerspectiveMatrix() {
        let f = 1.0 / Math.tan(engine.camera.fov / 2.0);
        let aspect = engine.aspect;
        let far = engine.far;
        let near = engine.near;

        return [
            f/aspect, 0.0, 0.0, 0.0,
            0.0, f, 0.0, 0.0,
            0.0, 0.0, -1.0 * (far + near) / (far - near), -1.0,
            0.0, 0.0, -2.0 * (far * near) / (far - near), 0.0];
    }

    static getModelMatrix(translate, rotate, scale) {
        let translateMatrix = [1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            translate[0], translate[1], translate[2], 1.0];

        let rotationMatrix = this.rotateModel(rotate);
        let scaleMatrix = this.scaleModel(scale);

        let tempMatrix = this.multiplyMatrixByMatrix(translateMatrix, rotationMatrix);
        return this.multiplyMatrixByMatrix(tempMatrix, scaleMatrix);
    }

    static rotateModel(rotation) {
        let cosX = Math.cos(rotation[0]);
        let sinX = Math.sin(rotation[0]);
        let cosY = Math.cos(rotation[1]);
        let sinY = Math.sin(rotation[1]);
        let cosZ = Math.cos(rotation[2]);
        let sinZ = Math.sin(rotation[2]);

        let rotateX = [1.0, 0.0,    0.0,    0.0,
            0.0, cosX,  -sinX,  0.0,
            0.0, sinX, cosX,  0.0,
            0.0, 0.0,    0.0,    1.0];

        let rotateY = [cosY,  0.0,  sinY, 0.0,
            0.0,    1.0,  0.0,    0.0,
            -sinY,  0.0,   cosY, 0.0,
            0.0,    0.0,  0.0,    1.0];

        let rotateZ = [cosZ, -sinZ, 0.0, 0.0,
            sinZ, cosZ,  0.0, 0.0,
            0.0,   0.0,    1.0, 0.0,
            0.0,   0.0,    0.0, 1.0];

        let tempMatrix = VectorUtils.multiplyMatrixByMatrix(rotateZ, rotateY);
        return VectorUtils.multiplyMatrixByMatrix(tempMatrix, rotateX);
    }

    static scaleModel(scale) {
        if(this.length(scale) != 0.0) {
            return [scale[0], 0.0, 0.0, 0.0,
                0.0, scale[1], 0.0, 0.0,
                0.0, 0.0, scale[2], 0.0,
                0.0, 0.0, 0.0, 1.0];
        } else {
            return this.createIdentityMatrix();
        }
    }

}