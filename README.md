# grunt-glsl-threejs [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

[![NPM version](https://badge.fury.io/js/grunt-glsl-threejs.png)](http://badge.fury.io/js/grunt-glsl-threejs)
[![Build Status](https://travis-ci.org/unit9IT/grunt-glsl-threejs.png?branch=master)](https://travis-ci.org/unit9IT/grunt-glsl-threejs)
[![Dependency Status](https://david-dm.org/unit9IT/grunt-glsl-threejs.png?theme=shields.io)](https://david-dm.org/unit9IT/grunt-glsl-threejs)
[![devDependency Status](https://david-dm.org/unit9IT/grunt-glsl-threejs/dev-status.png?theme=shields.io)](https://david-dm.org/unit9IT/grunt-glsl-threejs#info=devDependencies)

> A Grunt taks for wrapping GLSL Shader code in Javascript packages, ready to be used in Three.js

## Getting Started
This plugin requires Grunt `~0.4.4`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-glsl-threejs --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-glsl-threejs');
```

## Automatic Uniforms Generator
This Grunt script tries to generate automatic Three.js wrapper code for all the uniforms used in yourt Fragment and Vertex Shaders, please note this part of the script is the most experimental one and there are many areas where it falls short in regard to this.

In case you find the automatically generated uniforms are incorrect, you can always specify the right ones in your JS code just before passing the Shader code in your ShaderMaterial.

## GLSL Special Syntax
A special syntax has been introduced in GLSL Comments in order to include Raw Javascript code in case you need it

### //#UNIFORMLIB
Example:
```glsl
//#UNIFORMLIB THREE.UniformsLib["common"]
```
Use this at the beginning of your _Vertex Shader_ in order to include a Three.js uniform Library in your shader, this will affect the Uniform Declaration in the produced JS in this way:
```js
THREE.MyShader = {
  uniforms: THREE.UniformsUtils.merge([
    THREE.UniformsLib["common"],
    {
      "generatedUniform": {type: "v3",value: new THREE.Vector3(1, 1, 1)},
    [...]
    }
  ]),
  [...]
```

### //#UNIFORM 
Example:
```glsl
//#UNIFORM "ambient": {type: "c",value: new THREE.Color(0xffffff)}
```
Use this at the beginning of your _Vertex Shader_ in order to include an additional Uniform (in addition to the automatically generated ones).

this will affect the Uniform Declaration in the produced JS in this way:
```js
THREE.MyShader = {
  uniforms: THREE.UniformsUtils.merge([
    {
      "ambient": {type: "c",value: new THREE.Color(0xffffff)},
      "generatedUniform": {type: "c",value: new THREE.Color(0xffffff)},
    [...]
    }
  ]),
  [...]
```


### //#THREE
Example:
```glsl
//#THREE.ShaderChunk["map_vertex"]
```
Use this whenever you need a to insert a THREE ShaderChunk in your code


## The "glsl_threejs" task

### Overview
In your project's Gruntfile, add a section named `glsl_threejs` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  glsl_threejs: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },\
});
```

### Options

#### options.lineEndings
Type: `String`
Default value: `'\n'`

Specify a Line Ending style for the source files, can be  `\n` (Windows Style) or `\n\r` (*NIX Style) 

#### options.jsPackage
Type: `String`
Default value: `'THREE'`

A Package name where your shaders will be stored.

### Usage Examples

#### Default Options
In this example, the default options are used to create an unified `shaders.js` file containing both the Vertex and Fragment Shader.

```js
grunt.initConfig({
  glsl_threejs: {
    options: {},
    files: {
      'dest/shaders.js': ['src/MyShader.vert', 'src/MyShader.frag'],
    },
  },
});
```

the result will be:

```js
THREE.MyShader = {
  uniforms: { ... },
  vertexShader: { ... },
  fragmentShader: { ... }
}
```



#### Custom Options
In this example, custom options are used to compile all VErtex and Fragment shaders contained in a specified folder into a single `shaders.js` file

```js
grunt.initConfig({
  glsl_threejs: {
    options: {
      jsPackage: 'MYPACKAGE',
      lineEndings: '\n\r',
    },
    files: {
      'dest/shaders.js': ['src/*.vert', 'src/*.frag'],
    },
  },
});
```

the result will be:

```js
MYPACKAGE.MyShader1 = {
  uniforms: { ... },
  vertexShader: { ... },
  fragmentShader: { ... }
},
MYPACKAGE.MyShader2 = {
  uniforms: { ... },
  vertexShader: { ... },
  fragmentShader: { ... }
}
```


#### Example GLSL Files
MyShader is an example simple shader with no light support. Based on the default Three.js Lambert Shader.


MyShader.vert

```glsl
//#UNIFORMLIB THREE.UniformsLib["common"]
//#UNIFORMLIB THREE.UniformsLib["fog"]
//#UNIFORM "ambient": {type: "c",value: new THREE.Color(0xffffff)}
//#UNIFORM "emissive": {type: "c",value: new THREE.Color(0x000000)}
//#UNIFORM "wrapRGB": {type: "v3",value: new THREE.Vector3(1, 1, 1)}


//#THREE.ShaderChunk["map_pars_vertex"]

void main() {

  //#THREE.ShaderChunk["map_vertex"]
  //#THREE.ShaderChunk["default_vertex"]
  //#THREE.ShaderChunk["worldpos_vertex"]
}
```

MyShader.frag

```glsl
uniform float opacity;
//#THREE.ShaderChunk["map_pars_fragment"]

void main() {
  gl_FragColor = vec4( vec3 ( 1.0 ), opacity );

  #ifdef USE_MAP
    vec4 texelColor = texture2D( map, vUv );
    #ifdef GAMMA_INPUT
      texelColor.xyz *= texelColor.xyz;
    #endif

    gl_FragColor = gl_FragColor * texelColor;
  #endif
  //#THREE.ShaderChunk["alphatest_fragment"]
  //#THREE.ShaderChunk["linear_to_gamma_fragment"]
  //#THREE.ShaderChunk["fog_fragment"]
}

```


## Known Issues

 * The Automatic Uniforms Generator cannot understand the difference between a Color vec3/vec4 and a normal one. Generated uniforms will always be mapped to THREE.Vector3 objects.
 * The Automatic Uniforms Generator has not been tested with all possible uniform types (especially Vectors of Matrices and similar), if you find a bug please let me know using the bug tracker.


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
 * 2014-04-08   v0.1.3   Now escaping quotes from glsl, comments with quotes will not break the js. Added jsunit test cases.
 * 2014-03-18   v0.1.2   Fixed task name
 * 2014-03-18   v0.1.1   First stable Version
