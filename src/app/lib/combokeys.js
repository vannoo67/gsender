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

import events from 'events';
import Mousetrap from 'mousetrap';
import log from './log';
import { preventDefault } from './dom-events';

import { modifierKeys } from './constants';

import store from '../store';

const STOP_CMD = 'STOP_JOG';

const BUGGED_KEYS = [
    {
        id: 0,
        code: 'NumpadAdd',
        key: '+',
    },
    {
        id: 1,
        code: 'NumpadMultiply',
        key: '*',
    },
];

/**
 * Function to handle bugged keys not firing on keyups in mousetrap,
 * if these keys are attached to a Jog command, it is important that they have
 * keyups to prevent the machine from jogging non-stop
 */
const buggedKeysHandler = (e) => {
    for (const item of BUGGED_KEYS) {
        if (item.code === e.code) {
            combokeys.emit(STOP_CMD, e, null);
        }
    }
};

class Combokeys extends events.EventEmitter {
    state = {
        didBindEvents: false
    };

    commandKeys = store.get('commandKeys', []);

    list = [];

    constructor(options = {}) {
        super();

        if (options.autoBind) {
            this.bind();
        }
    }

    bind() {
        if (this.state.didBindEvents) {
            return;
        }
        this.commandKeys.forEach((o) => {
            const { keys, cmd, payload = {} } = o;
            const callback = (event) => {
                log.debug(`combokeys: keys=${keys} cmd=${cmd} payload=${JSON.stringify(payload)}`);
                if (!!o.preventDefault) {
                    preventDefault(event);
                }
                this.emit(cmd, event, payload);
            };

            //Add keyup listeners for jogging events
            if (cmd === 'JOG') {
                const callback = (event) => {
                    log.debug(`combokeys: keys=${keys} cmd=${STOP_CMD} payload=${JSON.stringify(payload)}`);
                    if (!!o.preventDefault) {
                        preventDefault(event);
                    }
                    this.emit(STOP_CMD, event, payload);
                };

                const modiferKeyCB = (e) => {
                    if (!!o.preventDefault) {
                        preventDefault(e);
                    }

                    this.emit(STOP_CMD, e, null);
                };

                //Listen for keyups on individual keys, for example,
                //if jogging is shift+arrowup and the user lets go of one key and not the other,
                //this should trigger STOP_JOG
                if (keys.includes('+')) {
                    const keysArr = keys.split('+');
                    for (const key of keysArr) {
                        if (modifierKeys.includes(key?.toLowerCase())) {
                            Mousetrap.bind(key, modiferKeyCB, 'keyup');
                        } else {
                            Mousetrap.bind(key, callback, 'keyup');
                        }
                    }
                }

                for (const item of BUGGED_KEYS) {
                    if (keys.includes(item.key)) {
                        document.addEventListener('keyup', buggedKeysHandler);
                    }
                }

                Mousetrap.bind(keys, callback, 'keyup');
            }

            Mousetrap.bind(keys, callback);
            this.list.push({ keys: keys, callback: callback });
        });
        this.state.didBindEvents = true;
    }

    unbind() {
        if (!this.state.didBindEvents) {
            return;
        }
        this.list.forEach((o) => {
            const { keys, callback } = o;
            Mousetrap.unbind(keys, callback);
        });
        this.state.didBindEvents = false;
    }

    reload() {
        this.commandKeys = store.get('commandKeys', []);

        this.reset();
        this.list = [];

        document.removeEventListener('keyup', buggedKeysHandler);

        this.bind();
    }

    reset() {
        Mousetrap.reset();
        this.state.didBindEvents = false;
    }
}

const combokeys = new Combokeys({ autoBind: true });

export default combokeys;
