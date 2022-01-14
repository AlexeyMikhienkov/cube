import MaterialHelper from "./MaterialHelper";

export default class CustomBasicMaterial extends THREE.MeshBasicMaterial {
    /**
     *
     * @param data
     */
    constructor(data) {
        super(data);

        const _uniforms = MaterialHelper.setUniforms(data || {}, [
            ['time', data?.time || 0, 'float']
        ]);

        this._uniforms = _uniforms;
        MaterialHelper.initUniforms(this);

        this.onBeforeCompile = (shader) => {
            this.shader = shader;
            MaterialHelper.addUniformsToShader(this, shader);

            shader.vertexShader = shader.vertexShader
                .replace(
                    '#include <common>', [
                        '#include <common>',
                        MaterialHelper.getUniformsShaderDefenition(this),
                    ].join('\n'))
                .replace( //296
                    "#include <begin_vertex>", [
                        "#include <begin_vertex>",
                        "vec4 worldPositionCustom = vec4( transformed, 1.0 );",
                        "worldPositionCustom = modelMatrix * worldPositionCustom;",
                    ].join('\n'))
                .replace( //157
                    "#include <envmap_pars_vertex>", [
                        "#include <envmap_pars_vertex>",
                        "varying vec3 vWorldPositionCustom;"
                    ].join('\n'))
                .replace( //377
                    "#include <envmap_vertex>", [
                        "#include <envmap_vertex>",
                        "vWorldPositionCustom = worldPositionCustom.xyz;"
                    ].join('\n'));

            shader.fragmentShader = shader.fragmentShader
                .replace(
                    '#include <common>', [
                        `#include <common>`,
                        MaterialHelper.getUniformsShaderDefenition(this, true),
                    ].join('\n'))
                .replace( //169
                    "#include <envmap_pars_fragment>", [
                        "#include <envmap_pars_fragment>",
                        "varying vec3 vWorldPositionCustom;"
                    ].join('\n'))
                .replace( //345
                    "vec3 outgoingLight = reflectedLight.indirectDiffuse;",
                    "vec3 outgoingLight = vec3(vWorldPositionCustom.xyz * sin(time / 1000.0));");
        }
    }
}
