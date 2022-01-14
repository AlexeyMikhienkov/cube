/* eslint-disable */
class MaterialHelper {
    constructor() {}

    //
    static setUniforms(parameters, data, _uniforms) {
        // console.log( 'setUniforms', data, _uniforms );
        _uniforms = _uniforms || {};
        data.forEach(function(e) {
            // console.log('>>>', e );
            MaterialHelper.setUniform(parameters, _uniforms, ...e);
        });
        return _uniforms;
    }

    //
    static setUniform(parameters, _uniforms, name, value, type, getter, setter, var_type, var_array ) {
        // console.log( 'setUniform', name, _uniforms );
        _uniforms = _uniforms || {};
        _uniforms[name] = {
            var_type: var_type || 'uniform',
            var_array: var_array,
            type: type || "float",
            value: parameters[name] !== undefined ? parameters[name] : value,
            getter,
            setter
        };
        delete parameters[name];
        return _uniforms;
    }

    //
    static initUniforms(scope) {

        for (const uniform_name in scope._uniforms) {
            _initUniforms(scope, uniform_name, scope._uniforms[uniform_name]);
        }

        function _initUniforms(scope, uniform_name, uniform_data) {

            console.log(scope, uniform_name, uniform_data)

            const { _uniforms } = scope;

            var default_setter;
            switch( uniform_data.var_type ){
                case 'uniform':
                    default_setter = function(v) {
                        if (scope.shader) scope.shader.uniforms[uniform_name].value = v;
                        _uniforms[uniform_name].value = v;
                    };
                    break;

                case 'attribute':
                    default_setter = function(v) {
                        if (scope.shader) scope.shader.attributes[uniform_name].value = v;
                        _uniforms[uniform_name].value = v;
                    };
                    break;

                case 'varying':
                    break;
            }

            Object.defineProperty(scope, uniform_name, {
                get: uniform_data.getter || function() {
                    return _uniforms[uniform_name].value;
                },
                set:
                    uniform_data.setter || default_setter
            });

            if( uniform_data.var_type == 'uniform' ) scope[uniform_name] = uniform_data.value;
        }

    }

    //
    static addUniformsToShader(scope, shader) {

        const { _uniforms } = scope;
        for (const uniform_name in _uniforms) {
            const uniform_data = _uniforms[uniform_name];

            switch( uniform_data.var_type ){
                case 'uniform':
                    shader.uniforms[uniform_name] = {
                        value: _uniforms[uniform_name].value
                    };
                    break;
            }

        }

    }

    //
    static getUniformsShaderDefenition(scope, is_fragment) {
        const { _uniforms } = scope;
        let str = "";
        for (const uniform_name in _uniforms) {
            const uniform_data = _uniforms[uniform_name];
            if( uniform_data.var_type == 'attribute' && is_fragment ) continue;
            str += `${uniform_data.var_type} ${uniform_data.type} ${uniform_name}${uniform_data.var_array ? uniform_data.var_array : ''};`;
        }
        return str;
    }
}

//
module.exports = MaterialHelper;
