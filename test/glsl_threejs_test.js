'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.glsl_threejs = {
  
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  default_options: function(test) {
    test.expect(1);
    var actual = grunt.file.read('tmp/default_options.js');
    var expected = grunt.file.read('test/expected/default_options.js');
    test.equal(actual, expected, 'output file doesn\'t match expected result');

    //test.doesNotThrow(
    //  function() {
    //    /*jshint evil:true */
    //    eval(actual);
    //  }
    //);

    test.done();
  },


  custom_options: function(test) {
    test.expect(1);
    var actual = grunt.file.read('tmp/custom_options.js');
    var expected = grunt.file.read('test/expected/custom_options.js');
    test.equal(actual, expected, 'output file doesn\'t match expected result');


    //test.doesNotThrow(
    //  function() {
    //    /*jshint evil:true */
    //    eval(actual);
    //  }
    //);

    test.done();
  },


  no_vert: function(test) {
    test.expect(1);
    test.throws(
      function() {
        // no file has to be created
        grunt.file.read('tmp/no_vert.js');
      } );
    test.done();
  },


  no_frag: function(test) {
    test.expect(1);
    test.throws(
      function() {
        // no file has to be created
        grunt.file.read('tmp/no_frag.js');
      } );
    test.done();
  },


};
