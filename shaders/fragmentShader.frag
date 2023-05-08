#version 100
#define MAX_LIGHTS 64

precision mediump float;

uniform int u_activeLights;
uniform vec3 u_ambientColor;
uniform float u_ambientIntensity;

//Defines which type of light it is, 0 is point light, 1 is directional, and 2 is spotlight.
uniform float u_lightType[MAX_LIGHTS];
uniform float u_lightIntensity[MAX_LIGHTS];
uniform vec3 u_lightPosition[MAX_LIGHTS];
uniform vec3 u_lightColor[MAX_LIGHTS];

//Some lights have special data, such as Point lights and attenuation, and directional with direction.
uniform vec3 u_lightData[MAX_LIGHTS];

//Color mode:
//  0: Using v_color
//  1: Using u_texture and v_texCoord
uniform int u_colorMode;

uniform sampler2D u_texture;
varying vec4 v_color;
varying vec3 v_normal;
varying vec3 v_worldPosition;
varying vec2 v_texCoord;

void main() {
    vec3 ambientColor = u_ambientColor;
    vec3 diffuseColor = vec3(0.0);

    for(int i = 0; i < MAX_LIGHTS; i++) {
        if(i >= u_activeLights) break;

        if (u_lightType[i] == 0.0) {
            vec3 lightDirection = normalize(u_lightPosition[i] - v_worldPosition);
            float diffuseFactor = max(dot(v_normal, lightDirection), 0.0);
            float distance = length(u_lightPosition[i] - v_worldPosition);

            vec3 attenuationData = vec3(u_lightData[i]);
            float attenuation = (attenuationData.x + (attenuationData.y * distance) + (attenuationData.z * distance * distance));

            diffuseColor += (diffuseFactor * u_lightColor[i] * u_lightIntensity[i]) / attenuation;

        } else if (u_lightType[i] == 1.0) {
            vec3 lightDirection = normalize(vec3(u_lightPosition[i]));
            float diffuseFactor = dot(v_normal, lightDirection);

            diffuseColor += diffuseFactor * u_lightColor[i] * u_lightIntensity[i];
        } else if (u_lightType[i] == 2.0) {
            vec3 lightDirection = normalize(u_lightPosition[i] - v_worldPosition);
            vec3 spotDirection = normalize(vec3(0.0, -1.0, 0.0));
            float angle = dot(-lightDirection, spotDirection);

            if (angle > 0.98) {
                float diffuseFactor = max(dot(v_normal, lightDirection), 0.0);
                diffuseColor += diffuseFactor * u_lightColor[i] * u_lightIntensity[i];
            }
        }
    }

    vec3 finalColor = ((ambientColor * u_ambientIntensity) + diffuseColor);

    if(u_colorMode == 0) {
        gl_FragColor = vec4(finalColor, 1.0) * v_color;
    } else {
        vec4 tempColor = texture2D(u_texture, v_texCoord);
        if (tempColor.w < 1.0) {
            discard;
        }
        gl_FragColor = vec4(finalColor, 1.0) * vec4(tempColor.r, tempColor.g, tempColor.b, 1.0);
    }
}