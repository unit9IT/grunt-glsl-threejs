//#THREE.ShaderChunk["map_pars_fragment"]
uniform bool booltest;
uniform bool booltest_v[];
uniform int inttest;
uniform int inttest_v[2];
uniform float opacity;
uniform float floattest_v[2];
uniform vec2 vec2test;
uniform vec2 vec2test_v[2];
uniform vec3 diffuse;
uniform vec3 vec3text_v[2];
uniform mat3 mat3test;
uniform mat3 mat3test_v[2];
uniform mat4 mat4test;
uniform mat4 mat4test_v[2];
uniform sampler2D samplertest;
uniform sampler2D samplertest_v[2];

void main() {
	// comment with '+arbiraryCode+' 
	// comment with "+arbiraryCode+"
	gl_FragColor = vec4( diffuse , opacity );
	gl_FragColor.xyz *= texture2D( map, vUv ).xyz;
	//#THREE.ShaderChunk["linear_to_gamma_fragment"]
}
