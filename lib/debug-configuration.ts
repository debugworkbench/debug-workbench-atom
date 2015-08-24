// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { DebugConfigurationElement } from 'debug-workbench-core-components/debug-configuration/debug-configuration';
import { importHref } from './utils';
import * as path from 'path';

/** Integrates DebugConfigurationElement into Atom. */
export class DebugConfiguration {
  private element: DebugConfigurationElement & polymer.Base;
  private modalPanel: AtomCore.Panel;
  
  static initialize(packagePath: string): Promise<void> {
    const elementPath = path.join(
      packagePath, 'node_modules', 'debug-workbench-core-components', 'debug-configuration', 'debug-configuration.html'
    );
    return importHref(elementPath)
    .then(() => {
      DebugConfigurationElement.register();
      atom.views.addViewProvider(DebugConfiguration, (model: DebugConfiguration) => {
        const element = document.createElement('debug-configuration');
        // prevent Atom from hijacking keyboard input so that backspace etc. work as expected
        element.classList.add('native-key-bindings');
        return element;
      });
    })
  }
  
  constructor(serializedState: any) {
    this.element = <any> atom.views.getView(this);
    // hook up the element to the panel so that opening/closing the element shows/hides the panel
    this.element.addEventListener('iron-overlay-opened', () => this.modalPanel.show());
    this.element.addEventListener('iron-overlay-closed', () => this.modalPanel.hide());
    this.modalPanel = atom.workspace.addModalPanel({ item: this.element, visible: false });
  }

  /** Returns an object that can be retrieved when package is activated. */
  serialize(): any {
    return null;
  }

  /** Tear down any state and detach. */
  destroy(): void {
    if (this.modalPanel) {
      this.modalPanel.destroy();
    }
  }
  
  toggle(): void {
    if (this.modalPanel && this.element) {
      if (this.modalPanel.isVisible()) {
        this.element.close();
      } else {
        this.element.open();
      }
    }
  }
}
