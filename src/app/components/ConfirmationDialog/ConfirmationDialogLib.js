/*
 *     This file is part of gSender.
 *
 *     gSender is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     gSender is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with gSender.  If not, see <https://www.gnu.org/licenses/>.
 */

import pubsub from 'pubsub-js';

export const DIALOG_CONFIRM = 'confirm';
export const DIALOG_CANCEL = 'cancel';
export const DIALOG_INVERT = 'invert';

export const Confirm = (options = {}) => {
    const {
        title = 'Confirm',
        buttons = [],
        content = 'Are you sure you want to do this?',
        onClose = null,
        onConfirm = null,
        confirmLabel = 'Confirm',
        cancelLabel = 'Cancel'
    } = options;
    pubsub.publish('dialog:new', {
        title: title,
        buttons: buttons,
        content: content,
        onClose: onClose,
        onConfirm: onConfirm,
        confirmLabel: confirmLabel,
        cancelLabel: cancelLabel
    });
};
