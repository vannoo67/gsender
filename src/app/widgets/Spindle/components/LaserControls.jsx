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

import React from 'react';
import classNames from 'classnames';
import styles from '../index.styl';
import FunctionButton from '../../../components/FunctionButton/FunctionButton';
import Slider from './Slider';


const LaserControls = ({ actions, state }) => {
    const { laser, canClick } = state;
    return (
        <div className={styles.controlContainer}>
            <div className={styles.controlRow}>
                <FunctionButton onClick={actions.sendM3} disabled={!canClick}>
                    <i className="fas fa-lightbulb" />
                    Laser On
                </FunctionButton>
                <FunctionButton onClick={actions.runLaserTest} disabled={!canClick}>
                    <i className="fas fa-satellite-dish" />
                    Laser Test
                </FunctionButton>
                <FunctionButton onClick={actions.sendM5} disabled={!canClick}>
                    <i className="far fa-lightbulb" />
                    Laser Off
                </FunctionButton>
            </div>
            <Slider
                label="Power"
                unitString="%"
                value={laser.power}
                max={100}
                step={1}
                onChange={actions.handleLaserPowerChange}
            />
            <div className={classNames('form-group', styles.durationWrapper)}>
                <label>Test Duration:</label>
                <div className="input-group">
                    <input
                        value={laser.duration}
                        onChange={actions.handleLaserDurationChange}
                        className={classNames('form-control', styles.durationInput)}
                    />
                    <span className="input-group-addon">ms</span>
                </div>
            </div>
        </div>
    );
};

export default LaserControls;
