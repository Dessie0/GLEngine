#version 100

attribute vec4 a_position;
attribute vec4 a_color;
attribute vec2 a_texCoord;
attribute vec3 a_normal;

varying vec3 v_worldPosition;
varying vec4 v_color;
varying vec2 v_texCoord;
varying vec3 v_normal;

uniform vec3 u_translation;
uniform vec3 u_rotation;
uniform vec3 u_scale;

//Camera move variables.
uniform vec3 cameraLoc;
uniform vec3 cameraRotation;
uniform float near;
uniform float far;
uniform float aspect;
uniform float fov;

mat4 PositionObject() {
    mat4 translateM = mat4(1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    u_translation.x, u_translation.y, u_translation.z, 1.0);
    return translateM;
}

mat4 RotateObject() {
    vec3 cos = cos(u_rotation);
    vec3 sin = sin(u_rotation);

    mat4 rotateX = mat4(1.0, 0.0,    0.0,    0.0,
    0.0, cos.x,  -sin.x,  0.0,
    0.0, sin.x, cos.x,  0.0,
    0.0, 0.0,    0.0,    1.0);

    mat4 rotateY = mat4(cos.y,  0.0,  sin.y, 0.0,
    0.0,    1.0,  0.0,    0.0,
    -sin.y,  0.0,   cos.y, 0.0,
    0.0,    0.0,  0.0,    1.0);

    mat4 rotateZ = mat4(cos.z, -sin.z, 0.0, 0.0,
    sin.z, cos.z,  0.0, 0.0,
    0.0,   0.0,    1.0, 0.0,
    0.0,   0.0,    0.0, 1.0);

    return rotateZ * rotateY * rotateX;
}

mat4 ScaleObject() {
    if(length(u_scale) != 0.0) {
        mat4 scaleM = mat4(u_scale.x, 0.0, 0.0, 0.0,
        0.0, u_scale.y, 0.0, 0.0,
        0.0, 0.0, u_scale.z, 0.0,
        0.0, 0.0, 0.0, 1.0);

        return scaleM;
    } else {
        return mat4(1.0);
    }
}

mat4 GetModel() {
    return PositionObject() * RotateObject() * ScaleObject();
}

mat4 GetView() {
    vec3 cw = cos(cameraRotation);
    vec3 sw = sin(cameraRotation);

    mat4 translateView = mat4(
        1.0,0.0,0.0,0.0,
        0.0,1.0,0.0,0.0,
        0.0,0.0,-1.0,0.0,
        -1.0 * cameraLoc.x,-1.0 * cameraLoc.y, cameraLoc.z,1.0
    );

    mat4 rotateXView = mat4(
        1.0,	0.0,		0.0,	0.0,
        0.0,	cw.x,		sw.x,	0.0,
        0.0,	-1.0*sw.x, 	cw.x,	0.0,
        0.0,	0.0,		0.0,	1.0
    );

    mat4 rotateYView = mat4(
        cw.y,0.0,-1.0*sw.y,0.0,
        0.0,1.0,0.0,0.0,
        sw.y,0.0,cw.y,0.0,
        0.0,0.0,0.0,1.0
    );

    mat4 rotateZView = mat4(
        cw.z,		sw.z,		0.0,	0.0,
        -1.0*sw.z, 	cw.z,		0.0,	0.0,
        0.0,		0.0,		1.0,	0.0,
        0.0,		0.0,		0.0,	1.0
    );
    return rotateXView*rotateYView*rotateZView*translateView;
}

mat4 GetProjection() {
    //Use modified version of perspective to more easily be able to change the FOV.
    float f = 1.0 / tan(fov / 2.0);
    return mat4(f / aspect, 0.0, 0.0, 0.0,
                0.0, f, 0.0, 0.0,
                0.0, 0.0, -1.0 * (far + near) / (far - near), -1.0,
                0.0, 0.0, -2.0 * (far + near) / (far - near), 0.0);
}

void main() {
    gl_PointSize = 10.0;

    mat4 projection = GetProjection();
    mat4 view = GetView();
    mat4 model = GetModel();

    v_color = a_color;
    v_texCoord = a_texCoord;
    v_normal = normalize(mat3(model) * a_normal);
    v_worldPosition = (model * a_position).xyz;

    gl_Position = projection * view * model * a_position;
}