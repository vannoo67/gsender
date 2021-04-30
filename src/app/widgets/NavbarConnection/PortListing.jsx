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
import styles from './Index.styl';

const PortListing = ({ port, inuse, baudrate, controllerType, onClick }) => {
    return (
        <button className={styles.PortListing} onClick={onClick}>
            <i className={`fa fab ${inuse ? 'fa-lock' : 'fa-lock-open'}`} />
            <div className={styles.NavbarPortListingInfo}>
                <div className={styles.NavbarPortListingPortLabel}>{ port }</div>
                <div className={styles.NavbarPortListingPortManufacturer}>use {controllerType} at { baudrate } baud</div>
            </div>
        </button>
    );
};

PortListing.propTypes = {
    port: PropTypes.string,
    inuse: PropTypes.bool,
    baudrate: PropTypes.number,
    controllerType: PropTypes.string,
    onClick: PropTypes.func
};

export default PortListing;
