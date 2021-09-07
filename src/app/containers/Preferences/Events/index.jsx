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

import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import FunctionButton from 'app/components/FunctionButton/FunctionButton';
import { Toaster, TOASTER_DANGER, TOASTER_SUCCESS } from 'app/lib/toaster/ToasterLib';
import api from 'app/api';
import ToggleSwitch from 'app/components/ToggleSwitch';
import FieldSet from '../FieldSet';
import styles from '../index.styl';

const Index = ({ active }) => {
    const [programStartEvent, setProgramStartEvent] = useState(null);
    const [programEndEvent, setProgramEndEvent] = useState(null);
    const [programStartCode, setProgramStartCode] = useState('');
    const [programEndCode, setProgramEndCode] = useState('');
    const [startEnabled, setStartEnabled] = useState(true);
    const [endEnabled, setEndEnabled] = useState(true);

    const changeStartCodeValue = (e) => setProgramStartCode(e.target.value);
    const changeEndCodeValue = (e) => setProgramEndCode(e.target.value);

    const toggleStartEvent = async () => {
        try {
            if (programStartEvent) {
                programStartEvent.enabled = !programStartEvent.enabled;
                await api.events.update(programStartEvent.id, {
                    enabled: programStartEvent.enabled
                });
                setStartEnabled(programStartEvent.enabled);
            }
        } catch (e) {
            Toaster.pop({
                msg: 'Unable to update Program Start event',
                type: TOASTER_DANGER
            });
        }
    };

    const toggleEndEvent = async () => {
        try {
            if (programEndEvent) {
                programEndEvent.enabled = !programEndEvent.enabled;
                await api.events.update(programEndEvent.id, {
                    enabled: programEndEvent.enabled
                });
                setEndEnabled(programEndEvent.enabled);
            }
        } catch (e) {
            Toaster.pop({
                msg: 'Unable to update Program End event',
                type: TOASTER_DANGER
            });
        }
    };

    const updateProgramStartEvent = async () => {
        try {
            if (programStartEvent) {
                await api.events.update(programStartEvent.id, {
                    commands: programStartCode
                });
            } else {
                const res = await api.events.create({
                    event: 'gcode:start',
                    trigger: 'gcode',
                    commands: programStartCode
                });
                const { id } = res.body;
                setProgramStartEvent({
                    id
                });
            }
            Toaster.pop({
                msg: 'Updated Program Start event',
                type: TOASTER_SUCCESS
            });
        } catch (e) {
            Toaster.pop({
                msg: 'Unable to update Program Start event',
                type: TOASTER_DANGER
            });
        }
    };

    const updateProgramEndEvent = async () => {
        try {
            if (programEndEvent) {
                await api.events.update(programEndEvent.id, {
                    commands: programEndCode
                });
            } else {
                const res = await api.events.create({
                    event: 'gcode:stop',
                    trigger: 'gcode',
                    commands: programEndCode
                });
                const { id } = res.body;
                setProgramEndEvent({
                    id
                });
            }
            Toaster.pop({
                msg: 'Updated Program Stop event',
                type: TOASTER_SUCCESS
            });
        } catch (e) {
            Toaster.pop({
                msg: 'Unable to update Program Stop event',
                type: TOASTER_DANGER
            });
        }
    };

    useEffect(async () => {
        try {
            const response = await api.events.fetch();
            const { records } = response.body;
            const startEvent = records.filter((record) => record.event === 'gcode:start')[0];
            const endEvent = records.filter((record) => record.event === 'gcode:stop')[0];
            startEvent && setProgramStartEvent(startEvent);
            startEvent && setProgramStartCode(startEvent.commands);
            startEvent && setStartEnabled(startEvent.enabled);
            endEvent && setProgramEndEvent(endEvent);
            endEvent && setProgramEndCode(endEvent.commands);
            endEvent && setEndEnabled(endEvent.enabled);
        } catch (e) {
            Toaster.pop({
                msg: 'Unable to fetch program event records',
                type: TOASTER_DANGER
            });
        }
    }, []);


    return (
        <div className={classNames(
            styles.hidden,
            styles['settings-wrapper'],
            { [styles.visible]: active }
        )}
        >
            <h3 className={styles.settingsTitle}>
                Start/Stop G-Code
            </h3>
            <div className={styles.generalArea}>
                <div className={styles.flexColumn}>
                    <FieldSet legend="Program Start" className={styles.paddingBottom}>
                        <div className={styles.toggleContainer}>
                            <ToggleSwitch checked={startEnabled} onChange={toggleStartEvent} label="Enabled" />
                        </div>
                        <textarea
                            rows="11"
                            className="form-control"
                            name="onStart"
                            value={programStartCode}
                            onChange={changeStartCodeValue}
                        />
                        <FunctionButton primary onClick={updateProgramStartEvent}>
                            Update Start Event
                        </FunctionButton>
                    </FieldSet>
                    <FieldSet legend="Program Stop" className={styles.paddingBottom}>
                        <div className={styles.toggleContainer}>
                            <ToggleSwitch checked={endEnabled} onChange={toggleEndEvent} label="Enabled" />
                        </div>
                        <textarea
                            rows="11"
                            className="form-control"
                            name="onStop"
                            value={programEndCode}
                            onChange={changeEndCodeValue}
                        />
                        <FunctionButton primary onClick={updateProgramEndEvent}>
                            Update Stop Event
                        </FunctionButton>
                    </FieldSet>
                </div>
            </div>
        </div>
    );
};

export default Index;
