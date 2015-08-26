// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { DebugConfiguration } from './debug-configuration';
import { DebugToolbar } from './debug-toolbar';
import { register as registerElementLoader } from 'debug-workbench-core-components/register-element/register-element'
import { CompositeDisposable } from 'atom';
import { importHref } from './utils';
import * as path from 'path';
import * as fs from 'fs';

var debugToolbar: DebugToolbar;
var debugConfiguration: DebugConfiguration;
var subscriptions: CompositeDisposable;
var packageReady = false;

/** Generates static/theme.html */
function generateTheme(packagePath: string): void {
  const sourcePathRegExp = new RegExp(
    'debug-workbench-atom\\' + path.sep + 'styles\\' + path.sep + 'theme-variables.less$'
  );
  const styleElements = atom.styles.getStyleElements().filter((styleElement) => {
    return sourcePathRegExp.test(styleElement.sourcePath);
  });
  // replace all the ui-variables in resources/theme-template.html with their values (as defined
  // by the current Atom theme) and write out the result to static/theme.html
  if (styleElements.length > 0) {
    const templatePath = path.join(packagePath, 'resources', 'theme-template.html');
    let template: string = fs.readFileSync(templatePath, { encoding: 'utf8' });
    // extract ui-variables values from styleElements[0].textContent
    let varMap = new Map();
    styleElements[0].textContent.replace(/(\S+)\s*:\s*(.+);$/gm, (match, name, value) => {
      varMap.set(name, value);
      return match; // shouldn't have to return anything, but the typings insist on it
    });
    // replace the variables in the template with their values
    const theme = template.replace(/(\S+)\s*:\s*@(.+);$/gm, (match, name, variable) => {
      return `${name}: ${varMap.get(variable)};`;
    });
    const themePath = path.join(packagePath, 'static', 'theme.html');
    fs.writeFileSync(themePath, theme, { encoding: 'utf8' });
  }
}

export function activate(state: any): void {
  // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
  subscriptions = new CompositeDisposable();

  // register custom elements
  const packagePath = atom.packages.getLoadedPackage('debug-workbench-atom').path;
    
  generateTheme(packagePath);
  importHref(path.join(packagePath, 'static', 'polymer-global-settings.html'))
  .then(() => importHref(path.join(
      packagePath, 'node_modules', 'debug-workbench-core-components', 'register-element', 'register-element.html'
  )))
  .then(() => registerElementLoader())
  .then(() => importHref(path.join(packagePath, 'static', 'theme.html')))
  .then(() => DebugConfiguration.initialize(packagePath))
  .then(() => DebugToolbar.initialize(packagePath))
  .then(() => {
    debugConfiguration = new DebugConfiguration(state.debugConfigurationState);
    debugToolbar = new DebugToolbar({});
    // Register command that toggles this view
    subscriptions.add(atom.commands.add('atom-workspace', 'debug-workbench-atom:toggle', toggle));
    // Atom doesn't wait for the package to finish activating before it attempts to execute
    // the toggle command, which means that the toggle command probably hasn't even been registered
    // yet when Atom tries to find it. So, we have to call toggle() here after activation finished.
    packageReady = true;
    toggle();
  })
  .catch((err) => {
    console.error(err);
  })
}

export function deactivate(): void {
  packageReady = false;
    
  if (subscriptions) {
    subscriptions.dispose();
  }
  if (debugConfiguration) {
    debugConfiguration.destroy();
  }
  if (debugToolbar) {
    debugToolbar.destroy();
  }
}

export function serialize(): any {
  return  { debugConfigurationState: debugConfiguration.serialize() };
}

export function toggle(): void {
  if (packageReady && debugToolbar) {
    debugToolbar.toggle();
  }
}
