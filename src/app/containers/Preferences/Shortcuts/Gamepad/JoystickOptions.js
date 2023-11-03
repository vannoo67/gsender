/* eslint-disable no-unused-vars */
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
import { useGamepadListener } from '../../../../lib/hooks/useGamepadListener';

const JoystickOptions = () => {
    const {
        state: { currentProfile, settings: { profiles } },
        actions: { getGamepadProfile },
        dispatch
    } = useContext(GamepadContext);

    const { axes, buttons } = useGamepadListener({ profile: currentProfile });

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

    const stick1PrimaryActionIsUsingMPG = stick1.mpgMode.primaryAction !== null;
    const stick1SecondaryActionIsUsingMPG = stick1.mpgMode.secondaryAction !== null;

    const stick2PrimaryActionIsUsingMPG = stick2.mpgMode.primaryAction !== null;
    const stick2SecondaryActionIsUsingMPG = stick2.mpgMode.secondaryAction !== null;

    const selectOverrideStyle = {
        valueContainer: provided => ({ ...provided, padding: 2, justifyContent: 'center' }),
        dropdownIndicator: provided => ({ ...provided, padding: 2 }),
        container: provided => ({ ...provided, padding: 0 })
    };

    const isHoldingModifierButton = buttons[profile.modifier?.button]?.pressed;

    return (
        <div style={{ fontSize: '1rem' }}>
            <div className={styles.joystickOption} style={{ marginBottom: '1rem' }}>
                <div />
                <div>Action</div>
                <div>2nd Action</div>
                <div>Invert</div>
            </div>

            <div className={styles.joystickOption}>
                <div>Stick 1 Left/Right</div>
                <Select
                    styles={selectOverrideStyle}
                    options={axesOptions}
                    placeholder={null}
                    value={{
                        label: stick1.horizontal.primaryAction ? String(stick1.horizontal.primaryAction).toUpperCase() : 'None',
                        value: stick1.horizontal.primaryAction
                    }}
                    onChange={({ value }) => handleChange('stick1.horizontal.primaryAction', value)}
                    isDisabled={stick1PrimaryActionIsUsingMPG}
                />
                <Select
                    styles={selectOverrideStyle}
                    options={axesOptions}
                    placeholder={null}
                    value={{
                        label: stick1.horizontal.secondaryAction ? String(stick1.horizontal.secondaryAction).toUpperCase() : 'None',
                        value: stick1.horizontal.secondaryAction
                    }}
                    onChange={({ value }) => handleChange('stick1.horizontal.secondaryAction', value)}
                    isDisabled={stick1SecondaryActionIsUsingMPG}
                />
                <Tooltip content="Invert Axis Direction" location="default" wrapperStyle={{ display: 'inherit', justifySelf: 'center' }}>
                    <Checkbox
                        checked={stick1.horizontal.isReversed}
                        onChange={(e) => handleChange('stick1.horizontal.isReversed', e.target.checked)}
                        disabled={stick1PrimaryActionIsUsingMPG && stick1SecondaryActionIsUsingMPG}
                    />
                </Tooltip>
            </div>

            <div className={styles.joystickOption}>
                <div>Stick 1 Up/Down</div>
                <Select
                    styles={selectOverrideStyle}
                    options={axesOptions}
                    placeholder={null}
                    value={{
                        label: stick1.vertical.primaryAction ? String(stick1.vertical.primaryAction).toUpperCase() : 'None',
                        value: stick1.vertical.primaryAction
                    }}
                    onChange={({ value }) => handleChange('stick1.vertical.primaryAction', value)}
                    isDisabled={stick1PrimaryActionIsUsingMPG}
                />
                <Select
                    styles={selectOverrideStyle}
                    options={axesOptions}
                    placeholder={null}
                    value={{
                        label: stick1.vertical.secondaryAction ? String(stick1.vertical.secondaryAction).toUpperCase() : 'None',
                        value: stick1.vertical.secondaryAction
                    }}
                    onChange={({ value }) => handleChange('stick1.vertical.secondaryAction', value)}
                    isDisabled={stick1SecondaryActionIsUsingMPG}
                />
                <Tooltip content="Invert Axis Direction" location="default" wrapperStyle={{ display: 'inherit', justifySelf: 'center' }}>
                    <Checkbox
                        checked={stick1.vertical.isReversed}
                        onChange={(e) => handleChange('stick1.vertical.isReversed', e.target.checked)}
                        disabled={stick1PrimaryActionIsUsingMPG && stick1SecondaryActionIsUsingMPG}
                    />
                </Tooltip>
            </div>

            <div className={styles.joystickOption}>
                <div>Stick 1 Use MPG</div>
                <Select
                    styles={selectOverrideStyle}
                    options={axesOptions}
                    placeholder={null}
                    value={{
                        label: stick1.mpgMode.primaryAction ? String(stick1.mpgMode.primaryAction).toUpperCase() : 'None',
                        value: stick1.mpgMode.primaryAction
                    }}
                    onChange={({ value }) => handleChange('stick1.mpgMode.primaryAction', value)}
                />
                <Select
                    styles={selectOverrideStyle}
                    options={axesOptions}
                    placeholder={null}
                    value={{
                        label: stick1.mpgMode.secondaryAction ? String(stick1.mpgMode.secondaryAction).toUpperCase() : 'None',
                        value: stick1.mpgMode.secondaryAction
                    }}
                    onChange={({ value }) => handleChange('stick1.mpgMode.secondaryAction', value)}
                />
                <Tooltip content="Invert Axis Direction" location="default" wrapperStyle={{ display: 'inherit', justifySelf: 'center' }}>
                    <Checkbox
                        checked={stick1.mpgMode.isReversed}
                        onChange={(e) => handleChange('stick1.mpgMode.isReversed', e.target.checked)}
                    />
                </Tooltip>
            </div>

            <div className={styles.joystickOption}>
                <div>Stick 2 Left/Right</div>
                <Select
                    styles={selectOverrideStyle}
                    options={axesOptions}
                    placeholder={null}
                    value={{
                        label: stick2.horizontal.primaryAction ? String(stick2.horizontal.primaryAction).toUpperCase() : 'None',
                        value: stick2.horizontal.primaryAction
                    }}
                    onChange={({ value }) => handleChange('stick2.horizontal.primaryAction', value)}
                    isDisabled={stick2PrimaryActionIsUsingMPG}
                />
                <Select
                    styles={selectOverrideStyle}
                    options={axesOptions}
                    placeholder={null}
                    value={{
                        label: stick2.horizontal.secondaryAction ? String(stick2.horizontal.secondaryAction).toUpperCase() : 'None',
                        value: stick2.horizontal.secondaryAction
                    }}
                    onChange={({ value }) => handleChange('stick2.horizontal.secondaryAction', value)}
                    isDisabled={stick2SecondaryActionIsUsingMPG}
                />
                <Tooltip content="Invert Axis Direction" location="default" wrapperStyle={{ display: 'inherit', justifySelf: 'center' }}>
                    <Checkbox
                        checked={stick2.horizontal.isReversed}
                        onChange={(e) => handleChange('stick2.horizontal.isReversed', e.target.checked)}
                        disabled={stick2PrimaryActionIsUsingMPG && stick2SecondaryActionIsUsingMPG}
                    />
                </Tooltip>
            </div>

            <div className={styles.joystickOption}>
                <div>Stick 2 Up/Down</div>
                <Select
                    styles={selectOverrideStyle}
                    options={axesOptions}
                    placeholder={null}
                    value={{
                        label: stick2.vertical.primaryAction ? String(stick2.vertical.primaryAction).toUpperCase() : 'None',
                        value: stick2.vertical.primaryAction
                    }}
                    onChange={({ value }) => handleChange('stick2.vertical.primaryAction', value)}
                    isDisabled={stick2PrimaryActionIsUsingMPG}
                />
                <Select
                    styles={selectOverrideStyle}
                    options={axesOptions}
                    placeholder={null}
                    value={{
                        label: stick2.vertical.secondaryAction ? String(stick2.vertical.secondaryAction).toUpperCase() : 'None',
                        value: stick2.vertical.secondaryAction
                    }}
                    onChange={({ value }) => handleChange('stick2.vertical.secondaryAction', value)}
                    isDisabled={stick2SecondaryActionIsUsingMPG}
                />
                <Tooltip content="Invert Axis Direction" location="default" wrapperStyle={{ display: 'inherit', justifySelf: 'center' }}>
                    <Checkbox
                        checked={stick2.vertical.isReversed}
                        onChange={(e) => handleChange('stick2.vertical.isReversed', e.target.checked)}
                        disabled={stick2PrimaryActionIsUsingMPG && stick2SecondaryActionIsUsingMPG}
                    />
                </Tooltip>
            </div>

            <div className={styles.joystickOption}>
                <div>Stick 2 Use MPG</div>
                <Select
                    styles={selectOverrideStyle}
                    menuPlacement="top"
                    options={axesOptions}
                    placeholder={null}
                    value={{
                        label: stick2.mpgMode.primaryAction ? String(stick2.mpgMode.primaryAction).toUpperCase() : 'None',
                        value: stick2.mpgMode.primaryAction
                    }}
                    onChange={({ value }) => handleChange('stick2.mpgMode.primaryAction', value)}
                />
                <Select
                    styles={selectOverrideStyle}
                    menuPlacement="top"
                    options={axesOptions}
                    placeholder={null}
                    value={{
                        label: stick2.mpgMode.secondaryAction ? String(stick2.mpgMode.secondaryAction).toUpperCase() : 'None',
                        value: stick2.mpgMode.secondaryAction
                    }}
                    onChange={({ value }) => handleChange('stick2.mpgMode.secondaryAction', value)}
                />
                <Tooltip content="Invert Axis Direction" location="default" wrapperStyle={{ display: 'inherit', justifySelf: 'center' }}>
                    <Checkbox
                        checked={stick2.mpgMode.isReversed}
                        onChange={(e) => handleChange('stick2.mpgMode.isReversed', e.target.checked)}
                    />
                </Tooltip>
            </div>

            <div className={styles.joystickOption}>
                <div>Zero Threshold</div>
                <Input
                    value={(zeroThreshold).toFixed(1)}
                    additionalProps={{ min: 0, max: 99, step: 5, type: 'number' }}
                    onChange={(e) => handleChange('zeroThreshold', Number(e.target.value))}
                    className={styles['joystick-option-zero-threshold']}
                    units="%"
                />
            </div>
        </div>
    );
};

export default JoystickOptions;
