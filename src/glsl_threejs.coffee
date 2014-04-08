###
 * grunt-glsl-threejs
 * https://github.com/unit9IT/grunt-glsl-threejs
 *
 * Copyright (c) 2014 Daniele Pelagatti
 * Licensed under the MIT license.
###

'use strict';

onData = (x)->
	console.log('ast of', x.type)

extractAdditionalUniforms = (shaderArray,destination = [])->
	for i in [shaderArray.length-1..0] by -1
		line = shaderArray[i];

		ind = line.split("//#UNIFORM ")
		if ind.length > 1
			destination.push( '\t\t'+ind.join("")+',\r\n' )
			shaderArray.splice(i,1)
	null;

extractUniformLibs = (shaderArray,destination = [])->
	for i in [shaderArray.length-1..0] by -1
		line = shaderArray[i];

		ind = line.split("//#UNIFORMLIB ")
		if ind.length > 1
			destination.push( '\t\t'+ind.join("")+',\r\n' )
			shaderArray.splice(i,1)
	null;

extractUniforms = (shaderArray,destination = {})->
	for line in shaderArray
		if line.indexOf("uniform ") != -1
			arr = line.split("uniform ")[1].split(" ")

			nam = ""
			for i in [1...arr.length] by 1
				nam += arr[i]
			semicolonInd = nam.indexOf(";");
			nam = nam.substr(0,semicolonInd);

			destination[ nam ] = arr[0]
	return destination;


stripTHREE = (line)->
	ind = line.split("//#THREE")
	if ind.length == 1
		return '\t\t\''+line.split("'").join("\\'")+'\','
	else
		return '\t\t'+ind.join("THREE")+","

stripEmptyLines = (shaderArray)->
	for i in [shaderArray.length-1..0] by -1
		line = shaderArray[i];
		if line == ""
			shaderArray.splice(i,1)
	null;

parseUniform = (name,type)->

	if name.indexOf("[") == -1

		switch type
			when "float"
				return '"'+name+'" : { type: "f", value: -1 }'
			when "int"
				return '"'+name+'" : { type: "i", value: 0 }'
			when "bool"
				return '"'+name+'" : { type: "i", value: 0 }'				
			when "sampler2D"
				return '"'+name+'" : { type: "t", value: null }'
			when "vec4"
				return '"'+name+'" : { type: "v4", value: new THREE.Vector4( 0, 0, 0, 0 ) }'
			when "vec3"
				return '"'+name+'" : { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) }'
			when "vec2"
				return '"'+name+'" : { type: "v2", value: new THREE.Vector2( 0, 0 ) }'
			when "mat4"
				return '"'+name+'" : { type: "m4", value: new THREE.Matrix4( ) }'
			when "mat3"
				return '"'+name+'" : { type: "m3", value: new THREE.Matrix3( ) }'
	else
		name = name.substr(0,name.indexOf("["));

		switch type
			when "float"
				return '"'+name+'" : { type: "fv", value: [] }'
			when "int"
				return '"'+name+'" : { type: "iv", value: [] }'
			when "bool"
				return '"'+name+'" : { type: "iv", value: [] }'
			when "sampler2D"
				return '"'+name+'" : { type: "tv", value: [] }'
			when "vec4"
				return '"'+name+'" : { type: "v4v", value: [] }'
			when "vec3"
				return '"'+name+'" : { type: "v3v", value: [] }'
			when "vec2"
				return '"'+name+'" : { type: "v2v", value: [] }'
			when "mat4"
				return '"'+name+'" : { type: "m4v", value: [] }'
			when "mat3"
				return '"'+name+'" : { type: "m3v", value: [] }'


	null;

module.exports = (grunt)->
	grunt.registerMultiTask 'glsl_threejs', 'A Compiler for GLSL Shaders', ()->
		

		isWin = /^win/.test(process.platform);

		options = @options
			lineEndings : if isWin then "\r\n" else "\n";
			jsPackage : "THREE"



		this.files.forEach (f)->

			outFile = "";

			# Concat specified files.
			src = f.src.filter (filepath)->
					# Warn on and remove invalid source files (if nonull was set).
					if (!grunt.file.exists(filepath))
						grunt.log.warn('Source file "' + filepath + '" not found.');
						return false;
					else
						return true;

			names = [];
			groups = [];
			for path,i in src
				splt = path.split("/")
				splt2 = splt[splt.length-1].split(".")
				name = splt2[0];
				ext = splt2[1];
				ind = names.indexOf(name)
				if ind != -1
					switch ext
						when "vert"
							groups[ind].vertexShader = path;
						when "frag"
							groups[ind].fragmentShader = path;
				else
					names.push(name);
					switch ext
						when "vert"
							groups.push({vertexShader: path});
						when "frag"
							groups.push({fragmentShader: path});

			
			for group in groups
				if !group.fragmentShader?
					grunt.log.warn('Shader "'+ group.vertexShader+'" is missing Fragment Shader, skipping');
					continue;
				if !group.vertexShader?
					grunt.log.warn('Shader "'+ group.fragmentShader+'" is missing Vertex Shader, skipping');
					continue;

				if group.vertexShader? && group.fragmentShader?
					vs = grunt.util.normalizelf( grunt.file.read(group.vertexShader) );
					vsArr = vs.split(options.lineEndings);
					stripEmptyLines(vsArr)

					fs = grunt.util.normalizelf( grunt.file.read(group.fragmentShader) );
					fsArr = fs.split(options.lineEndings);
					stripEmptyLines(fsArr)

					additionalUniforms = []
					extractAdditionalUniforms(vsArr,additionalUniforms)
					
					uniformLibs = []
					extractUniformLibs(vsArr,uniformLibs)

					
					uniforms = {};
					extractUniforms(vsArr,uniforms);
					extractUniforms(fsArr,uniforms);

					shaderName = group.vertexShader.split("/");
					shaderName = shaderName[shaderName.length-1].split(".")[0];

					# js_shader = "if ("+options.jsPackage+" == null) {\n"
					# js_shader += "var "+options.jsPackage+" = {};\n"
					# js_shader += "}\n"

					js_shader = options.jsPackage+"."+shaderName+" = {\n";
					js_shader += "\tuniforms: THREE.UniformsUtils.merge([\n";
					
					for uniformLib in uniformLibs
						js_shader += uniformLib;

					js_shader += "\t\t{\n";

					for additionalUniform in additionalUniforms
						js_shader += additionalUniform;

					for uniformName of uniforms
						js_shader += "\t\t"+parseUniform(uniformName,uniforms[uniformName])+",\n"
						

					js_shader += "\t\t}\n";
					js_shader += "\t]),\n";
					js_shader += "\tvertexShader: [\n"


					vsArr = vsArr.map(stripTHREE)

					vs = vsArr.join(options.lineEndings);
					js_shader += vs.substr(0,vs.length-1);

					js_shader += "].join(\"\\n\"),\n"
					js_shader += "\tfragmentShader: [\n"


					fsArr = fsArr.map(stripTHREE)
					fs = fsArr.join(options.lineEndings);

					js_shader += fs.substr(0,fs.length-1);

					js_shader += "].join(\"\\n\")\n"
					js_shader += "};";

					outFile += js_shader+"\n";



			if outFile.length > 0 
				grunt.file.write(f.dest, outFile);

				#Print a success message.
				grunt.log.writeln('File "' + f.dest + '" created.');
			else
				grunt.log.writeln('No File was created');

				