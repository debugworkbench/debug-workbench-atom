# debug-workbench-atom package (discontinued)

Debug Workbench is an extensible debugging framework, and this package was meant to integrate it
into the Atom editor. However, this proved to be overly tedious, so the integration has been
dropped. Development focus has now switched to a [standalone Electron-based application](https://github.com/debugworkbench/hydragon). 

Development
===========

Prerequisites
-------------
- NPM
- Grunt
- TSD

Setup
-----
1. Run `npm install` to install dependencies.
2. Run `grunt tsc` to build.

If you plan to make changes to depedencies consider using `npm link`.
