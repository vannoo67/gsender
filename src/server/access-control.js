/*
 * Copyright (C) 2021 Sienci Labs Inc.
 *
 * This file is part of gSender.
 *
 * gSender is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, under version 3 of the License.
 *
 * gSender is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with gSender.  If not, see <https://www.gnu.org/licenses/>.
 *
 * Contact for information regarding this program and its license
 * can be sent through gSender@sienci.com or mailed to the main office
 * of Sienci Labs Inc. in Waterloo, Ontario, Canada.
 *
 */

import ensureArray from 'ensure-array';
import _ from 'lodash';
import rangeCheck from 'range_check';
//import settings from './config/settings';
import config from './services/configstore';

const whitelist = [
    // IPv4 reserved space
    '127.0.0.0/8', // Used for loopback addresses to the local host
    '10.0.0.0/8', // Used for local communications within a private network
    '172.16.0.0/12', // Used for local communications within a private network
    '192.168.0.0/16', // Used for local communications within a private network
    '169.254.0.0/16', // Link-local address

    // IPv4 mapped IPv6 address
    '::ffff:10.0.0.0/8',
    '::ffff:127.0.0.0/8',
    '::ffff:172.16.0.0/12',
    '::ffff:192.168.0.0/16',

    // IPv6 reserved space
    '::1/128', // loopback address to the local host
    'fc00::/7', // Unique local address
    'fe80::/10' // Link-local address
];

export const authorizeIPAddress = (ipaddr) => new Promise((resolve, reject) => {
    let pass = true; // TODO: Fix whitelist
    pass = pass || whitelist.some(test => rangeCheck.inRange(ipaddr, test));

    if (pass) {
        resolve();
    } else {
        reject(new Error(`Unauthorized IP address: ipaddr=${ipaddr}`));
    }
});

export const validateUser = (user) => new Promise((resolve, reject) => {
    const { id = null, name = null } = { ...user };

    const users = ensureArray(config.get('users'))
        .filter(user => _.isPlainObject(user))
        .map(user => ({
            ...user,
            // Defaults to true if not explicitly initialized
            enabled: (user.enabled !== false)
        }));
    const enabledUsers = users.filter(user => user.enabled);

    if ((enabledUsers.length === 0) || _.find(enabledUsers, { id: id, name: name })) {
        resolve();
    } else {
        reject(new Error(`Unauthorized user: user.id=${id}, user.name=${name}`));
    }
});
