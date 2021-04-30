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
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './index.styl';

const Input = ({ value, label, units, onChange, additionalProps, className }) => {
    return (
        <div className={classNames(styles.input, 'form-group', className)}>
            <label htmlFor="">{`${label}`}</label>
            <div className="input-group">
                <input
                    {...additionalProps}
                    value={value}
                    onChange={onChange}
                    className={classNames('form-control', styles.inputText)}
                    style={{ zIndex: '0', textAlign: 'center', color: '#3e85c7' }}
                />
                {units && <span className="input-group-addon">{units}</span>}
            </div>
        </div>
    );
};

Input.propTypes = {
    label: PropTypes.string,
    units: PropTypes.string,
    onChange: PropTypes.func,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    additionalProps: PropTypes.object,
    className: PropTypes.string,
};

Input.defaultProps = {
    additionalProps: { type: 'text' },
};

export default Input;
