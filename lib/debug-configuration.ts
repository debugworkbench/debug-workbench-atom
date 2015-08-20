// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { DebugConfigurationElement } from 'debug-workbench-core-components/debug-configuration/debug-configuration';
import { importHref } from './utils';
import * as path from 'path';

/** Integrates DebugConfigurationElement into Atom. */
export class DebugConfiguration {
  private element: DebugConfigurationElement;
  private modalPanel: AtomCore.Panel;
  
  static initialize(packagePath: string): Promise<void> {
    const elementPath = path.join(
      packagePath, 'node_modules', 'debug-workbench-core-components', 'debug-configuration', 'debug-configuration.html'
    );
    return importHref(elementPath)
    .then(() => {
      Polymer(DebugConfigurationElement.prototype);
      atom.views.addViewProvider(DebugConfiguration, (model: DebugConfiguration) => {
        return <any> document.createElement('debug-configuration');
      });
    })
  }
  
  constructor(serializedState: any) {
    this.element = <any> atom.views.getView(this);
    // TODO: setup the element, subscribe the model to events on the element
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
    if (this.modalPanel) {
      if (this.modalPanel.isVisible()) {
        this.element.close();
        this.modalPanel.hide();
      } else {
        this.modalPanel.show();
        this.element.open();
      }
    }
  }
}
