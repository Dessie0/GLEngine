class GameObject {

	static idCounter = 0;
	constructor() {
		//Generate a random ID
		this.id = ++GameObject.idCounter;
		this.shouldRender = false;

		this.transform = new Transform();
		this.collider = null;

		//Children objects perfectly match all transformations of the parent.
		this.children = [];

		//Fixed transformations will not change.
		this.fixedTranslate = false;
		this.fixedRotation = false;
		this.fixedScale = false;

		this.vertices = [];
		this.vertexBuffer = gl.createBuffer();

		this.colors = [];
		this.colorBuffer = gl.createBuffer();

		this.normals = [];
		this.normalBuffer = gl.createBuffer();

		this.textureUV = [];
		this.texture = gl.createTexture();
		this.textureBuffer = gl.createBuffer();

		this.keyListenersPressed = new Map();
		this.keyListenersUnpressed = new Map();
		this.upScrollListeners = [];
		this.downScrollListeners = [];
	}

	//Toggles "fixed translate" and will not translate the object.
	toggleFixedTranslate() {
		this.fixedTranslate = !this.fixedTranslate;
		return this;
	}

	//Toggles "fixed rotation" and will not rotate the object.
	toggleFixedRotation() {
		this.fixedRotation = !this.fixedRotation;
		return this;
	}

	//Toggles "fixed scale" and will not scale the object.
	toggleFixedScale() {
		this.fixedScale = !this.fixedScale;
		return this;
	}

	isUsingTexture() {
		return this.colors.length === 0;
	}

	isUsingNormals() {
		return this.normals.length > 0;
	}

	getTransform() {
		return this.transform;
	}
	
	setModel(filepath) {
		new OBJLoader().load(filepath).then(loader => {
			this.vertices = loader.vertices;
			this.normals = loader.normals;
			this.textureUV = loader.textureCoords;

			this.updateVertices();
		});

		return this;
	}

	setModelWithColors(filepath, colors) {
		new OBJLoader().useColors(colors).load(filepath).then(loader => {
			this.vertices = loader.vertices;
			this.colors = loader.colors;
			this.normals = loader.normals;

			this.updateVertices();
		});
		return this;
	}

	setTexture(texturepath) {
		let image = new Image();
		image.onload = () => {
			gl.bindTexture(gl.TEXTURE_2D, this.texture);

			// Set texture data
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

			// Set texture parameters
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		};

		image.src = texturepath;
		return this;
	}
	
	setTranslate(vec) {
		if(!this.fixedTranslate) {
			this.getTransform().setTranslate(vec);
		}
		return this;
	}

	setRotation(vec) {
		if(!this.fixedRotation) {
			this.getTransform().setRotation(vec);
		}
		return this;
	}

	setScale(vec) {
		if(!this.fixedScale) {
			this.getTransform().setScale(vec);
		}
		return this;
	}

	addChild(object) {
		this.children.push(object);
	}

	removeChild(id) {
		this.children = this.children.filter(obj => obj.id !== id);
	}

	updateChildren() {
		this.children.forEach(child => {
			child.setTranslate(this.getTransform().getTranslate().duplicate());
			child.updateChildren();
		});

		if(this.collider !== null && this.collider.outline !== null && this.collider.outline.shouldRender) {
			let collider = this.collider;
			let outline = collider.outline;

			outline.setScale(outline.getTransform().getScale().add(collider.localScale));
			outline.setTranslate(outline.getTransform().getTranslate().add(collider.localTranslate));
		}
	}

	update() {
		this.updateChildren();
	}

	attachKeyListener(key, pressed, unpressed) {
		this.keyListenersPressed.set(key, pressed);
		this.keyListenersUnpressed.set(key, unpressed);
	}

	attachScrollListener(upFunc, downFunc) {
		this.upScrollListeners.push(upFunc);
		this.downScrollListeners.push(downFunc);
	}

	render(program) {
		this.setupRenderingAttributes(program);
		this.setupRenderingTransformations(program);

		if(this.isUsingTexture()) {
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.texture);
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);

		this.children.forEach(child => {
			child.render(program);

			//For now, we're just going to assume that all children are collider outlines.
			//Set the scale back to its original state.
			//There's no need to update the translate here, since it will be reset in the above forEach anyways.
			if(this.collider !== null) {
				child.setScale(child.getTransform().getScale().subtract(this.collider.localScale));
			}
		});
	}

	setupRenderingAttributes(program) {
		let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.enableVertexAttribArray(positionAttributeLocation);
		gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false,
			0, 0);

		if(this.isUsingTexture()) {
			let textureAttributeLocation = gl.getAttribLocation(program, "a_texCoord");
			gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
			gl.enableVertexAttribArray(textureAttributeLocation);
			gl.vertexAttribPointer(textureAttributeLocation, 2, gl.FLOAT, false,
				0, 0);

			//Set the texture uniform.
			let textureLocation = gl.getUniformLocation(program, "u_texture");
			gl.uniform1i(textureLocation, 0);

			//Define the color mode
			gl.uniform1i(gl.getUniformLocation(program, "u_colorMode"), 1);

			let colorAttributeLocation = gl.getAttribLocation(program, "a_color");
			gl.disableVertexAttribArray(colorAttributeLocation);
		} else {
			let colorAttributeLocation = gl.getAttribLocation(program, "a_color");
			gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
			gl.enableVertexAttribArray(colorAttributeLocation);
			gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false,
				0, 0);

			//Define the color mode
			gl.uniform1i(gl.getUniformLocation(program, "u_colorMode"), 0);

			let textureAttributeLocation = gl.getAttribLocation(program, "a_texCoord");
			gl.disableVertexAttribArray(textureAttributeLocation);
		}

		if(this.isUsingNormals()) {
			let normalAttributeLocation = gl.getAttribLocation(program, "a_normal");
			gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
			gl.enableVertexAttribArray(normalAttributeLocation);
			gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false,
				0, 0);
		}
	}

	setupRenderingTransformations(program) {
		//Translations
		let tranLoc = gl.getUniformLocation(program, 'u_translation');
		gl.uniform3fv(tranLoc, new Float32Array(this.getTransform().getTranslate().toArray()));

		//Scales
		let scaleLoc = gl.getUniformLocation(program, 'u_scale');
		gl.uniform3fv(scaleLoc, new Float32Array(this.getTransform().getScale().toArray()));

		//Rotations
		let thetaLoc = gl.getUniformLocation(program, 'u_rotation');
		gl.uniform3fv(thetaLoc, new Float32Array(this.getTransform().getRotation().toArray()));
	}

	//Buffers the new vertices to the buffer.
	updateVertices() {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

		if(this.isUsingTexture()) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.textureUV), gl.STATIC_DRAW);
		} else {
			gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
		}

		if(this.isUsingNormals()) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
		}

		this.shouldRender = true;
	}

}