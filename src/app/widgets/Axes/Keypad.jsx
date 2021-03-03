/* eslint-disable react/self-closing-comp */
import ensureArray from 'ensure-array';
import frac from 'frac';
import _uniqueId from 'lodash/uniqueId';
import _includes from 'lodash/includes';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { MenuItem } from 'app/components/Dropdown';
import Space from 'app/components/Space';
import controller from 'app/lib/controller';
import i18n from 'app/lib/i18n';
import Fraction from './components/Fraction';
import {
    IMPERIAL_UNITS,
    IMPERIAL_STEPS,
    METRIC_UNITS,
    METRIC_STEPS
} from '../../constants';
import styles from './index.styl';
import JogControl from './components/JogControl';
import JogCancel from './components/JogCancel';
import FunctionButton from '../../components/FunctionButton/FunctionButton';

const KeypadText = styled.span`
    position: relative;
    display: inline-block;
    vertical-align: baseline;
`;

const KeypadDirectionText = styled(KeypadText)`
    min-width: 10px;
`;


class Keypad extends PureComponent {
    static propTypes = {
        canClick: PropTypes.bool,
        units: PropTypes.oneOf([IMPERIAL_UNITS, METRIC_UNITS]),
        axes: PropTypes.array,
        jog: PropTypes.object,
        actions: PropTypes.object
    };

    handleSelect = (eventKey) => {
        const commands = ensureArray(eventKey);
        commands.forEach(command => controller.command('gcode', command));
    };

    renderRationalNumberWithBoundedDenominator(value) {
        // https://github.com/SheetJS/frac
        const denominatorDigits = 4;
        const maximumDenominator = Math.pow(10, Number(denominatorDigits) || 0) - 1; // 10^4 - 1 = 9999
        const [quot, numerator, denominator] = frac(value, maximumDenominator, true);

        if (numerator > 0) {
            return (
                <span>
                    {quot > 0 ? quot : ''}
                    <Space width="2" />
                    <Fraction
                        numerator={numerator}
                        denominator={denominator}
                    />
                </span>
            );
        }

        return (
            <span>{quot > 0 ? quot : ''}</span>
        );
    }

    renderImperialMenuItems() {
        const { jog } = this.props;
        const imperialJogDistances = ensureArray(jog.imperial.distances);
        const imperialJogSteps = [
            ...imperialJogDistances,
            ...IMPERIAL_STEPS
        ];
        const step = jog.imperial.step;

        return imperialJogSteps.map((value, key) => {
            const active = (key === step);

            return (
                <MenuItem
                    key={_uniqueId()}
                    eventKey={key}
                    active={active}
                >
                    {value}
                    <Space width="4" />
                    <sub>{i18n._('in')}</sub>
                </MenuItem>
            );
        });
    }

    renderMetricMenuItems() {
        const { jog } = this.props;
        const metricJogDistances = ensureArray(jog.metric.distances);
        const metricJogSteps = [
            ...metricJogDistances,
            ...METRIC_STEPS
        ];
        const step = jog.metric.step;

        return metricJogSteps.map((value, key) => {
            const active = (key === step);

            return (
                <MenuItem
                    key={_uniqueId()}
                    eventKey={key}
                    active={active}
                >
                    {value}
                    <Space width="4" />
                    <sub>{i18n._('mm')}</sub>
                </MenuItem>
            );
        });
    }

    render() {
        const { canClick, actions, axes, isJogging } = this.props;
        const canClickX = canClick && _includes(axes, 'x');
        const canClickY = canClick && _includes(axes, 'y');
        const canClickXY = canClickX && canClickY;
        const canClickZ = canClick && _includes(axes, 'z');

        const xyControlsDisabled = !canClickXY;
        const zControlsDisabled = !canClickZ;

        // Feedrates and distances
        const xyDistance = actions.getXYJogDistance();
        const zDistance = actions.getZJogDistance();
        const feedrate = actions.getFeedrate();

        return (
            <div className={styles.keypad}>
                <div className={styles.keysBody}>
                    <div className={styles.xyKeys}>
                        <JogControl
                            className={styles.btnUpLeft}
                            jog={() => actions.jog({ X: -xyDistance, Y: xyDistance, F: feedrate })}
                            continuousJog={() => actions.startContinuousJog({ X: -1, Y: 1 }, feedrate)}
                            stopContinuousJog={() => actions.stopContinuousJog()}
                            disabled={xyControlsDisabled}
                        >
                        </JogControl>
                        <JogControl
                            className={styles.btnUp}
                            jog={() => actions.jog({ Y: xyDistance, F: feedrate })}
                            continuousJog={() => actions.startContinuousJog({ Y: 1 }, feedrate)}
                            stopContinuousJog={() => actions.stopContinuousJog()}
                            disabled={xyControlsDisabled}
                        >
                            <KeypadText>Y</KeypadText>
                            <KeypadDirectionText>+</KeypadDirectionText>
                        </JogControl>
                        <JogControl
                            className={styles.btnUpRight}
                            jog={() => actions.jog({ X: xyDistance, Y: xyDistance, F: feedrate })}
                            continuousJog={() => actions.startContinuousJog({ X: 1, Y: 1 }, feedrate)}
                            stopContinuousJog={() => actions.stopContinuousJog()}
                            disabled={xyControlsDisabled}
                        >
                        </JogControl>
                        <JogControl
                            className={styles.btnUp}
                            jog={() => actions.jog({ Z: zDistance, F: feedrate })}
                            continuousJog={() => actions.startContinuousJog({ Z: 1 }, feedrate)}
                            stopContinuousJog={() => actions.stopContinuousJog()}
                            disabled={zControlsDisabled}
                        >
                            <KeypadText>Z</KeypadText>
                            <KeypadDirectionText>+</KeypadDirectionText>
                        </JogControl>
                        <JogControl
                            className={styles.btnLeft}
                            jog={() => actions.jog({ X: -xyDistance, F: feedrate })}
                            continuousJog={() => actions.startContinuousJog({ X: -1 }, feedrate)}
                            stopContinuousJog={() => actions.stopContinuousJog()}
                            disabled={xyControlsDisabled}
                        >
                            <KeypadText>X</KeypadText>
                            <KeypadDirectionText>-</KeypadDirectionText>
                        </JogControl>
                        <JogCancel disabled={!isJogging} onClick={() => actions.cancelJog()} />
                        <JogControl
                            className={styles.btnRight}
                            jog={() => actions.jog({ X: xyDistance, F: feedrate })}
                            continuousJog={() => actions.startContinuousJog({ X: 1 }, feedrate)}
                            stopContinuousJog={() => actions.stopContinuousJog()}
                            disabled={xyControlsDisabled}
                        >
                            <KeypadText>X</KeypadText>
                            <KeypadDirectionText>+</KeypadDirectionText>
                        </JogControl>
                        <div />
                        <JogControl
                            className={styles.btnDownLeft}
                            jog={() => actions.jog({ X: -xyDistance, Y: -xyDistance, F: feedrate })}
                            continuousJog={() => actions.startContinuousJog({ X: -1, Y: -1 }, feedrate)}
                            stopContinuousJog={() => actions.stopContinuousJog()}
                            disabled={xyControlsDisabled}
                        >
                        </JogControl>
                        <JogControl
                            className={styles.btnDown}
                            jog={() => actions.jog({ Y: -xyDistance, F: feedrate })}
                            continuousJog={() => actions.startContinuousJog({ Y: -1 }, feedrate)}
                            stopContinuousJog={() => actions.stopContinuousJog()}
                            disabled={xyControlsDisabled}
                        >
                            <KeypadText>Y</KeypadText>
                            <KeypadDirectionText>-</KeypadDirectionText>
                        </JogControl>
                        <JogControl
                            className={styles.btnDownRight}
                            jog={() => actions.jog({ X: xyDistance, Y: -xyDistance, F: feedrate })}
                            continuousJog={() => actions.startContinuousJog({ X: 1, Y: -1 }, feedrate)}
                            stopContinuousJog={() => actions.stopContinuousJog()}
                            disabled={xyControlsDisabled}
                        >
                        </JogControl>
                        <JogControl
                            className={styles.btnDown}
                            jog={() => actions.jog({ Z: -zDistance, F: feedrate })}
                            continuousJog={() => actions.startContinuousJog({ Z: -1 }, feedrate)}
                            stopContinuousJog={() => actions.stopContinuousJog()}
                            disabled={zControlsDisabled}
                        >
                            <KeypadText>Z</KeypadText>
                            <KeypadDirectionText>-</KeypadDirectionText>
                        </JogControl>
                    </div>
                    <div className={styles.presetControls}>
                        <FunctionButton
                            disabled={!canClick} type="button"
                            onClick={() => {
                                actions.setJogFromPreset('rapid');
                            }}
                        >
                            Rapid
                        </FunctionButton>
                        <FunctionButton
                            disabled={!canClick}
                            onClick={() => {
                                actions.setJogFromPreset('normal');
                            }}
                        >
                            Normal
                        </FunctionButton>
                        <FunctionButton
                            disabled={!canClick}
                            onClick={() => {
                                actions.setJogFromPreset('precise');
                            }}
                        >
                            Precise
                        </FunctionButton>
                    </div>
                </div>
            </div>
        );
    }
}

export default Keypad;
