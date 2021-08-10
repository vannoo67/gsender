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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import get from 'lodash/get';
import controller from 'app/lib/controller';
import AlarmDescriptionIcon from 'app/widgets/Visualizer/AlarmDescriptionIcon';
import styles from './machine-status-area.styl';
import UnlockAlarmButton from './UnlockAlarmButton';
import { GRBL_ACTIVE_STATE_HOME } from '../../constants';


/**
 * Control Area component displaying machine status
 * @param {Object} state Default state given from parent component
 * @param {Object} actions Actions object given from parent component
 */
class ControlArea extends Component {
    static propTypes = {
        state: PropTypes.object,
        actions: PropTypes.object,
    }

    state = {
        currentAlarmIcon: 'fa-lock',
        homingRun: false
    }

    unlock = () => {
        controller.command('unlock');
    }

    handleHomeMachine = () => {
        controller.command('unlock');
        controller.command('homing');
        this.setState({
            homingRun: true
        });
    }

    render() {
        const { layoutIsReversed } = this.props.state;
        const { $22, activeState, alarmCode, isConnected } = this.props;
        const { homingRun } = this.state;

        //Object to customize the message of the active machine state
        const message = {
            Idle: 'Idle',
            Run: 'Running',
            Hold: 'Hold',
            Jog: 'Jogging',
            Check: 'Check',
            Home: 'Homing',
            Sleep: 'Sleep',
            Alarm: 'Alarm',
            Disconnected: 'Disconnected',
        };

        /**
         * Function to output the machine state based on multiple conditions
         */
        const machineStateRender = () => {
            if (isConnected) {
                const homingEnabled = $22;
                if (!homingRun && alarmCode === 'Homing' && homingEnabled === '1') {
                    return (
                        <div className={styles['machine-status-wrapper']}>
                            <div className={styles[`machine${activeState}`]}>
                                {
                                    activeState === GRBL_ACTIVE_STATE_HOME ? 'Homing...' : 'Run Homing'
                                }
                            </div>
                            <UnlockAlarmButton newMessage="Click To Home Machine" onClick={this.handleHomeMachine} />
                        </div>
                    );
                }

                if (activeState === 'Alarm') {
                    return (
                        <div className={styles['machine-status-wrapper']}>
                            <div className={styles['machine-Alarm']}>
                                {activeState} ({alarmCode})<AlarmDescriptionIcon code={alarmCode} />
                            </div>
                            <UnlockAlarmButton onClick={this.unlock} />
                        </div>
                    );
                } else if (activeState === 'Check') {
                    return (
                        <div className={styles['machine-status-wrapper']}>
                            <div className={styles['machine-Jog']}>
                             Checking Gcode File...
                            </div>
                        </div>
                    );
                } {
                    return activeState //Show disconnected until machine connection process is finished, otherwise an empty div is shown
                        ? (
                            <div className={styles[`machine-${activeState}`]}>
                                { message[activeState] }
                            </div>
                        )
                        : <div className={styles['machine-Disconnected']}>Disconnected</div>;
                }
            } else {
                return <div className={styles['machine-Disconnected']}>Disconnected</div>;
            }
        };

        return (
            <div className={classnames(styles['control-area'], layoutIsReversed ? styles.inverted : '')}>
                <div />
                {machineStateRender()}
                <div />
            </div>
        );
    }
}

export default connect((store) => {
    const $22 = get(store, 'controller.settings.settings.$22', '0');
    const alarmCode = get(store, 'controller.state.status.alarmCode');
    const activeState = get(store, 'controller.state.status.activeState');
    const isConnected = get(store, 'connection.isConnected');
    return {
        $22,
        alarmCode,
        activeState,
        isConnected
    };
})(ControlArea);
