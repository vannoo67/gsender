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

import React from 'react';
import PropTypes from 'prop-types';

import Modal from 'app/components/Modal';

import styles from './index.styl';

const ToolModal = ({ onClose, title, children, size, style }) => {
    return (
        <Modal onClose={onClose} size={size} style={style}>
            <div className={styles.toolModal}>
                <div className={styles.header}>
                    <h3 className={styles.headerText}>{title}</h3>
                </div>
                <div className={styles.container}>
                    {children}
                </div>
            </div>
        </Modal>
    );
};

ToolModal.propTypes = {
    title: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    size: PropTypes.string,
};

export default ToolModal;
