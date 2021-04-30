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
import Input from '../Input';

import styles from '../index.styl';

const AddTool = ({ actions, state }) => {
    const { tool } = state;
    const toolActions = actions.tool;

    return (
        <div>
            <Input
                label="Metric Diameter"
                units="mm"
                value={tool.metricDiameter}
                onChange={toolActions.setMetricDiameter}
                additionalProps={{ id: 'metricDiameter', type: 'number', step: '0.1' }}
            />

            <Input
                label="Imperial Diameter"
                units="in"
                additionalProps={{ id: 'imperialDiameter', type: 'number', step: '0.1' }}
                value={tool.imperialDiameter}
                onChange={toolActions.setImperialDiameter}
            />


            <button
                className={styles.addTool}
                type="button"
                onClick={toolActions.addTool}
                disabled={tool.imperialDiameter === 0 || tool.metricDiameter === 0}
            >
                Add Tool
            </button>
        </div>
    );
};

export default AddTool;
