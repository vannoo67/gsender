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
import cx from 'classnames';
import { loadRecentFile } from './ClientRecentFiles';
import styles from './RecentFileList.styl';

const RecentFileList = ({ visible, recentFiles, setShowPullout }) => {
    return (
        <div className={cx({ [styles.hidden]: !visible })}>
            <div className={cx(styles.recentFileList)}>
                <h2>Recent Files</h2>
                {
                    recentFiles.map(recentFile => {
                        const date = new Date(recentFile.timeUploaded).toLocaleDateString();
                        return (
                            <button
                                key={recentFile.filePath}
                                className={styles.recentFile}
                                onClick={() => loadRecentFile(recentFile.filePath) && setShowPullout(false)}
                                title={`${recentFile.filePath} - Loaded ${date}`}
                            >
                                <span>{recentFile.fileName}</span>
                            </button>
                        );
                    })
                }
            </div>
        </div>

    );
};

export default RecentFileList;
