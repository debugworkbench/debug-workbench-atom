// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { CompositeDisposable } from 'atom';
import { IDebugToolbarElement } from 'debug-workbench-core-components/debug-toolbar/debug-toolbar';
import { importHref } from './utils';
import * as path from 'path';

/** Integrates DebugToolbarElement into Atom. */
export default class DebugToolbar {
  private panel: AtomCore.Panel;
    
  constructor(private element: IDebugToolbarElement) {
    // prevent Atom from hijacking keyboard input so that backspace etc. work as expected
    element.classList.add('native-key-bindings');
    this.panel = atom.workspace.addTopPanel({ item: this.element, visible: false });
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
