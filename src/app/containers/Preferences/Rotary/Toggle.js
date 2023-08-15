import React, { useState, useEffect } from 'react';
import get from 'lodash/get';

import store from 'app/store';
import Tooltip from 'app/components/TooltipCustom/ToolTip';
import ToggleSwitch from 'app/components/ToggleSwitch';

import Fieldset from '../components/Fieldset';

import styles from '../index.styl';

const Toggle = () => {
    const [showRotaryTab, setShowRotaryTab] = useState(store.get('widgets.rotary.tab.show', false));

    useEffect(() => {
        const updateRotaryTabShow = (data) => {
            const showTab = get(data, 'widgets.rotary.tab.show', false);

            setShowRotaryTab(showTab);
        };

        store.on('change', updateRotaryTabShow);

        return () => {
            store.removeListener('change', updateRotaryTabShow);
        };
    }, []);

    const handleToggle = (val) => {
        store.replace('widgets.rotary.tab.show', val);
    };

    return (
        <Fieldset legend="Toggle">
            <div className={styles.addMargin}>
                <Tooltip
                    content="Show the Rotary Tab Within the Main UI"
                    location="default"
                >
                    <ToggleSwitch
                        onChange={handleToggle}
                        checked={showRotaryTab}
                        label="Display Rotary Tab"
                        size="small"
                    />
                </Tooltip>
            </div>
        </Fieldset>
    );
};

export default Toggle;
