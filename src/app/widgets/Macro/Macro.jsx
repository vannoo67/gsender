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

import ensureArray from 'ensure-array';
import PropTypes from 'prop-types';
import includes from 'lodash/includes';
import React, { PureComponent } from 'react';
import i18n from 'app/lib/i18n';
import {
    WORKFLOW_STATE_IDLE,
    WORKFLOW_STATE_PAUSED
} from '../../constants';

import MacroItem from './MacroItem';
import styles from './index.styl';

class Macro extends PureComponent {
    static propTypes = {
        state: PropTypes.object,
        actions: PropTypes.object
    };

    canRunMacro = () => {
        const {
            canClick,
            workflow,
        } = this.props.state;

        return canClick && includes([WORKFLOW_STATE_IDLE, WORKFLOW_STATE_PAUSED], workflow.state);
    }

    handleRunMacro = (macro) => {
        if (!this.canRunMacro()) {
            return;
        }

        const { actions } = this.props;
        const { id, name } = macro;
        actions.runMacro(id, { name });
    };

    handleEditMacro = (macro) => (event) => {
        const { actions } = this.props;
        actions.openEditMacroModal(macro.id);
    };

    handleDeleteMacro = (macroID) => (event) => {
        const { actions } = this.props;
        actions.deleteMacro(macroID);
    }

    render() {
        // const { state, actions } = this.props;
        const { state } = this.props;
        const {
            macros = []
        } = state;

        const disabled = !this.canRunMacro();

        return (
            <div className={styles['macro-container']}>
                {macros.length === 0 && (
                    <div className={styles.emptyResult}>
                        {i18n._('No macros...')}<br />
                    </div>
                )}
                {ensureArray(macros).map((macro) => (
                    <MacroItem
                        key={macro.id}
                        macro={macro}
                        onRun={this.handleRunMacro}
                        onEdit={this.handleEditMacro}
                        onDelete={this.handleDeleteMacro}
                        disabled={disabled}
                    />
                ))}
            </div>
        );
    }
}

export default Macro;
