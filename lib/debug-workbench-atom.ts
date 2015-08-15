// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { DebugConfiguration } from './debug-configuration';
import { DebugConfigurationElement } from 'debug-workbench-core-components/debug-configuration/debug-configuration';
import { CompositeDisposable } from 'atom';
import * as path from 'path';
import * as fs from 'fs';

var debugConfiguration: DebugConfiguration;
var modalPanel: AtomCore.Panel;
var subscriptions: CompositeDisposable;

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

function importWebComponent(href: string): Promise<void> {
  // TODO: Check if the browser will dedupe imports or if we need to keep track of all previously
  //       loaded elements to ensure each element is only loaded once.
  return new Promise<void>((resolve, reject) => {
    // TODO: Could probably just replace with the stuff below with this line, it does almost the
    // same thing (though it'll call resolve(event) instead of just resolve()).
    //Polymer.Base.importHref(href, resolve, reject);
    let link = document.createElement('link');
    link.href = href;
    link.rel = 'import';
    link.onload = (event: Event) => resolve();
    link.onerror = (event: Event) => reject(event);
    document.head.appendChild(link);
  });
}

export function activate(state: any): void {
  // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
  subscriptions = new CompositeDisposable();

  // register custom elements
  let packagePath = atom.packages.getLoadedPackage('debug-workbench-atom').path;
    
  generateTheme(packagePath);
  
  let elementPath = path.join(
    packagePath, 'node_modules', 'debug-workbench-core-components', 'debug-configuration', 'debug-configuration.html'
  );
  importWebComponent(path.join(packagePath, 'static', 'theme.html'))
  .catch((event: Event) => {
    subscriptions.add(atom.notifications.addError("static/theme.html couldn't be imported!"));
    console.error(event);
  })
  .then(() => {
    return importWebComponent(elementPath);
  })
  .then(() => {
    subscriptions.add(atom.notifications.addSuccess('debug-configuration element imported!'));
  })
  .catch((event: Event) => {
    subscriptions.add(atom.notifications.addError("debug-configuration element couldn't be imported!"));
    console.error(event);
  })
  .then(() => {
    atom.views.addViewProvider(DebugConfiguration, (model: DebugConfiguration) => {
      return <any> document.createElement('debug-configuration');
    });
    debugConfiguration = new DebugConfiguration(state.debugConfigurationState);
    let debugConfigurationElement: DebugConfigurationElement = <any> atom.views.getView(debugConfiguration);
    // TODO: setup the element, subscribe the model to events on the element
    modalPanel = atom.workspace.addModalPanel({ item: debugConfigurationElement, visible: false });

    // Register command that toggles this view
    subscriptions.add(atom.commands.add('atom-workspace', 'debug-workbench-atom:toggle', toggle));

    subscriptions.add(atom.notifications.addSuccess('DebugWorkbench loaded!'));
  });
}

export function deactivate(): void {
  if (modalPanel) {
    modalPanel.destroy();
  }
  if (subscriptions) {
    subscriptions.dispose();
  }
  if (debugConfiguration) {
    debugConfiguration.destroy();
  }
}

export function serialize(): any {
  return  { debugConfigurationState: debugConfiguration.serialize() };
}

export function toggle(): void {
  console.log('DebugWorkbenchAtom was toggled!');

  if (modalPanel) {
    if (modalPanel.isVisible()) {
      modalPanel.hide();
    } else {
      modalPanel.show();
    }
  }
}
