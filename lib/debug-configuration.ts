// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { CompositeDisposable } from 'atom';
import { IDebugConfigElement, IDebugConfig, debugEngineProvider } from 'debug-workbench-core-components';
import { importHref } from './utils';
import * as path from 'path';

/** Integrates DebugConfigurationElement into Atom. */
export default class DebugConfiguration {
  private subscriptions: CompositeDisposable;
  private modalPanel: AtomCore.Panel;
  
  static create(debugConfig: IDebugConfig): Promise<DebugConfiguration> {
    return Promise.resolve().then(() => {
      return debugEngineProvider.getEngine(debugConfig.engine).createConfigElement(debugConfig);
    })
    .then((element) => new DebugConfiguration(element));
  }
  
  constructor(private element: IDebugConfigElement) {
    // prevent Atom from hijacking keyboard input so that backspace etc. work as expected
    element.classList.add('native-key-bindings');
    // hook up the element to the panel so that opening/closing the element shows/hides the panel
    this.subscriptions = new CompositeDisposable(
      element.onOpened(() => this.modalPanel.show()),
      element.onClosed(() => this.modalPanel.hide())
    );
    this.modalPanel = atom.workspace.addModalPanel({ item: this.element, visible: false });
  }

  /** Tear down any state and detach. */
  destroy(): void {
    if (this.subscriptions) {
      this.subscriptions.dispose();
      this.subscriptions = null;
    }
    if (this.modalPanel) {
      this.modalPanel.destroy();
      this.modalPanel = null;
    }
    if (this.element) {
      this.element.destroy();
      this.element = null;
    }
  }
  
  show(): void {
    this.element.open();
  }
  
  hide(): void {
    this.element.close();
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
