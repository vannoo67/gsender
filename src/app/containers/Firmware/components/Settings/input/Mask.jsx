import React, { useState, useEffect } from 'react';
// import PropTypes from 'prop-types';
import { uniqueId } from 'lodash';
import ToggleSwitch from 'app/components/ToggleSwitch';

import styles from './index.styl';

const Mask = ({ value, bits, numBits, requiredBit, onChange }) => {
    const getInitialSettings = () => {
        let settings = [];
        for (let i = 0; i < numBits; i++) {
            settings.push(false);
        }
        return settings;
    };
    const [bitShiftSettings, setBitShiftSettings] = useState(getInitialSettings());

    useEffect(() => {
        initializeSettings();
    }, [value]);

    useEffect(() => {
        updateValues(bitShiftSettings);
    }, [bitShiftSettings]);

    const handleSwitch = (value, index) => {
        setBitShiftSettings(prev => {
            const newBitShiftSettings = [...prev];
            newBitShiftSettings[index] = value;
            return newBitShiftSettings;
        });
    };

    const initializeSettings = () => {
        if (!value) {
            return;
        }

        // eslint-disable-next-line no-bitwise
        const binary = (Number(value) >>> 0).toString(2);
        let settings = [];
        for (let i = 0; i < numBits; i++) {
            settings.push(binary.indexOf(i) === '1');
        }

        setBitShiftSettings(settings);
    };

    const updateValues = (values) => {
        let sum = 0;
        for (let i = 0; i < values.length; i++) {
            sum += values[i] ? Math.pow(2, i) : 0;
        }
        onChange(sum.toString());
    };

    return (
        <div className={styles.maskWrapperOutside}>
            <div className={styles.maskWrapper}>
                {
                    bitShiftSettings.map((setting, index) => {
                        return (
                            <div key={uniqueId()} className={styles.controlRow}>
                                <div className={styles.maskTwoTitles}>{bits[index]}</div>
                                <ToggleSwitch disabled={requiredBit !== undefined && index !== requiredBit && !bitShiftSettings[requiredBit]} checked={setting} onChange={(value) => handleSwitch(value, index)} />
                            </div>
                        );
                    })
                }
            </div>
        </div>
    );
};

export default Mask;
