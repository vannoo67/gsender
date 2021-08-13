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
import cx from 'classnames';
import PropTypes from 'prop-types';
import styles from '../index.styl';

class JogControl extends PureComponent {
    static propTypes = {
        disabled: PropTypes.bool,
        className: PropTypes.string,
        jog: PropTypes.func,
        continuousJog: PropTypes.func,
        stopContinuousJog: PropTypes.func
    };

    state = {
        startTime: 0,
        didClick: false,
        isContinuousJogging: false,
    }

    timeout = 250;

    continuousInterval = null;

    timeoutFunction = null;

    notLeftClick = (e) => {
        if (e.button !== 0) {
            return true;
        }
        return false;
    }

    clearTimeout() {
        if (this.timeoutFunction) {
            clearTimeout(this.timeoutFunction);
        }
        this.timeoutFunction = null;
    }

    onMouseUp(e) {
        const { startTime, didClick } = this.state;
        const { jog, stopContinuousJog } = this.props;

        const timer = new Date() - startTime;
        this.clearTimeout(); // remove timeout function so it doesn't fire if exists
        if (timer < this.timeout && didClick) {
            jog();
            this.setState({
                didClick: false,
                timer: new Date()
            });
        } else {
            stopContinuousJog();
            this.setState({
                startTime: new Date(),
                didClick: false
            });
        }
    }

    onMouseDown(e) {
        if (this.notLeftClick(e)) {
            return;
        }
        const startTime = new Date();
        this.setState({
            startTime: startTime,
            didClick: true
        });
        this.timeoutFunction = setTimeout(() => {
            this.props.continuousJog();
            this.setState({
                isContinuousJogging: true
            });
        }, this.timeout);
    }

    onMouseLeave(e) {
        const { didClick, startTime, isContinuousJogging } = this.state;
        this.clearTimeout();
        const timer = new Date() - startTime;
        if (didClick && timer >= this.timeout) {
            this.props.stopContinuousJog();
            this.setState({
                didClick: false,
                startTime: new Date(),
                isContinuousJogging: false
            });
            return;
        }
        // Always check if we're continuous jogging regardless on leave and send cancel command
        if (isContinuousJogging) {
            clearTimeout(this.timeoutFunction);
            this.timeoutFunction = null;
            this.props.stopContinuousJog();
            this.setState({
                isContinuousJogging: false
            });
        }
    }

    onMouseEnter(e) {
        this.setState({
            startTime: new Date()
        });
    }

    render() {
        const props = { ...this.props };

        return (
            <button
                className={cx(styles.btnKeypad, props.className)}
                disabled={props.disabled}
                onMouseDown={(e) => this.onMouseDown(e)}
                onMouseUp={(e) => this.onMouseUp(e)}
                onMouseLeave={(e) => this.onMouseLeave(e)}
                onMouseEnter={(e) => this.onMouseEnter(e)}
            >
                {props.children}
            </button>
        );
    }
}

export default JogControl;
