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

/* eslint-disable no-restricted-globals */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';
import TooltipCustom from 'app/components/TooltipCustom/ToolTip';

import IdleInfo from './components/IdleInfo';
import Overrides from './components/Overrides';
import styles from './index.styl';

/**
 * Job Status component wrapper
 * @param {Object} state Default state given from parent component (main index.js for this widget)
 */
class JobStatus extends PureComponent {
    static propTypes = {
        state: PropTypes.object,
    };

    /**
     * Determine the file size format between bytes, kilobytes (KB) and megabytes (MB)
     */
    fileSizeFormat = (size) => {
        const ONE_KB = 1000;
        const ONE_MB = 1000000;

        if (size >= ONE_KB && size < ONE_MB) {
            return `${(size / ONE_KB).toFixed(0)} KB`;
        } else if (size >= ONE_MB) {
            return `${(size / ONE_MB).toFixed(1)} MB`;
        }

        return `${size} bytes`;
    };

    render() {
        const { state, name, size, total, fileLoaded, path } = this.props;
        const { isRunningJob } = state;

        return (
            <div className={styles['job-status-wrapper']}>
                <div style={{ width: '100%' }}>
                    {
                        fileLoaded
                            ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '3rem' }}>
                                    <div style={{ whiteSpace: 'nowrap' }}>
                                        <TooltipCustom content={`${name} (${this.fileSizeFormat(size)}, ${total} lines)`} style={{ wordWrap: 'break-word' }}>
                                            <span className={styles['file-text']}>{name}</span> ({this.fileSizeFormat(size)}, {total} lines)
                                        </TooltipCustom>
                                    </div>
                                    {path && (
                                        <div className={styles['file-path']}>
                                            <TooltipCustom content={`File Path: ${path}`} style={{ wordWrap: 'break-word' }}>
                                                    Path: <span className={styles['file-text']}>{path}</span>
                                            </TooltipCustom>
                                        </div>
                                    )}
                                </div>
                            )
                            : <span className={styles['file-text']}>No File Loaded</span>}
                    {!isRunningJob
                        ? <IdleInfo state={state} />
                        : <Overrides state={state} />
                    }
                </div>
            </div>
        );
    }
}

export default connect((store) => {
    const file = get(store, 'file', {});

    return { ...file };
})(JobStatus);
