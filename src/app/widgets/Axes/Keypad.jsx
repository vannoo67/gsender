import cx from 'classnames';
import ensureArray from 'ensure-array';
import frac from 'frac';
import _includes from 'lodash/includes';
import _uniqueId from 'lodash/uniqueId';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { Button } from 'app/components/Buttons';
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

const KeypadText = styled.span`
    position: relative;
    display: inline-block;
    vertical-align: baseline;
`;

const KeypadDirectionText = styled(KeypadText)`
    min-width: 10px;
`;

const KeypadSubscriptText = styled(KeypadText)`
    min-width: 10px;
    font-size: 80%;
    line-height: 0;
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
        const { canClick, units, axes, jog, actions } = this.props;
        const canChangeStep = canClick;
        const imperialJogDistances = ensureArray(jog.imperial.distances);
        const metricJogDistances = ensureArray(jog.metric.distances);
        const imperialJogSteps = [
            ...imperialJogDistances,
            ...IMPERIAL_STEPS
        ];
        const metricJogSteps = [
            ...metricJogDistances,
            ...METRIC_STEPS
        ];
        const canStepForward = canChangeStep && (
            (units === IMPERIAL_UNITS && (jog.imperial.step < imperialJogSteps.length - 1)) ||
            (units === METRIC_UNITS && (jog.metric.step < metricJogSteps.length - 1))
        );
        const canStepBackward = canChangeStep && (
            (units === IMPERIAL_UNITS && (jog.imperial.step > 0)) ||
            (units === METRIC_UNITS && (jog.metric.step > 0))
        );
        console.log(canStepBackward);
        console.log(canStepForward);
        const canClickX = canClick && _includes(axes, 'x');
        const canClickY = canClick && _includes(axes, 'y');
        const canClickXY = canClickX && canClickY;
        const canClickZ = canClick && _includes(axes, 'z');
        const highlightX = canClickX && (jog.keypad || jog.axis === 'x');
        const highlightY = canClickY && (jog.keypad || jog.axis === 'y');
        const highlightZ = canClickZ && (jog.keypad || jog.axis === 'z');

        return (
            <div className={styles.keypad}>
                <div className="row no-gutters">
                    <div className="col-xs-8">
                        <div className={styles.rowSpace}>
                            <div className="row no-gutters">
                                <div className="col-xs-3">
                                    <div className={styles.colSpace}>
                                        <Button
                                            btnStyle="flat"
                                            compact
                                            className={styles.btnKeypad}
                                            onClick={() => {
                                                const distance = actions.getJogDistance();
                                                actions.jog({ X: -distance, Y: distance });
                                            }}
                                            disabled={!canClickXY}
                                            title={i18n._('Move X- Y+')}
                                        >
                                            <i className={cx('fa', 'fa-arrow-circle-up', styles['rotate--45deg'])} style={{ fontSize: 16 }} />
                                        </Button>
                                    </div>
                                </div>
                                <div className="col-xs-3">
                                    <div className={styles.colSpace}>
                                        <Button
                                            btnStyle="flat"
                                            compact
                                            className={cx(
                                                styles.btnKeypad,
                                                { [styles.highlight]: highlightY }
                                            )}
                                            onClick={() => {
                                                const distance = actions.getJogDistance();
                                                actions.jog({ Y: distance });
                                            }}
                                            disabled={!canClickY}
                                            title={i18n._('Move Y+')}
                                        >
                                            <KeypadText>Y</KeypadText>
                                            <KeypadDirectionText>+</KeypadDirectionText>
                                        </Button>
                                    </div>
                                </div>
                                <div className="col-xs-3">
                                    <div className={styles.colSpace}>
                                        <Button
                                            btnStyle="flat"
                                            compact
                                            className={styles.btnKeypad}
                                            onClick={() => {
                                                const distance = actions.getJogDistance();
                                                actions.jog({ X: distance, Y: distance });
                                            }}
                                            disabled={!canClickXY}
                                            title={i18n._('Move X+ Y+')}
                                        >
                                            <i className={cx('fa', 'fa-arrow-circle-up', styles['rotate-45deg'])} style={{ fontSize: 16 }} />
                                        </Button>
                                    </div>
                                </div>
                                <div className="col-xs-3">
                                    <div className={styles.colSpace}>
                                        <Button
                                            btnStyle="flat"
                                            compact
                                            className={cx(
                                                styles.btnKeypad,
                                                { [styles.highlight]: highlightZ }
                                            )}
                                            onClick={() => {
                                                const distance = actions.getJogDistance();
                                                actions.jog({ Z: distance });
                                            }}
                                            disabled={!canClickZ}
                                            title={i18n._('Move Z+')}
                                        >
                                            <KeypadText>Z</KeypadText>
                                            <KeypadDirectionText>+</KeypadDirectionText>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.rowSpace}>
                            <div className="row no-gutters">
                                <div className="col-xs-3">
                                    <div className={styles.colSpace}>
                                        <Button
                                            btnStyle="flat"
                                            compact
                                            className={cx(
                                                styles.btnKeypad,
                                                { [styles.highlight]: highlightX }
                                            )}
                                            onClick={() => {
                                                const distance = actions.getJogDistance();
                                                actions.jog({ X: -distance });
                                            }}
                                            disabled={!canClickX}
                                            title={i18n._('Move X-')}
                                        >
                                            <KeypadText>X</KeypadText>
                                            <KeypadDirectionText>-</KeypadDirectionText>
                                        </Button>
                                    </div>
                                </div>
                                <div className="col-xs-3">
                                    <div className={styles.colSpace}>
                                        <Button
                                            btnStyle="flat"
                                            compact
                                            className={styles.btnKeypad}
                                            onClick={() => actions.move({ X: 0, Y: 0 })}
                                            disabled={!canClickXY}
                                            title={i18n._('Move To XY Zero (G0 X0 Y0)')}
                                        >
                                            <KeypadText>X</KeypadText>
                                            <KeypadSubscriptText>0</KeypadSubscriptText>
                                            <KeypadText>Y</KeypadText>
                                            <KeypadSubscriptText>0</KeypadSubscriptText>
                                        </Button>
                                    </div>
                                </div>
                                <div className="col-xs-3">
                                    <div className={styles.colSpace}>
                                        <Button
                                            btnStyle="flat"
                                            compact
                                            className={cx(
                                                styles.btnKeypad,
                                                { [styles.highlight]: highlightX }
                                            )}
                                            onClick={() => {
                                                const distance = actions.getJogDistance();
                                                actions.jog({ X: distance });
                                            }}
                                            disabled={!canClickX}
                                            title={i18n._('Move X+')}
                                        >
                                            <KeypadText>X</KeypadText>
                                            <KeypadDirectionText>+</KeypadDirectionText>
                                        </Button>
                                    </div>
                                </div>
                                <div className="col-xs-3">
                                    <div className={styles.colSpace}>
                                        <Button
                                            btnStyle="flat"
                                            compact
                                            className={styles.btnKeypad}
                                            onClick={() => actions.move({ Z: 0 })}
                                            disabled={!canClickZ}
                                            title={i18n._('Move To Z Zero (G0 Z0)')}
                                        >
                                            <KeypadText>Z</KeypadText>
                                            <KeypadSubscriptText>0</KeypadSubscriptText>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.rowSpace}>
                            <div className="row no-gutters">
                                <div className="col-xs-3">
                                    <div className={styles.colSpace}>
                                        <Button
                                            btnStyle="flat"
                                            compact
                                            className={styles.btnKeypad}
                                            onClick={() => {
                                                const distance = actions.getJogDistance();
                                                actions.jog({ X: -distance, Y: -distance });
                                            }}
                                            disabled={!canClickXY}
                                            title={i18n._('Move X- Y-')}
                                        >
                                            <i className={cx('fa', 'fa-arrow-circle-down', styles['rotate-45deg'])} style={{ fontSize: 16 }} />
                                        </Button>
                                    </div>
                                </div>
                                <div className="col-xs-3">
                                    <div className={styles.colSpace}>
                                        <Button
                                            btnStyle="flat"
                                            compact
                                            className={cx(
                                                styles.btnKeypad,
                                                { [styles.highlight]: highlightY }
                                            )}
                                            onClick={() => {
                                                const distance = actions.getJogDistance();
                                                actions.jog({ Y: -distance });
                                            }}
                                            disabled={!canClickY}
                                            title={i18n._('Move Y-')}
                                        >
                                            <KeypadText>Y</KeypadText>
                                            <KeypadDirectionText>-</KeypadDirectionText>
                                        </Button>
                                    </div>
                                </div>
                                <div className="col-xs-3">
                                    <div className={styles.colSpace}>
                                        <Button
                                            btnStyle="flat"
                                            compact
                                            className={styles.btnKeypad}
                                            onClick={() => {
                                                const distance = actions.getJogDistance();
                                                actions.jog({ X: distance, Y: -distance });
                                            }}
                                            disabled={!canClickXY}
                                            title={i18n._('Move X+ Y-')}
                                        >
                                            <i className={cx('fa', 'fa-arrow-circle-down', styles['rotate--45deg'])} style={{ fontSize: 16 }} />
                                        </Button>
                                    </div>
                                </div>
                                <div className="col-xs-3">
                                    <div className={styles.colSpace}>
                                        <Button
                                            btnStyle="flat"
                                            compact
                                            className={cx(
                                                styles.btnKeypad,
                                                { [styles.highlight]: highlightZ }
                                            )}
                                            onClick={() => {
                                                const distance = actions.getJogDistance();
                                                actions.jog({ Z: -distance });
                                            }}
                                            disabled={!canClickZ}
                                            title={i18n._('Move Z-')}
                                        >
                                            <KeypadText>Z</KeypadText>
                                            <KeypadDirectionText>-</KeypadDirectionText>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xs-4">
                        <button className={styles.movementRateButton}>Rapid</button>
                        <button className={styles.movementRateButton}>Normal</button>
                        <button className={styles.movementRateButton}>Precise</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Keypad;
