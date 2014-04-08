
/*
 * grunt-glsl-threejs
 * https://github.com/unit9IT/grunt-glsl-threejs
 *
 * Copyright (c) 2014 Daniele Pelagatti
 * Licensed under the MIT license.
 */
'use strict';
var extractAdditionalUniforms, extractUniformLibs, extractUniforms, onData, parseUniform, stripEmptyLines, stripTHREE;

onData = function(x) {
  return console.log('ast of', x.type);
};

extractAdditionalUniforms = function(shaderArray, destination) {
  var i, ind, line, _i, _ref;
  if (destination == null) {
    destination = [];
  }
  for (i = _i = _ref = shaderArray.length - 1; _i >= 0; i = _i += -1) {
    line = shaderArray[i];
    ind = line.split("//#UNIFORM ");
    if (ind.length > 1) {
      destination.push('\t\t' + ind.join("") + ',\r\n');
      shaderArray.splice(i, 1);
    }
  }
  return null;
};

extractUniformLibs = function(shaderArray, destination) {
  var i, ind, line, _i, _ref;
  if (destination == null) {
    destination = [];
  }
  for (i = _i = _ref = shaderArray.length - 1; _i >= 0; i = _i += -1) {
    line = shaderArray[i];
    ind = line.split("//#UNIFORMLIB ");
    if (ind.length > 1) {
      destination.push('\t\t' + ind.join("") + ',\r\n');
      shaderArray.splice(i, 1);
    }
  }
  return null;
};

extractUniforms = function(shaderArray, destination) {
  var arr, i, line, nam, semicolonInd, _i, _j, _len, _ref;
  if (destination == null) {
    destination = {};
  }
  for (_i = 0, _len = shaderArray.length; _i < _len; _i++) {
    line = shaderArray[_i];
    if (line.indexOf("uniform ") !== -1) {
      arr = line.split("uniform ")[1].split(" ");
      nam = "";
      for (i = _j = 1, _ref = arr.length; _j < _ref; i = _j += 1) {
        nam += arr[i];
      }
      semicolonInd = nam.indexOf(";");
      nam = nam.substr(0, semicolonInd);
      destination[nam] = arr[0];
    }
  }
  return destination;
};

stripTHREE = function(line) {
  var ind;
  ind = line.split("//#THREE");
  if (ind.length === 1) {
    return '\t\t\'' + line.split("'").join("\\'") + '\',';
  } else {
    return '\t\t' + ind.join("THREE") + ",";
  }
};

stripEmptyLines = function(shaderArray) {
  var i, line, _i, _ref;
  for (i = _i = _ref = shaderArray.length - 1; _i >= 0; i = _i += -1) {
    line = shaderArray[i];
    if (line === "") {
      shaderArray.splice(i, 1);
    }
  }
  return null;
};

parseUniform = function(name, type) {
  if (name.indexOf("[") === -1) {
    switch (type) {
      case "float":
        return '"' + name + '" : { type: "f", value: -1 }';
      case "int":
        return '"' + name + '" : { type: "i", value: 0 }';
      case "bool":
        return '"' + name + '" : { type: "i", value: 0 }';
      case "sampler2D":
        return '"' + name + '" : { type: "t", value: null }';
      case "vec4":
        return '"' + name + '" : { type: "v4", value: new THREE.Vector4( 0, 0, 0, 0 ) }';
      case "vec3":
        return '"' + name + '" : { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) }';
      case "vec2":
        return '"' + name + '" : { type: "v2", value: new THREE.Vector2( 0, 0 ) }';
      case "mat4":
        return '"' + name + '" : { type: "m4", value: new THREE.Matrix4( ) }';
      case "mat3":
        return '"' + name + '" : { type: "m3", value: new THREE.Matrix3( ) }';
    }
  } else {
    name = name.substr(0, name.indexOf("["));
    switch (type) {
      case "float":
        return '"' + name + '" : { type: "fv", value: [] }';
      case "int":
        return '"' + name + '" : { type: "iv", value: [] }';
      case "bool":
        return '"' + name + '" : { type: "iv", value: [] }';
      case "sampler2D":
        return '"' + name + '" : { type: "tv", value: [] }';
      case "vec4":
        return '"' + name + '" : { type: "v4v", value: [] }';
      case "vec3":
        return '"' + name + '" : { type: "v3v", value: [] }';
      case "vec2":
        return '"' + name + '" : { type: "v2v", value: [] }';
      case "mat4":
        return '"' + name + '" : { type: "m4v", value: [] }';
      case "mat3":
        return '"' + name + '" : { type: "m3v", value: [] }';
    }
  }
  return null;
};

module.exports = function(grunt) {
  return grunt.registerMultiTask('glsl_threejs', 'A Compiler for GLSL Shaders', function() {
    var isWin, options;
    isWin = /^win/.test(process.platform);
    options = this.options({
      lineEndings: isWin ? "\r\n" : "\n",
      jsPackage: "THREE"
    });
    return this.files.forEach(function(f) {
      var additionalUniform, additionalUniforms, ext, fs, fsArr, group, groups, i, ind, js_shader, name, names, outFile, path, shaderName, splt, splt2, src, uniformLib, uniformLibs, uniformName, uniforms, vs, vsArr, _i, _j, _k, _l, _len, _len1, _len2, _len3;
      outFile = "";
      src = f.src.filter(function(filepath) {
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      });
      names = [];
      groups = [];
      for (i = _i = 0, _len = src.length; _i < _len; i = ++_i) {
        path = src[i];
        splt = path.split("/");
        splt2 = splt[splt.length - 1].split(".");
        name = splt2[0];
        ext = splt2[1];
        ind = names.indexOf(name);
        if (ind !== -1) {
          switch (ext) {
            case "vert":
              groups[ind].vertexShader = path;
              break;
            case "frag":
              groups[ind].fragmentShader = path;
          }
        } else {
          names.push(name);
          switch (ext) {
            case "vert":
              groups.push({
                vertexShader: path
              });
              break;
            case "frag":
              groups.push({
                fragmentShader: path
              });
          }
        }
      }
      for (_j = 0, _len1 = groups.length; _j < _len1; _j++) {
        group = groups[_j];
        if (group.fragmentShader == null) {
          grunt.log.warn('Shader "' + group.vertexShader + '" is missing Fragment Shader, skipping');
          continue;
        }
        if (group.vertexShader == null) {
          grunt.log.warn('Shader "' + group.fragmentShader + '" is missing Vertex Shader, skipping');
          continue;
        }
        if ((group.vertexShader != null) && (group.fragmentShader != null)) {
          vs = grunt.util.normalizelf(grunt.file.read(group.vertexShader));
          vsArr = vs.split(options.lineEndings);
          stripEmptyLines(vsArr);
          fs = grunt.util.normalizelf(grunt.file.read(group.fragmentShader));
          fsArr = fs.split(options.lineEndings);
          stripEmptyLines(fsArr);
          additionalUniforms = [];
          extractAdditionalUniforms(vsArr, additionalUniforms);
          uniformLibs = [];
          extractUniformLibs(vsArr, uniformLibs);
          uniforms = {};
          extractUniforms(vsArr, uniforms);
          extractUniforms(fsArr, uniforms);
          shaderName = group.vertexShader.split("/");
          shaderName = shaderName[shaderName.length - 1].split(".")[0];
          js_shader = options.jsPackage + "." + shaderName + " = {\n";
          js_shader += "\tuniforms: THREE.UniformsUtils.merge([\n";
          for (_k = 0, _len2 = uniformLibs.length; _k < _len2; _k++) {
            uniformLib = uniformLibs[_k];
            js_shader += uniformLib;
          }
          js_shader += "\t\t{\n";
          for (_l = 0, _len3 = additionalUniforms.length; _l < _len3; _l++) {
            additionalUniform = additionalUniforms[_l];
            js_shader += additionalUniform;
          }
          for (uniformName in uniforms) {
            js_shader += "\t\t" + parseUniform(uniformName, uniforms[uniformName]) + ",\n";
          }
          js_shader += "\t\t}\n";
          js_shader += "\t]),\n";
          js_shader += "\tvertexShader: [\n";
          vsArr = vsArr.map(stripTHREE);
          vs = vsArr.join(options.lineEndings);
          js_shader += vs.substr(0, vs.length - 1);
          js_shader += "].join(\"\\n\"),\n";
          js_shader += "\tfragmentShader: [\n";
          fsArr = fsArr.map(stripTHREE);
          fs = fsArr.join(options.lineEndings);
          js_shader += fs.substr(0, fs.length - 1);
          js_shader += "].join(\"\\n\")\n";
          js_shader += "};";
          outFile += js_shader + "\n";
        }
      }
      if (outFile.length > 0) {
        grunt.file.write(f.dest, outFile);
        return grunt.log.writeln('File "' + f.dest + '" created.');
      } else {
        return grunt.log.writeln('No File was created');
      }
    });
  });
};
