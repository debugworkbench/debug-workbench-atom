// Copyright (c) 2015 Vadim Macagon
// MIT License, see LICENSE file for full terms.

import { Disposable } from 'atom';
import {
  INotificationPresenter, INotificationOptions, IErrorNotificationOptions
} from '@debug-workbench/core-components';

/** Displays notifications to the user. */
export default class NotificationPresenter implements INotificationPresenter {
  success(message: string, options?: INotificationOptions): void {
    options = options || {};
    atom.notifications.addSuccess(message, { detail: options.detail });
  }

  info(message: string, options?: INotificationOptions): void {
    options = options || {};
    atom.notifications.addInfo(message, { detail: options.detail });
  }

  warning(message: string, options?: INotificationOptions): void {
    options = options || {};
    atom.notifications.addWarning(message, { detail: options.detail });
  }

  error(message: string, options?: IErrorNotificationOptions): void {
    options = options || {};
    atom.notifications.addError(message, {
      stack: options.stack, detail: options.detail, dismissable: true
    });
  }
}
