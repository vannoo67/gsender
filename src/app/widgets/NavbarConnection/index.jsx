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

import get from 'lodash/get';
import reverse from 'lodash/reverse';
import sortBy from 'lodash/sortBy';
import uniq from 'lodash/uniq';
import includes from 'lodash/includes';
import map from 'lodash/map';
import PropTypes from 'prop-types';
import pubsub from 'pubsub-js';
import React, { PureComponent } from 'react';
import controller from 'app/lib/controller';
import i18n from 'app/lib/i18n';
import log from 'app/lib/log';
import WidgetConfig from '../WidgetConfig';
import NavbarConnection from './NavbarConnection';


class NavbarConnectionWidget extends PureComponent {
    static propTypes = {
        widgetId: PropTypes.string.isRequired,
        disableWizardFunction: PropTypes.func,
        enableWizardFunction: PropTypes.func
    };

    pubsubTokens = [];

    // Public methods
    collapse = () => {
        this.setState({ minimized: true });
    };

    expand = () => {
        this.setState({ minimized: false });
    };

    config = new WidgetConfig(this.props.widgetId);

    state = this.getInitialState();

    actions = {
        toggleFullscreen: () => {
            const { minimized, isFullscreen } = this.state;
            this.setState(state => ({
                minimized: isFullscreen ? minimized : false,
                isFullscreen: !isFullscreen
            }));
        },
        toggleMinimized: () => {
            const { minimized } = this.state;
            this.setState(state => ({
                minimized: !minimized
            }));
        },
        clearAlert: () => {
            this.setState(state => ({
                alertMessage: ''
            }));
        },
        changeController: (controllerType) => {
            this.setState(state => ({
                controllerType: controllerType
            }));
        },
        onChangePortOption: (option) => {
            this.setState(state => ({
                alertMessage: '',
                port: option.value
            }));
        },
        onClickPortListing: (selectedPort) => {
            this.setState(state => ({
                alertMessage: '',
                port: selectedPort.port
            }), () => {
                const { port, baudrate } = this.state;
                this.openPort(port, { baudrate: baudrate });
            });
        },
        toggleAutoReconnect: (event) => {
            const checked = event.target.checked;
            this.setState(state => ({
                autoReconnect: checked
            }));
        },
        toggleHardwareFlowControl: (event) => {
            const checked = event.target.checked;
            this.setState(state => ({
                connection: {
                    ...state.connection,
                    serial: {
                        ...state.connection.serial,
                        rtscts: checked
                    }
                }
            }));
        },
        handleRefreshPorts: (event) => {
            this.refreshPorts();
        },
        handleOpenPort: (event) => {
            const { port, baudrate } = this.state;
            this.openPort(port, { baudrate: baudrate });
        },
        handleClosePort: (event) => {
            const { port } = this.state;
            this.closePort(port);
        }
    };

    controllerEvents = {
        'serialport:list': (ports) => {
            log.debug('Received a list of serial ports:', ports);

            this.stopLoading();

            const port = this.config.get('port') || '';

            if (includes(map(ports, 'port'), port)) {
                this.setState(state => ({
                    alertMessage: '',
                    port: port,
                    ports: ports
                }));

                const { autoReconnect, hasReconnected } = this.state;

                if (autoReconnect && !hasReconnected) {
                    const { baudrate } = this.state;

                    this.setState(state => ({
                        hasReconnected: true
                    }));
                    this.openPort(port, {
                        baudrate: baudrate
                    });
                }
            } else {
                this.setState(state => ({
                    alertMessage: '',
                    ports: ports
                }));
            }
        },
        'serialport:change': (options) => {
            const { port, inuse } = options;
            const ports = this.state.ports.map((o) => {
                if (o.port !== port) {
                    return o;
                }
                return { ...o, inuse };
            });

            this.setState(state => ({
                ports: ports
            }));
        },
        'serialport:open': (options) => {
            setTimeout(() => {
                this.props.disableWizardFunction();
            }, 1500); // delay 1500ms so wizard can load settings
            const { controllerType, port, baudrate, inuse } = options;
            const ports = this.state.ports.map((o) => {
                if (o.port !== port) {
                    return o;
                }
                return { ...o, inuse };
            });

            this.setState(state => ({
                alertMessage: '',
                connecting: false,
                connected: true,
                controllerType: controllerType, // Grbl|Marlin|Smoothie|TinyG
                port: port,
                baudrate: baudrate,
                ports: ports
            }));

            log.debug(`Established a connection to the serial port "${port}"`);
        },
        'serialport:close': (options) => {
            this.props.enableWizardFunction();
            const { port } = options;

            log.debug(`The serial port "${port}" is disconected`);

            this.setState(state => ({
                alertMessage: '',
                connecting: false,
                connected: false
            }));

            this.refreshPorts();
        },
        'serialport:error': (options) => {
            const { port } = options;

            this.setState(state => ({
                alertMessage: i18n._('Error opening serial port \'{{- port}}\'', { port: port }),
                connecting: false,
                connected: false
            }));

            log.error(`Error opening serial port "${port}"`);
        }
    };

    componentDidMount() {
        this.addControllerEvents();
        this.refreshPorts();
        this.subscribe();
    }

    componentWillUnmount() {
        this.removeControllerEvents();
        this.unsubscribe();
    }

    componentDidUpdate(prevProps, prevState) {
        const {
            minimized,
            controllerType,
            port,
            baudrate,
            autoReconnect,
            connection
        } = this.state;

        this.config.set('minimized', minimized);
        if (controllerType) {
            this.config.set('controller.type', controllerType);
        }
        if (port) {
            this.config.set('port', port);
        }
        if (baudrate) {
            this.config.set('baudrate', baudrate);
        }
        if (connection) {
            this.config.set('connection.serial.rtscts', get(connection, 'serial.rtscts', false));
        }
        this.config.set('autoReconnect', autoReconnect);
    }

    getInitialState() {
        let controllerType = this.config.get('controller.type');
        if (!includes(controller.loadedControllers, controllerType)) {
            controllerType = controller.loadedControllers[0];
        }

        // Common baud rates
        const defaultBaudrates = [
            250000,
            115200,
            57600,
            38400,
            19200,
            9600,
            2400
        ];

        return {
            wizardDisabled: true,
            minimized: this.config.get('minimized', false),
            isFullscreen: false,
            loading: false,
            connecting: false,
            connected: false,
            ports: [],
            baudrates: reverse(sortBy(uniq(controller.baudrates.concat(defaultBaudrates)))),
            controllerType: controllerType,
            port: controller.port,
            baudrate: this.config.get('baudrate'),
            connection: {
                serial: {
                    rtscts: this.config.get('connection.serial.rtscts')
                }
            },
            autoReconnect: this.config.get('autoReconnect'),
            hasReconnected: false,
            alertMessage: ''
        };
    }

    addControllerEvents() {
        Object.keys(this.controllerEvents).forEach(eventName => {
            const callback = this.controllerEvents[eventName];
            controller.addListener(eventName, callback);
        });
    }

    removeControllerEvents() {
        Object.keys(this.controllerEvents).forEach(eventName => {
            const callback = this.controllerEvents[eventName];
            controller.removeListener(eventName, callback);
        });
    }

    startLoading() {
        const delay = 5 * 1000; // wait for 5 seconds

        this.setState(state => ({
            loading: true
        }));
        this._loadingTimer = setTimeout(() => {
            this.setState(state => ({
                loading: false
            }));
        }, delay);
    }

    stopLoading() {
        if (this._loadingTimer) {
            clearTimeout(this._loadingTimer);
            this._loadingTimer = null;
        }
        this.setState(state => ({
            loading: false
        }));
    }

    refreshPorts() {
        this.startLoading();
        controller.listPorts();
    }

    openPort(port, options) {
        const { baudrate } = { ...options };

        this.setState(state => ({
            connecting: true
        }));

        controller.openPort(port, {
            controllerType: this.state.controllerType,
            baudrate: baudrate,
            rtscts: this.state.connection.serial.rtscts
        }, (err) => {
            if (err) {
                this.setState(state => ({
                    alertMessage: i18n._('Error opening port \'{{- port}}\'', { port: port }),
                    connecting: false,
                    connected: false
                }));

                log.error(err);
                return;
            }
        });
    }

    closePort(port = this.state.port) {
        this.setState(state => ({
            connecting: false,
            connected: false
        }));
        controller.closePort(port, (err) => {
            if (err) {
                log.error(err);
                return;
            }

            // Refresh ports
            controller.listPorts();
        });
    }

    subscribe() {
        const tokens = [
            pubsub.subscribe('autoReconnect:update', (msg, value) => {
                this.setState({
                    autoReconnect: value
                });
            }),
            pubsub.subscribe('baudrate:update', (msg, value) => {
                this.setState({
                    baudrate: value
                });
            })
        ];
        this.pubsubTokens = this.pubsubTokens.concat(tokens);
    }

    unsubscribe() {
        this.pubsubTokens.forEach((token) => {
            pubsub.unsubscribe(token);
        });
        this.pubsubTokens = [];
    }

    render() {
        const state = {
            ...this.state
        };
        const actions = {
            ...this.actions
        };

        return (
            <NavbarConnection actions={actions} state={state} />
        );
    }
}

export default NavbarConnectionWidget;
