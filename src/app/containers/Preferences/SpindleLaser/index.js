import React, { useState } from 'react';

import ToggleSwitch from 'app/components/ToggleSwitch';
import store from 'app/store';
import controller from 'app/lib/controller';

import SettingWrapper from '../components/SettingWrapper';
import Fieldset from '../components/Fieldset';
import GeneralArea from '../components/GeneralArea';
import TooltipCustom from '../../../components/TooltipCustom/ToolTip';
import Laser from './Laser';
import Spindle from './Spindle';

const SpindleLaser = ({ active, state, actions }) => {
    const [machineProfile, setMachineProfile] = useState(store.get('workspace.machineProfile', {}));

    const handleToggle = () => {
        const value = !machineProfile.spindle;
        const laserOn = machineProfile.laserOnOutline;
        const updatedObj = {
            ...machineProfile,
            spindle: value,
            laserOnOutline: value === false ? false : laserOn
        };

        store.replace('workspace.machineProfile', updatedObj);
        controller.command('machineprofile:load', updatedObj);

        setMachineProfile(updatedObj);
    };

    const handleONToggle = () => {
        const value = !machineProfile.laserOnOutline ? !machineProfile.laserOnOutline : false;
        const updatedObj = {
            ...machineProfile,
            laserOnOutline: value
        };

        store.replace('workspace.machineProfile', updatedObj);
        controller.command('machineprofile:load', updatedObj);

        setMachineProfile(updatedObj);
    };

    const { spindle } = machineProfile;
    const { laserOnOutline } = machineProfile;
    console.log(machineProfile);

    return (
        <SettingWrapper title="Spindle/Laser" show={active}>
            <GeneralArea>
                <GeneralArea.Half>
                    <Fieldset legend="Toggle">
                        <TooltipCustom content="Enable or Disable Spindle/Laser" location="default">
                            <ToggleSwitch
                                label="Spindle/Laser"
                                checked={spindle}
                                onChange={handleToggle}
                                style={{ marginBottom: '1rem' }}
                            />
                        </TooltipCustom>
                        <TooltipCustom content="Enable or Disable Laser ON during Outline" location="default">
                            <ToggleSwitch
                                label="Laser ON during Outline"
                                disabled={!spindle}
                                checked={laserOnOutline}
                                onChange={handleONToggle}
                                style={{ marginBottom: '1rem' }}
                            />
                        </TooltipCustom>
                    </Fieldset>
                    <Spindle state={state} actions={actions} />
                </GeneralArea.Half>
                <GeneralArea.Half>
                    <Laser state={state} actions={actions} />
                </GeneralArea.Half>
            </GeneralArea>
        </SettingWrapper>
    );
};

export default SpindleLaser;
