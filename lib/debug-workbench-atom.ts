// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import DebugToolbar from './debug-toolbar';
import DebugConfigDialog from './debug-configuration';
import NewDebugConfigDialogElement from 'debug-workbench-core-components/new-debug-config-dialog/new-debug-config-dialog';
import { CompositeDisposable } from 'atom';
import { importHref } from './utils';
import * as path from 'path';
import * as fs from 'fs';
import * as debugWorkbench from 'debug-workbench-core-components/lib/debug-workbench';
import { IDebugConfig } from 'debug-workbench-core-components/lib/debug-engine';
import ElementFactory from './element-factory';
import DebugConfigManager from 'debug-workbench-core-components/lib/debug-config-manager';

var _debugToolbar: DebugToolbar;
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

/**
 * Display a dialog that lets the user create a new debug configuration.
 * 
 * @return A promise that will either be resolved with a new debug configuration,
 *         or with null if the user cancelled the operation.
 */
function createDebugConfig(): Promise<IDebugConfig> {
  return new Promise<IDebugConfig>((resolve, reject) => {
    NewDebugConfigDialogElement.create()
    .then((element) => {
      // prevent Atom from hijacking keyboard input so that backspace etc. work as expected
      element.classList.add('native-key-bindings');
      const panel = atom.workspace.addModalPanel({ item: element, visible: false });
      const subscriptions = new CompositeDisposable();
      subscriptions.add(element.onClosed((debugConfig: IDebugConfig) => {
        subscriptions.dispose();
        panel.destroy();
        element.destroy();
        resolve(debugConfig);
      }));
      element.open();
      panel.show();
    });
  });
}

function getDebugConfig(configName?: string): Promise<IDebugConfig> {
  return Promise.resolve().then(() => {
    return configName ? debugWorkbench.debugConfigs.get(configName) : createDebugConfig();
  })
}

/**
 * Open a dialog that lets the user edit a debug configuration.
 * 
 * @param configName Name of the debug configuration to edit, if this argument is omitted
 *                   the user will be prompted to create a new configuration that will
 *                   then be displayed for editing.
 */
function openDebugConfig(configName?: string): void {
  getDebugConfig(configName)
  .then((debugConfig) => {
    if (debugConfig) {
      return DebugConfigDialog.create(debugConfig)
      .then((dialog) => dialog.show());
    }
  })
  .catch((error) => {
    throw error;
  });
}

export function activate(state: any): void {
  const packagePath = atom.packages.getLoadedPackage('debug-workbench-atom').path;
  const elementFactory = new ElementFactory(packagePath);
  // manually add the initial set of custom elements to the element factory,
  // any dependencies will be added automatically
  elementFactory.addElementPath('debug-configuration');
  elementFactory.addElementPath('debug-workbench-debug-toolbar', path.join('debug-toolbar', 'debug-toolbar.html'));
  elementFactory.addElementPath('debug-workbench-new-debug-config-dialog', path.join('new-debug-config-dialog', 'new-debug-config-dialog.html'));
  
  const debugConfigsPath = path.join(atom.getConfigDirPath(), 'DebugWorkbenchDebugConfigs.json'); 
  const debugConfigManager = new DebugConfigManager(debugConfigsPath);
  // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
  subscriptions = new CompositeDisposable();
    
  generateTheme(packagePath);

  debugWorkbench.activate({ openDebugConfig, elementFactory, debugConfigManager });

  elementFactory.initialize()
  .then(() => debugConfigManager.load())
  .then(() => importHref(path.join(packagePath, 'static', 'theme.html')))
  .then(() => DebugToolbar.create())
  .then((debugToolbar) => {
    _debugToolbar = debugToolbar;
    
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
  if (_debugToolbar) {
    _debugToolbar.destroy();
  }
  debugWorkbench.deactivate();
}

export function serialize(): any {
  return  { };
}

export function toggle(): void {
  if (packageReady && _debugToolbar) {
    _debugToolbar.toggle();
  }
}
