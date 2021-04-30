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

export const formatShortcut = (shortcut = []) => {
    const output = [];
    for (let i = 0; i < shortcut.length; i++) {
        if (i === shortcut.length - 1) {
            output.push(<span key={i}><kbd>{shortcut[i]}</kbd></span>);
        } else {
            output.push(<span key={i}><kbd>{shortcut[i]}</kbd> + </span>);
        }
    }

    return output;
};
