// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { DebugToolbarElement } from 'debug-workbench-core-components/debug-toolbar/debug-toolbar';
import { importHref } from './utils';
import * as path from 'path';

/** Integrates DebugToolbarElement into Atom. */
export class DebugToolbar {
  private element: DebugToolbarElement & polymer.Base;
  private panel: AtomCore.Panel;
  
  static initialize(packagePath: string): Promise<void> {
    const elementPath = path.join(
      packagePath, 'node_modules', 'debug-workbench-core-components', 'debug-toolbar', 'debug-toolbar.html'
    );
    return importHref(elementPath)
    .then(() => {
      atom.views.addViewProvider(DebugToolbar, (model: DebugToolbar) => {
        const element = document.createElement('debug-workbench-debug-toolbar');
        // prevent Atom from hijacking keyboard input so that backspace etc. work as expected
        //element.classList.add('native-key-bindings');
        return element;
      });
    })
  }
  
  constructor(serializedState: any) {
    this.element = <any> atom.views.getView(this);
    this.panel = atom.workspace.addTopPanel({ item: this.element, visible: false });
  }

  /** Returns an object that can be retrieved when package is activated. */
  serialize(): any {
    return null;
  }

  /** Tear down any state and detach. */
  destroy(): void {
    if (this.panel) {
      this.panel.destroy();
    }
  }
  
  toggle(): void {
    if (this.panel) {
      if (this.panel.isVisible()) {
        this.panel.hide();
      } else {
        this.panel.show();
      }
    }
  }
}
