var path = require('path');

module.exports = function(grunt) {
  grunt.initConfig({
    'pkg': grunt.file.readJSON('package.json'),
    'tsc': {
      options: {
        tscPath: path.resolve('node_modules', 'typescript', 'bin', 'tsc')
      },
      // the default target will run tsc in the directory the Gruntfile.js is in,
      // and tsc will find the tsconfig.json in the project root, so there's no
      // need to specify a project path
      default: {}
    }
  });

  grunt.loadNpmTasks('grunt-tsc');
  
  grunt.registerTask('default', ['tsc']);
};
