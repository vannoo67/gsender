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

const Probe = ({ id, xyThickness, zThickness, functions, handleDelete }) => {
    return (
        <div className={styles.tool}>
            <div className={styles.probeInfo}>
                <b>{ id }</b>
                {
                    (functions.x || functions.y) && (
                        <div className={classNames('small', styles.inputSpread)}>
                            <b>XY Thickness:</b>
                            {xyThickness}mm
                        </div>
                    )
                }
                {
                    functions.z && (
                        <div className={classNames('small', styles.inputSpread)}>
                            <b>Z Thickness:</b>
                            {zThickness}mm
                        </div>
                    )
                }
            </div>
            <button
                type="button"
                className={styles.delete}
                alt="Delete Probe Profile"
                onClick={handleDelete}
            >
                <i className="fa fa-minus" />
            </button>
        </div>
    );
};

export default Probe;
