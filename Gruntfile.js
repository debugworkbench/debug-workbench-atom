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
      'atom-package': {
      },
      'core-components': {
        options: {
          project: './node_modules/@debug-workbench/core-components/src'
        }
      },
      'core-components-tests': {
        options: {
          project: './node_modules/@debug-workbench/core-components/test'
        }
      },
      'debug-engine': {
        options: {
          project: './node_modules/@debug-workbench/core-components/node_modules/debug-engine/src'
        }
      },
      'gdb-mi-debug-engine': {
        options: {
          project: './node_modules/@debug-workbench/core-components/node_modules/gdb-mi-debug-engine/src'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-tsc');

  grunt.registerTask('build', [
    'tsc:debug-engine',
    'tsc:gdb-mi-debug-engine',
    'tsc:core-components',
    'tsc:atom-package'
  ]);
  grunt.registerTask('default', ['tsc:atom-package']);
};
