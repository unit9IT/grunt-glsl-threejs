/*
 * grunt-glsl-threejs
 * https://github.com/unit9IT/grunt-glsl-threejs
 *
 * Copyright (c) 2014 Daniele Pelagatti
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {



  // Project configuration.
  grunt.initConfig({

    coffee: {
      compile: {
        files: {
          'tasks/glsl_threejs.js': 'src/glsl_threejs.coffee'
        },
        options: {
          bare: true
        }
      }
    },

    jshint: {
      pretest: {
        files : {
          src : ['Gruntfile.js','tasks/*.js','<%= nodeunit.tests %>']
        },
        options: {
          jshintrc: '.jshintrc'
        }
      },
      posttest: {
        files :{
          src : ['test/expected/*.js','tmp/*.js']
        },
        options : {
          "-W117": true, // undefined packages
          "-W069": true // dot notation
        }
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },

    // Configuration to be run (and then tested).
    glsl_threejs: {
      default_options: {
        options: {},
        files: {
          'tmp/default_options.js': ['test/fixtures/Simple1.vert', 'test/fixtures/Simple1.frag'],
        },
      },
      custom_options: {
        options: {
          jsPackage: 'MYPACKAGE'
        },
        files: {
          'tmp/custom_options.js': ['test/fixtures/Simple1.vert', 'test/fixtures/Simple1.frag'],
        },
      },

      no_vert: {
        options: {},
        files: {
          'tmp/no_vert.js': ['test/fixtures/Simple1.frag'],
        },
      },

      no_frag: {
        options: {},
        files: {
          'tmp/no_frag.js': ['test/fixtures/Simple1.vert'],
        },
      },


    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-coffee');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'glsl_threejs', 'jshint:posttest', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['coffee', 'jshint:pretest', 'test']);

};