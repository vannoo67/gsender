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
import noop from 'lodash/noop';
import SerialPort from 'serialport';
import socketIO from 'socket.io';
import socketioJwt from 'socketio-jwt';
import EventTrigger from '../../lib/EventTrigger';
import logger from '../../lib/logger';
import settings from '../../config/settings';
import store from '../../store';
import config from '../configstore';
import taskRunner from '../taskrunner';
import {
    GrblController
} from '../../controllers';
import { GRBL } from '../../controllers/Grbl/constants';
import {
    authorizeIPAddress,
    validateUser
} from '../../access-control';

const log = logger('service:cncengine');

// Case-insensitive equality checker.
// @param {string} str1 First string to check.
// @param {string} str2 Second string to check.
// @return {boolean} True if str1 and str2 are the same string, ignoring case.
const caseInsensitiveEquals = (str1, str2) => {
    str1 = str1 ? (str1 + '').toUpperCase() : '';
    str2 = str2 ? (str2 + '').toUpperCase() : '';
    return str1 === str2;
};

const isValidController = (controller) => caseInsensitiveEquals(GRBL, controller);

class CNCEngine {
    controllerClass = {};

    listener = {
        taskStart: (...args) => {
            if (this.io) {
                this.io.emit('task:start', ...args);
            }
        },
        taskFinish: (...args) => {
            if (this.io) {
                this.io.emit('task:finish', ...args);
            }
        },
        taskError: (...args) => {
            if (this.io) {
                this.io.emit('task:error', ...args);
            }
        },
        configChange: (...args) => {
            if (this.io) {
                this.io.emit('config:change', ...args);
            }
        }
    };

    server = null;

    io = null;

    sockets = [];

    // File content and metadata
    gcode = null;
    meta = null;

    // Event Trigger
    event = new EventTrigger((event, trigger, commands) => {
        log.debug(`EventTrigger: event="${event}", trigger="${trigger}", commands="${commands}"`);
        if (trigger === 'system') {
            taskRunner.run(commands);
        }
    });

    // @param {object} server The HTTP server instance.
    // @param {string} controller Specify CNC controller.
    start(server, controller = '') {
        // Fallback to an empty string if the controller is not valid
        if (!isValidController(controller)) {
            controller = '';
        }

        // Grbl
        if (!controller || caseInsensitiveEquals(GRBL, controller)) {
            this.controllerClass[GRBL] = GrblController;
        }

        if (Object.keys(this.controllerClass).length === 0) {
            throw new Error(`No valid CNC controller specified (${controller})`);
        }

        const loadedControllers = Object.keys(this.controllerClass);
        log.debug(`Loaded controllers: ${loadedControllers}`);

        this.stop();

        taskRunner.on('start', this.listener.taskStart);
        taskRunner.on('finish', this.listener.taskFinish);
        taskRunner.on('error', this.listener.taskError);
        config.on('change', this.listener.configChange);

        // System Trigger: Startup
        this.event.trigger('startup');

        this.server = server;
        this.io = socketIO(this.server, {
            serveClient: true,
            path: '/socket.io',
            pingTimeout: 60000,
            pingInterval: 25000,
            maxHttpBufferSize: 40e6
        });

        this.io.use(socketioJwt.authorize({
            secret: settings.secret,
            handshake: true
        }));

        this.io.use(async (socket, next) => {
            try {
                // IP Address Access Control
                const ipaddr = socket.handshake.address;
                await authorizeIPAddress(ipaddr);

                // User Validation
                const user = socket.decoded_token || {};
                await validateUser(user);
            } catch (err) {
                log.warn(err);
                next(err);
                return;
            }

            next();
        });

        this.io.on('connection', (socket) => {
            const address = socket.handshake.address;
            const user = socket.decoded_token || {};
            log.debug(`New connection from ${address}: id=${socket.id}, user.id=${user.id}, user.name=${user.name}`);

            // Add to the socket pool
            this.sockets.push(socket);

            socket.emit('startup', {
                loadedControllers: Object.keys(this.controllerClass),

                // User-defined baud rates and ports
                baudrates: ensureArray(config.get('baudrates', [])),
                ports: ensureArray(config.get('ports', []))
            });

            socket.on('disconnect', () => {
                log.debug(`Disconnected from ${address}: id=${socket.id}, user.id=${user.id}, user.name=${user.name}`);

                const controllers = store.get('controllers', {});
                Object.keys(controllers).forEach(port => {
                    const controller = controllers[port];
                    if (!controller) {
                        return;
                    }
                    controller.removeConnection(socket);
                });

                // Remove from socket pool
                this.sockets.splice(this.sockets.indexOf(socket), 1);
            });

            // List the available serial ports
            socket.on('list', () => {
                log.debug(`socket.list(): id=${socket.id}`);

                SerialPort.list()
                    .then(ports => {
                        ports = ports.concat(ensureArray(config.get('ports', [])));

                        // Filter ports by productId to avoid non-arduino devices from appearing
                        const validProductIDs = ['6015', '6001', '606D', '003D', '0043', '2341', '7523', 'EA60', '2303'];
                        const validVendorIDs = ['1D50', '0403', '2341', '0042', '1A86', '10C4', '067B'];
                        ports = ports.filter(port => validProductIDs.includes(port.productId));
                        ports = ports.filter(port => validVendorIDs.includes(port.vendorId));

                        const controllers = store.get('controllers', {});
                        const portsInUse = Object.keys(controllers)
                            .filter(port => {
                                const controller = controllers[port];
                                return controller && controller.isOpen();
                            });

                        ports = ports.map(port => {
                            return {
                                port: port.comName,
                                manufacturer: port.manufacturer,
                                inuse: portsInUse.indexOf(port.comName) >= 0
                            };
                        });

                        socket.emit('serialport:list', ports);
                    })
                    .catch(err => {
                        log.error(err);
                    });
            });

            // Open serial port
            socket.on('open', (port, options, callback = noop) => {
                if (typeof callback !== 'function') {
                    callback = noop;
                }

                log.debug(`socket.open("${port}", ${JSON.stringify(options)}): id=${socket.id}`);

                let controller = store.get(`controllers["${port}"]`);
                if (!controller) {
                    let { controllerType = GRBL, baudrate, rtscts } = { ...options };

                    const Controller = this.controllerClass[controllerType];
                    if (!Controller) {
                        const err = `Not supported controller: ${controllerType}`;
                        log.error(err);
                        callback(new Error(err));
                        return;
                    }

                    const engine = this;
                    controller = new Controller(engine, {
                        port: port,
                        baudrate: baudrate,
                        rtscts: !!rtscts
                    });
                }

                controller.addConnection(socket);
                // Load file to controller if it exists
                if (this.hasFileLoaded()) {
                    controller.loadFile(this.gcode, this.meta);
                } else {
                    log.debug('No file in CNCEngine to load to sender');
                }

                if (controller.isOpen()) {
                    // Join the room
                    socket.join(port);

                    callback(null);
                    return;
                }

                controller.open((err = null) => {
                    if (err) {
                        callback(err);
                        return;
                    }

                    // System Trigger: Open a serial port
                    this.event.trigger('port:open');

                    if (store.get(`controllers["${port}"]`)) {
                        log.error(`Serial port "${port}" was not properly closed`);
                    }
                    store.set(`controllers[${JSON.stringify(port)}]`, controller);

                    // Join the room
                    socket.join(port);

                    callback(null);
                });
            });

            // Close serial port
            socket.on('close', (port, callback = noop) => {
                if (typeof callback !== 'function') {
                    callback = noop;
                }

                log.debug(`socket.close("${port}"): id=${socket.id}`);

                const controller = store.get(`controllers["${port}"]`);
                if (!controller) {
                    const err = `Serial port "${port}" not accessible`;
                    log.error(err);
                    callback(new Error(err));
                    return;
                }

                // System Trigger: Close a serial port
                this.event.trigger('port:close');

                // Leave the room
                socket.leave(port);

                controller.close(err => {
                    // Remove controller from store
                    store.unset(`controllers[${JSON.stringify(port)}]`);

                    // Destroy controller
                    controller.destroy();

                    callback(null);
                });
            });

            socket.on('command', (port, cmd, ...args) => {
                log.debug(`socket.command("${port}", "${cmd}"): id=${socket.id}`);

                const controller = store.get(`controllers["${port}"]`);
                if (!controller || controller.isClose()) {
                    log.error(`Serial port "${port}" not accessible`);
                    return;
                }

                controller.command.apply(controller, [cmd].concat(args));
            });

            socket.on('write', (port, data, context = {}) => {
                log.debug(`socket.write("${port}", "${data}", ${JSON.stringify(context)}): id=${socket.id}`);

                const controller = store.get(`controllers["${port}"]`);
                if (!controller || controller.isClose()) {
                    log.error(`Serial port "${port}" not accessible`);
                    return;
                }

                controller.write(data, context);
            });

            socket.on('writeln', (port, data, context = {}) => {
                log.debug(`socket.writeln("${port}", "${data}", ${JSON.stringify(context)}): id=${socket.id}`);

                const controller = store.get(`controllers["${port}"]`);
                if (!controller || controller.isClose()) {
                    log.error(`Serial port "${port}" not accessible`);
                    return;
                }

                controller.writeln(data, context);
            });

            socket.on('hPing', () => {
                log.debug(`Health check received at ${new Date().toLocaleTimeString()}`);
                socket.emit('hPong');
            });

            socket.on('file:fetch', () => {
                socket.emit('file:fetch', this.gcode, this.meta);
            });
        });
    }

    stop() {
        if (this.io) {
            this.io.close();
            this.io = null;
        }
        this.sockets = [];
        this.server = null;

        taskRunner.removeListener('start', this.listener.taskStart);
        taskRunner.removeListener('finish', this.listener.taskFinish);
        taskRunner.removeListener('error', this.listener.taskError);
        config.removeListener('change', this.listener.configChange);
    }

    // Emit message across all sockets
    emit(msg, ...args) {
        this.sockets.forEach((socket) => {
            socket.emit(msg, ...args);
        });
    }

    /* Functions related to loading file through server */
    // If gcode is going to live in CNCengine, we need functions to access or unload it.
    load({ port, gcode, ...meta }) {
        log.info(`Loaded file '${meta.name}' to CNCEngine`);
        this.gcode = gcode;
        this.meta = meta;

        // Load the file to the sender if controller connection exists
        if (port) {
            const controller = store.get(`controllers["${port}"]`);
            if (controller) {
                controller.loadFile(this.gcode, this.meta);
            }
        }
        this.emit('file:load', gcode, meta.size, meta.name);
    }

    unload() {
        this.gcode = null;
        this.meta = null;
        this.emit('file:unload');
    }

    fetchGcode() {
        return [this.gcode, this.meta];
    }

    hasFileLoaded() {
        return this.gcode !== null;
    }
}

export default CNCEngine;
