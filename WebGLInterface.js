class WebGLInterface {
	constructor() {
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}
	createShader(type,source) {
		let shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

		if(success) {
			return shader;
		}

		console.error(gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
	}

	createProgram(vs,fs) {
		let program = gl.createProgram();
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);

		let successes = gl.getProgramParameter(program, gl.LINK_STATUS);

		if(successes) {
			return program;
		}

		console.error(gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
	}

	async enableShaders() {
		let vertShaderText = await fetch('../Engine/shaders/vertexShader.vert').then(res => res.text());
		let fragmentShaderText = await fetch('../Engine/shaders/fragmentShader.frag').then(res => res.text());

		let vertexShader = this.createShader(gl.VERTEX_SHADER, vertShaderText);
		let fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderText);

		//Create the program
		this.program = this.createProgram(vertexShader, fragmentShader);
		gl.useProgram(this.program);
	}

}