// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { Disposable } from 'atom';
import { INotificationPresenter } from '@debug-workbench/core-components';

/** Displays notifications to the user. */
export default class NotificationPresenter implements INotificationPresenter {
  success(message: string): void {
    atom.notifications.addSuccess(message);
  }
  
  info(message: string): void {
    atom.notifications.addInfo(message);
  }
  
  warning(message: string): void {
    atom.notifications.addWarning(message);
  }
  
  error(message: string): void {
    atom.notifications.addError(message);
  }
}
