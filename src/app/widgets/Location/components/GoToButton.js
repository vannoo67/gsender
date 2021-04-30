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
import styles from '../index.styl';

const GoToButton = ({ onClick, disabled }) => {
    return (
        <button
            tabIndex={-1}
            disabled={disabled}
            onClick={onClick}
            onKeyDown={onClick}
            className={styles['go-to-button']}
        >
            <span>Goto</span>
        </button>
    );
};

GoToButton.propTypes = {
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
};

export default GoToButton;
