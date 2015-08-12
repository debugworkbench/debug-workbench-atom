// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

/** Integrates DebugConfigurationElement into Atom. */
export class DebugConfiguration {
  constructor(serializedState: any) {

  }

  /** Returns an object that can be retrieved when package is activated. */
  serialize(): any {
    return null;
  }

  /** Tear down any state and detach. */
  destroy(): void {
  }
}
