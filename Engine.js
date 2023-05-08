class Engine {

    constructor(canvas) {
        this.webGL = new WebGLInterface();
        this.keys = [];
        this.removedKeys = [];
        this.modelCache = new ModelCache();

        //Enable alpha blending with WebGL.
        //This prevents our transparent spheres from occluding the objects behind them.
        gl.enable(gl.BLEND);
        gl.blendEquation(gl.FUNC_ADD);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.cullFace(gl.BACK);
        gl.enable(gl.DEPTH_TEST);

        this.onready = () => {
        };
        this.backgroundColor = {r: 0, g: 0, b: 0};
        this.canvas = canvas;

        window.onkeydown = (event) => this.keyDown(event);
        window.onkeyup = (event) => this.keyUp(event);
        window.onwheel = (event) => this.scroll(event);
        canvas.addEventListener("click", (event) => this.click(event));

        //Used for tracking and maintaining FPS
        this.lastTime = 0;
        this.lastFrameCheck = 0;
        this.frameCount = 0;

        this.near = 0.1;
        this.far = 500.0;
        this.aspect = this.canvas.width / this.canvas.height;
    }
    async startup() {
        return this.webGL.enableShaders().then(() => {
            gl.uniform3fv(gl.getUniformLocation(this.webGL.program,'cameraLoc'), new Float32Array([0,0,0]));
            gl.uniform3fv(gl.getUniformLocation(this.webGL.program,'cameraRotation'), new Float32Array([0,0,0]));

            gl.uniform1f(gl.getUniformLocation(this.webGL.program,'near'), this.near);
            gl.uniform1f(gl.getUniformLocation(this.webGL.program,'far'), this.far);
            gl.uniform1f(gl.getUniformLocation(this.webGL.program,'aspect'), this.aspect);

            this.level = new Level([0.1, 0.1, 0.1]);

            //Should be changed, but works for now.
            new OBJLoader().load('resources/models/cube.obj').then(() => {
                this.onready();
                requestAnimationFrame((currentTime) => this.update(currentTime));
            });
        });
    }

    setCamera(camera) {
        this.camera = camera;
        this.level.createObject(camera);
    }

    keyDown(event) {
        if (!this.keys.includes(String.fromCharCode(event.keyCode))) {
            this.keys.push(String.fromCharCode(event.keyCode));
        }
    }

    keyUp(event) {
        this.keys = this.keys.filter(key => key !== String.fromCharCode(event.keyCode));
        this.removedKeys.push(String.fromCharCode(event.keyCode));
    }

    scroll(event) {
        let deltaY = event.deltaY;
        let direction = deltaY > 0 ? 'down' : 'up';

        if(direction === 'up') {
            this.level.objects.forEach(obj => {
                obj.upScrollListeners.forEach(listener => listener());
            });
        } else {
            this.level.objects.forEach(obj => {
                obj.downScrollListeners.forEach(listener => listener());
            });
        }
    }

    click(event) {
        let coords = this.calculateWebGLCoords(event.clientX, event.clientY);
        let x = coords[0];
        let y = coords[1];

        // this.level.objects.forEach(obj => {
        //     if (obj.collider === null) return;
        //
        //     if (obj.collider.attemptCollidePoint(x, y, 0)) {
        //         obj.collider.onclick(event);
        //     }
        // });
    }

    update(currentTime) {
        let elapsedFrameCheck = currentTime - this.lastFrameCheck;
        let elapsed = currentTime - this.lastTime;

        if(elapsedFrameCheck >= 1000) {
            //console.log("FPS: " + this.frameCount / (elapsedFrameCheck / 1000));
            this.frameCount = 0;
            this.lastFrameCheck = currentTime;
        }

        if(elapsed >= 1000 / 120) {
            this.lastTime = currentTime;
            this.frameCount++;

            gl.clearColor(this.backgroundColor.r / 255, this.backgroundColor.g / 255, this.backgroundColor.b / 255, 1);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            //Execute the key updates
            this.doKeyPresses();

            this.updateAll();
            this.renderAll();
        }

        requestAnimationFrame((currentTime) => this.update(currentTime));
    }

    updateAll() {
        this.level.objects.forEach(obj => obj.update());
    }

    renderAll() {
        this.level.renderLighting(this.webGL.program);
        this.level.objects.filter(obj => obj.shouldRender).forEach(obj => obj.render(this.webGL.program));
    }

    doKeyPresses() {
        this.keys.forEach(key => {
            this.level.objects.forEach(obj => {
                if (obj.keyListenersPressed.has(key)) {

                    obj.keyListenersPressed.get(key)();
                }
            });
        });

        this.removedKeys.forEach(key => {
            this.level.objects.forEach(obj => {
                if (obj.keyListenersUnpressed.has(key)) {
                    obj.keyListenersUnpressed.get(key)();
                }
            });
        });

        this.removedKeys = [];
    }
    calculateWebGLCoords(clientX, clientY) {
        let rect = canvas.getBoundingClientRect();
        let realX = clientX - rect.left;
        let realY = clientY - rect.top;
        let x = realX / canvas.width * 2 - 1;
        let y = 1 - realY / canvas.height * 2;
        let z = 0;


        //Supposed to calculate click positions, no workie that well.
        // let rayClip = [x, y, z, 1];
        //
        // let perspective = VectorUtils.getPerspectiveMatrix();
        // let view = VectorUtils.getViewMatrix(this.camera.getTransform().getRotation(), this.camera.getTransform().getTranslate());
        // let model = VectorUtils.getModelMatrix(this.camera.getTransform().getTranslate(), this.camera.getTransform().getRotation(), this.camera.getTransform().getScale());
        //
        // let viewModel = VectorUtils.multiplyMatrixByMatrix(view, model);
        // let projectionViewModel = VectorUtils.multiplyMatrixByMatrix(perspective, viewModel);
        // let inverse = VectorUtils.inverseMatrix(projectionViewModel);
        //
        // let worldCoords = VectorUtils.multiply4DVectorByMatrix4(rayClip, inverse);
        //
        // this.level.createObject(new Cube(0.1, 0.1, 0.1, 1, 0, 0, 1)
        //     .setTranslate(worldCoords[0], worldCoords[1], worldCoords[2]));
        //
        // return [worldCoords[0], worldCoords[1], worldCoords[2]];
    }
}