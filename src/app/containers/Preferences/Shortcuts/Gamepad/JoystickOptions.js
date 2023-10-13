import React, { useContext } from 'react';
import Select from 'react-select';
import { cloneDeep, set } from 'lodash';

import { Checkbox } from 'app/components/Checkbox';
import Tooltip from 'app/components/TooltipCustom/ToolTip';

import Input from '../../components/Input';
import { GamepadContext } from './utils/context';
import { arrayComparator } from './utils';
import { setGamepadProfileList } from './utils/actions';

import styles from './index.styl';

const JoystickOptions = () => {
    const {
        state: { currentProfile, settings: { profiles } },
        actions: { getGamepadProfile },
        dispatch
    } = useContext(GamepadContext);

    const handleChange = (key, value) => {
        const updatedProfiles =
            profiles.map(profile => {
                const isCurrentProfile = arrayComparator(profile.id, currentProfile);

                if (isCurrentProfile) {
                    const updatedProfileItem = cloneDeep(profile);

                    set(updatedProfileItem, `joystickOptions.${key}`, value);

                    return updatedProfileItem;
                }

                return profile;
            });

        dispatch(setGamepadProfileList(updatedProfiles));
    };

    const axesOptions = [
        { label: 'None', value: null },
        { label: 'X', value: 'x' },
        { label: 'Y', value: 'y' },
        { label: 'Z', value: 'z' },
        { label: 'A', value: 'a' },
    ];

    const profile = getGamepadProfile(currentProfile);

    const { joystickOptions: { stick1, stick2, zeroThreshold = {} } } = profile;

    return (
        <div style={{ fontSize: '1rem' }}>
            <div className={styles.joystickOption} style={{ marginBottom: '1rem' }}>
                <div />
                <div>Action</div>
                <div>2nd Action</div>
                <div />
            </div>

            <div className={styles.joystickOption}>
                <div>Stick 1 Left/Right</div>
                <Select
                    options={axesOptions}
                    placeholder={null}
                    value={{
                        label: String(stick1.horizontal.primaryAction).toUpperCase(),
                        value: stick1.horizontal.primaryAction
                    }}
                    onChange={({ value }) => handleChange('stick1.horizontal.primaryAction', value)}
                />
                <Select
                    options={axesOptions}
                    placeholder={null}
                    value={{
                        label: String(stick1.horizontal.secondaryAction).toUpperCase(),
                        value: stick1.horizontal.secondaryAction
                    }}
                    onChange={({ value }) => handleChange('stick1.horizontal.secondaryAction', value)}
                />
                <Tooltip content="Reverse Axis Direction" location="default">
                    <Checkbox checked={stick1.horizontal.isReversed} onChange={(e) => handleChange('stick1.horizontal.isReversed', e.target.checked)} />
                </Tooltip>
            </div>

            <div className={styles.joystickOption}>
                <div>Stick 1 Up/Down</div>
                <Select
                    options={axesOptions}
                    placeholder={null}
                    value={{
                        label: String(stick1.vertical.primaryAction).toUpperCase(),
                        value: stick1.vertical.primaryAction
                    }}
                    onChange={({ value }) => handleChange('stick1.vertical.primaryAction', value)}
                />
                <Select
                    options={axesOptions}
                    placeholder={null}
                    value={{
                        label: String(stick1.vertical.secondaryAction).toUpperCase(),
                        value: stick1.vertical.secondaryAction
                    }}
                    onChange={({ value }) => handleChange('stick1.vertical.secondaryAction', value)}
                />
                <Tooltip content="Reverse Axis Direction" location="default">
                    <Checkbox checked={stick1.vertical.isReversed} onChange={(e) => handleChange('stick1.vertical.isReversed', e.target.checked)} />
                </Tooltip>
            </div>

            <div className={styles.joystickOption}>
                <div>Stick 1 Use MPG</div>
                <Select
                    options={axesOptions}
                    placeholder={null}
                    value={{
                        label: String(stick1.mpgMode.primaryAction).toUpperCase(),
                        value: stick1.mpgMode.primaryAction
                    }}
                    onChange={({ value }) => handleChange('stick1.mpgMode.primaryAction', value)}
                />
                <Select
                    options={axesOptions}
                    placeholder={null}
                    value={{
                        label: String(stick1.mpgMode.secondaryAction).toUpperCase(),
                        value: stick1.mpgMode.secondaryAction
                    }}
                    onChange={({ value }) => handleChange('stick1.mpgMode.secondaryAction', value)}
                />
                <Tooltip content="Reverse Axis Direction" location="default">
                    <Checkbox checked={stick1.mpgMode.isReversed} onChange={(e) => handleChange('stick1.mpgMode.isReversed', e.target.checked)} />
                </Tooltip>
            </div>

            <div className={styles.joystickOption}>
                <div>Stick 2 Left/Right</div>
                <Select
                    options={axesOptions}
                    placeholder={null}
                    value={{
                        label: String(stick2.horizontal.primaryAction).toUpperCase(),
                        value: stick2.horizontal.primaryAction
                    }}
                    onChange={({ value }) => handleChange('stick2.horizontal.primaryAction', value)}
                />
                <Select
                    options={axesOptions}
                    placeholder={null}
                    value={{
                        label: String(stick2.horizontal.secondaryAction).toUpperCase(),
                        value: stick2.horizontal.secondaryAction
                    }}
                    onChange={({ value }) => handleChange('stick2.horizontal.secondaryAction', value)}
                />
                <Tooltip content="Reverse Axis Direction" location="default">
                    <Checkbox checked={stick2.horizontal.isReversed} onChange={(e) => handleChange('stick2.horizontal.isReversed', e.target.checked)} />
                </Tooltip>
            </div>

            <div className={styles.joystickOption}>
                <div>Stick 2 Up/Down</div>
                <Select
                    options={axesOptions}
                    placeholder={null}
                    value={{
                        label: String(stick2.vertical.primaryAction).toUpperCase(),
                        value: stick2.vertical.primaryAction
                    }}
                    onChange={({ value }) => handleChange('stick2.vertical.primaryAction', value)}
                />
                <Select
                    options={axesOptions}
                    placeholder={null}
                    value={{
                        label: String(stick2.vertical.secondaryAction).toUpperCase(),
                        value: stick2.vertical.secondaryAction
                    }}
                    onChange={({ value }) => handleChange('stick2.vertical.secondaryAction', value)}
                />
                <Tooltip content="Reverse Axis Direction" location="default">
                    <Checkbox checked={stick2.vertical.isReversed} onChange={(e) => handleChange('stick2.vertical.isReversed', e.target.checked)} />
                </Tooltip>
            </div>

            <div className={styles.joystickOption}>
                <div>Stick 2 Use MPG</div>
                <Select
                    options={axesOptions}
                    placeholder={null}
                    value={{
                        label: String(stick2.mpgMode.primaryAction).toUpperCase(),
                        value: stick2.mpgMode.primaryAction
                    }}
                    onChange={({ value }) => handleChange('stick2.mpgMode.primaryAction', value)}
                />
                <Select
                    options={axesOptions}
                    placeholder={null}
                    value={{
                        label: String(stick2.mpgMode.secondaryAction).toUpperCase(),
                        value: stick2.mpgMode.secondaryAction
                    }}
                    onChange={({ value }) => handleChange('stick2.mpgMode.secondaryAction', value)}
                />
                <Tooltip content="Reverse Axis Direction" location="default">
                    <Checkbox checked={stick2.mpgMode.isReversed} onChange={(e) => handleChange('stick2.mpgMode.isReversed', e.target.checked)} />
                </Tooltip>
            </div>

            <div className={styles.joystickOption}>
                <div>Zero Threshold</div>
                <Input
                    value={zeroThreshold.primaryAction}
                    additionalProps={{ min: 0, max: 1.0, step: 0.1, type: 'number' }}
                    onChange={(e) => handleChange('zeroThreshold.primaryAction', Number(e.target.value))}
                />
                <Input
                    value={zeroThreshold.secondaryAction}
                    additionalProps={{ min: 0, max: 1.0, step: 0.1, type: 'number' }}
                    onChange={(e) => handleChange('zeroThreshold.secondaryAction', Number(e.target.value))}
                />
                <div />
            </div>
        </div>
    );
};

export default JoystickOptions;
