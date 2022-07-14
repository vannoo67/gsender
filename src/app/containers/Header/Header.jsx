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
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import without from 'lodash/without';
import HeadlessIndicator from 'app/components/HeadlessIndicator';
import Push from 'push.js';
import isElectron from 'is-electron';
import api from 'app/api';
import settings from 'app/config/settings';
import combokeys from 'app/lib/combokeys';
import controller from 'app/lib/controller';
import i18n from 'app/lib/i18n';
import pubsub from 'pubsub-js';
import NavbarConnection from 'app/widgets/NavbarConnection';
import styles from './index.styl';
import NavLogo from '../../components/NavLogo';
import NavSidebar from '../NavSidebar';

class Header extends PureComponent {
    static propTypes = {
        ...withRouter.propTypes
    };

    state = this.getInitialState();

    actions = {
        requestPushPermission: () => {
            const onGranted = () => {
                this.setState({ pushPermission: Push.Permission.GRANTED });
            };
            const onDenied = () => {
                this.setState({ pushPermission: Push.Permission.DENIED });
            };
            // Note that if "Permission.DEFAULT" is returned, no callback is executed
            const permission = Push.Permission.request(onGranted, onDenied);
            if (permission === Push.Permission.DEFAULT) {
                this.setState({ pushPermission: Push.Permission.DEFAULT });
            }
        },
        checkForUpdates: async () => {
            try {
                const res = await api.getState();
                const { checkForUpdates } = res.body;

                if (checkForUpdates) {
                    const res = await api.getLatestVersion();
                    const { time, version } = res.body;

                    this._isMounted && this.setState({
                        latestVersion: version,
                        latestTime: time
                    });
                }
            } catch (res) {
                // Ignore error
            }
        },
        fetchCommands: async () => {
            try {
                const res = await api.commands.fetch({ paging: false });
                const { records: commands } = res.body;

                this._isMounted && this.setState({
                    commands: commands.filter(command => command.enabled)
                });
            } catch (res) {
                // Ignore error
            }
        },
        runCommand: async (cmd) => {
            try {
                const res = await api.commands.run(cmd.id);
                const { taskId } = res.body;

                this.setState({
                    commands: this.state.commands.map(c => {
                        return (c.id === cmd.id) ? { ...c, taskId: taskId, err: null } : c;
                    })
                });
            } catch (res) {
                // Ignore error
            }
        },
    };

    actionHandlers = {
        CONTROLLER_COMMAND: (event, { command }) => {
            // feedhold, cyclestart, homing, unlock, reset
            controller.command(command);
        }
    };

    controllerEvents = {
        'disconnect': () => {
            this.setState({
                connected: false
            });
        },
        'connect': () => {
            this.setState({
                connected: true
            });
        },
        'config:change': () => {
            this.actions.fetchCommands();
        },
        'task:start': (taskId) => {
            this.setState({
                runningTasks: this.state.runningTasks.concat(taskId)
            });
        },
        'task:finish': (taskId, code) => {
            const err = (code !== 0) ? new Error(`errno=${code}`) : null;
            let cmd = null;

            this.setState({
                commands: this.state.commands.map(c => {
                    if (c.taskId !== taskId) {
                        return c;
                    }
                    cmd = c;
                    return {
                        ...c,
                        taskId: null,
                        err: err
                    };
                }),
                runningTasks: without(this.state.runningTasks, taskId)
            });

            if (cmd && this.state.pushPermission === Push.Permission.GRANTED) {
                Push.create(cmd.title, {
                    body: code === 0
                        ? i18n._('Command succeeded')
                        : i18n._('Command failed ({{err}})', { err: err }),
                    icon: 'images/icon-round.png',
                    timeout: 10 * 1000,
                    onClick: function () {
                        window.focus();
                        this.close();
                    }
                });
            }
        },
        'task:error': (taskId, err) => {
            let cmd = null;

            this.setState({
                commands: this.state.commands.map(c => {
                    if (c.taskId !== taskId) {
                        return c;
                    }
                    cmd = c;
                    return {
                        ...c,
                        taskId: null,
                        err: err
                    };
                }),
                runningTasks: without(this.state.runningTasks, taskId)
            });

            if (cmd && this.state.pushPermission === Push.Permission.GRANTED) {
                Push.create(cmd.title, {
                    body: i18n._('Command failed ({{err}})', { err: err }),
                    icon: 'images/icon-round.png',
                    timeout: 10 * 1000,
                    onClick: function () {
                        window.focus();
                        this.close();
                    }
                });
            }
        }
    };

    _isMounted = false;

    getInitialState() {
        let pushPermission = '';
        try {
            // Push.Permission.get() will throw an error if Push is not supported on this device
            pushPermission = Push.Permission.get();
        } catch (e) {
            // Ignore
        }

        return {
            pushPermission: pushPermission,
            commands: [],
            runningTasks: [],
            currentVersion: settings.version,
            latestVersion: settings.version,
            updateAvailable: false,
            connected: controller.connected,
            hostInformation: {
                address: '0.0.0.0',
                port: 0,
                headless: false
            }
        };
    }

    componentDidMount() {
        this._isMounted = true;

        this.addActionHandlers();
        this.addControllerEvents();

        if (isElectron()) {
            this.registerIPCListeners();
            window.ipcRenderer.invoke('check-remote-status').then(result => {
                console.log(result);
                this.setState({
                    hostInformation: {
                        ...result
                    }
                });
            });
        }
    }

    componentWillUnmount() {
        this._isMounted = false;

        this.removeActionHandlers();
        this.removeControllerEvents();

        this.runningTasks = [];
    }

    addActionHandlers() {
        Object.keys(this.actionHandlers).forEach(eventName => {
            const callback = this.actionHandlers[eventName];
            combokeys.on(eventName, callback);
        });
    }

    removeActionHandlers() {
        Object.keys(this.actionHandlers).forEach(eventName => {
            const callback = this.actionHandlers[eventName];
            combokeys.removeListener(eventName, callback);
        });
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

    toggleUpdateToast() {
        pubsub.publish('showUpdateToast');
    }

    registerIPCListeners () {
        window.ipcRenderer.on('message', (event, msg) => {
            console.log(msg);
        });
        window.ipcRenderer.on('updated_error', (event, err) => {
            console.log(err);
        });
        window.ipcRenderer.on('update_available', (info) => {
            this.setState({
                updateAvailable: true
            });
            pubsub.publish('showUpdateToast', info);
        });
    }

    render() {
        const { updateAvailable, hostInformation } = this.state;
        return (
            <div className={styles.navBar}>
                <div className={styles.primary}>
                    <NavLogo updateAvailable={ updateAvailable } onClick={ () => this.toggleUpdateToast() }/>
                    <NavbarConnection
                        state={ this.state }
                        actions={ this.actions }
                        widgetId="connection"
                    />
                    {hostInformation.headless && <HeadlessIndicator {...hostInformation} />}
                </div>
                <NavSidebar />
            </div>
        );
    }
}

export default withRouter(Header);
