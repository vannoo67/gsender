import Toolpath from 'gcode-toolpath';
import get from 'lodash/get';

import store from 'app/store';
import {
    METRIC_UNITS,
    SPIRAL_MOVEMENT,
    ZIG_ZAG_MOVEMENT,
    START_POSITION_BACK_LEFT,
    START_POSITION_BACK_RIGHT,
    START_POSITION_FRONT_LEFT,
    START_POSITION_FRONT_RIGHT,
    START_POSITION_CENTER,
    SPINDLE_MODES,
    SURFACING_DWELL_DURATION
} from 'app/constants';
import controller from 'app/lib/controller';
import defaultState from 'app/store/defaultState';

import { convertToImperial } from '../../Preferences/calculate';

const [M3] = SPINDLE_MODES;

export default class Generator {
    constructor({ surfacing, units, rampingDegrees = 10 }) {
        this.surfacing = surfacing;
        this.units = units;
        this.rampingDegrees = rampingDegrees;
    }

    /**
     * Main function to generate gcode
     */
    generate = () => {
        const defaultSurfacingState = get(defaultState, 'workspace.widgets.surfacing');

        const { surfacing, units, generateGcode, getSafeZValue } = this;
        const { skimDepth, maxDepth, feedrate, spindleRPM, spindle = M3, shouldDwell } = { ...defaultSurfacingState, ...surfacing };

        const wcs = controller.state?.parserstate?.modal?.wcs || 'G54';
        const z = getSafeZValue();

        const dwell = shouldDwell ? [`G04 P${SURFACING_DWELL_DURATION}`] : [];

        const depth = skimDepth;
        const gcodeArr = [
            '(Header)',
            '(Generated by gSender from Sienci Labs)',
            wcs,
            units === METRIC_UNITS ? 'G21 ;mm' : 'G20 ;inches',
            'G90',
            `G0 Z${z}`,
            'G0 X0 Y0',
            `G1 F${feedrate}`,
            `${spindle} S${spindleRPM}`,
            ...dwell,
            '(Header End)',
            '\n'
        ];

        function processGcode(arr, depth, count, maxDepth) {
            const gcodeLayer = generateGcode({ depth: depth < maxDepth ? depth : maxDepth, count });
            arr.push(...gcodeLayer);

            if (depth >= maxDepth) {
                return arr;
            }

            return processGcode(arr, depth + skimDepth, count + 1, maxDepth);
        }

        const processedGcode = processGcode([], depth, 1, maxDepth);

        gcodeArr.push(...processedGcode);

        gcodeArr.push(
            '(Footer)',
            'M5 ;Turn off spindle',
            ...dwell,
            '(End of Footer)'
        );

        //Convert to string for interpretation
        const gcodeArrStr = gcodeArr.join('\n');

        return gcodeArrStr;
    };

    /**
     * Function to generate gcode array
     * @param {number} depth - Depth value for Z axis
     * @param {number} count - Count value keeping track of the number of layers
     * @returns {array} - Returns the generated gcode set in an array
     */
    generateGcode = ({ depth, count }) => {
        const {
            bitDiameter,
            stepover,
            length,
            width,
            maxDepth,
            startPosition,
            type,
            cutDirectionFlipped,
            skimDepth,
        } = this.surfacing;

        const stepoverPercentage = stepover > 80 ? 80 / 100 : stepover / 100;

        const stepoverAmount = this.toFixedValue(bitDiameter * stepoverPercentage);

        const DEFAULT_FACTOR = { x: 1, y: -1 };

        const axisFactors = {
            [START_POSITION_BACK_LEFT]: { x: 1, y: -1 },
            [START_POSITION_BACK_RIGHT]: { x: -1, y: -1 },
            [START_POSITION_FRONT_LEFT]: { x: 1, y: 1 },
            [START_POSITION_FRONT_RIGHT]: { x: -1, y: 1 },
            [START_POSITION_CENTER]: DEFAULT_FACTOR,
        }[startPosition] ?? DEFAULT_FACTOR;

        const options = {
            depth,
            length,
            width,
            count,
            stepoverAmount,
            maxDepth,
            axisFactors,
            cutDirectionFlipped,
            startPosition,
        };

        const executeSurfacing = {
            [SPIRAL_MOVEMENT]: this.generateSpiral,
            [ZIG_ZAG_MOVEMENT]: this.generateZigZag
        }[type];

        const gcodeArr = executeSurfacing(options);

        const safeHeight = this.getSafeZValue();
        const zValue = this.toFixedValue(safeHeight - (depth - skimDepth));
        const startPosGcode = count === 1 ? [] : [
            '(Move to Starting Height)',
            `G0 Z${zValue}`,
            '(End of Move to Starting Height)',
            ''
        ];

        return [
            `(*** Layer ${count} ***)`,
            ...startPosGcode,
            ...gcodeArr,
            `(*** End of Layer ${count} ***)`,
            '\n',
        ];
    };

    toFixedValue(value = 0, amount = 3) {
        return Number(value.toFixed(amount));
    }

    rampIntoMaterial = (z, direction = { axis: 'Y', factor: 1 }) => {
        const { axis, factor } = direction;
        const degrees = this.rampingDegrees;
        const { skimDepth } = this.surfacing;
        const units = store.get('workspace.units');
        const depth = skimDepth;
        const EXTRA_LENGTH = units === METRIC_UNITS ? 1 : convertToImperial(1);
        const safeHeight = this.getSafeZValue();
        const EXTRA_RAMP_COAST = units === METRIC_UNITS ? 5 : convertToImperial(5);
        const RAMP_HEIGHT = (Math.abs(depth) * -1) - safeHeight;

        const rampingLength = Number(((depth + safeHeight + EXTRA_LENGTH) / getTanFromDegrees(degrees)).toFixed(2));

        function getTanFromDegrees(degrees) {
            return Math.tan(degrees * Math.PI / 180);
        }

        const rampingArr = [];

        rampingArr.push(
            '(Ramping into Material)',
            'G91',
            `G1 ${axis}${(rampingLength * factor)} Z${RAMP_HEIGHT}`,
            `G1 ${axis}${(EXTRA_RAMP_COAST * factor)}`,
            `G1 ${axis}${(rampingLength + EXTRA_RAMP_COAST) * factor * -1}`,
            'G90',
            '(End of Ramping into Material)',
            ''
        );

        return rampingArr;
    }


    drawInitialPerimeter = (x, y, z, direction, shouldZeroAxisZ = true, startPosition, cutDirectionFlipped) => {
        const enterMaterial = this.rampIntoMaterial(z, direction);

        let mainPerimeterArea = [
            'G91',
            `G1 Y${Math.abs(y) * -1}`,
            `G1 X${Math.abs(x)}`,
            `G1 Y${Math.abs(y)}`,
            `G1 X${Math.abs(x) * -1}`,
            'G90'
        ];

        if (startPosition !== START_POSITION_CENTER) {
            mainPerimeterArea = cutDirectionFlipped ?
                [`G1 X${x}`, `G1 Y${y}`, 'G1 X0', 'G1 Y0']
                : [`G1 Y${y}`, `G1 X${x}`, 'G1 Y0', 'G1 X0'];
        }

        return [
            '(Covering Surfacing Perimeter)',
            ...enterMaterial,
            ...mainPerimeterArea,
            ...(shouldZeroAxisZ ? ['G1 Z0'] : []),
            '(End of Covering Surfacing Perimeter)',
            ''
        ];
    }

    enterSpiralStartArea(x, y, singleMovement = false, movementType = 'G0', lastAxis = 'X') {
        const movement = [];

        const X = x ? 'X' + x : undefined;
        const Y = y ? 'Y' + y : undefined;

        if (singleMovement) {
            if (lastAxis === 'X') {
                movement.push(`${movementType} ${Y || ''} ${X || ''}`.trim());
            }

            if (lastAxis === 'Y') {
                movement.push(`${movementType} ${X || ''} ${Y || ''}`.trim());
            }
        } else {
            if (lastAxis === 'X') {
                if (Y) {
                    movement.push(`${movementType} ${Y}`);
                }
                if (X) {
                    movement.push(`${movementType} ${X}`);
                }
            }

            if (lastAxis === 'Y') {
                if (X) {
                    movement.push(`${movementType} ${X}`);
                }
                if (Y) {
                    movement.push(`${movementType} ${Y}`);
                }
            }
        }

        return [
            '(Entering Start Position)',
            'G91',
            ...movement,
            'G90',
            '(End of Entering Start Position)',
            ''
        ];
    }

    getSafeZValue() {
        const workspaceUnits = store.get('workspace.units');
        const zVal = workspaceUnits === METRIC_UNITS ? 3 : 0.12;

        return zVal;
    }

    returnToZero = () => {
        const z = this.getSafeZValue();

        return [
            '(Returning to Zero)',
            `G0 Z${z}`,
            'G0 X0 Y0',
            '(End of Returning to Zero)',
            ''
        ];
    }

    generateSpiral = (options) => {
        const {
            drawInitialPerimeter,
            enterSpiralStartArea,
            drawSpiral,
            returnToZero,
            toFixedValue,
        } = this;
        const { depth, length, width, axisFactors, stepoverAmount, cutDirectionFlipped, startPosition } = options;
        const { x: xFactor, y: yFactor } = axisFactors;
        const startIsInCenter = startPosition === START_POSITION_CENTER;

        const x = toFixedValue(width * xFactor);
        const y = toFixedValue(length * yFactor);
        const z = toFixedValue(depth * -1);

        const halfOfLength = toFixedValue(length / 2);
        const halfOfWidth = toFixedValue(width / 2);

        const startPos = {
            x: cutDirectionFlipped ? 0 : toFixedValue(stepoverAmount),
            y: cutDirectionFlipped ? toFixedValue(stepoverAmount * 2) : toFixedValue(stepoverAmount),
        };

        const endPos = {
            x: toFixedValue(width - stepoverAmount),
            y: toFixedValue(length - stepoverAmount),
        };

        const direction = {
            axis: 'Y',
            factor: axisFactors.y,
        };

        if (width >= length) {
            direction.axis = 'X';
            direction.factor = axisFactors.x;
        }

        function getNewStartPos(startPos) {
            return {
                x: toFixedValue(startPos.x + stepoverAmount),
                y: toFixedValue(startPos.y + stepoverAmount),
            };
        }

        function getNewEndPos(endPos) {
            return {
                x: toFixedValue(endPos.x - stepoverAmount),
                y: toFixedValue(endPos.y - stepoverAmount),
            };
        }

        function exitCondition (startPos, endPos, prevStartPos, prevEndPos) {
            return endPos.x < startPos.x || endPos.y < startPos.y;
        }

        function processGcode (startPos, endPos, prevStartPos, prevEndPos, xFactor, yFactor) {
            const arr = [];

            const xValueStart = startIsInCenter ? toFixedValue((halfOfWidth - endPos.x) * xFactor) : toFixedValue(endPos.x * xFactor);
            const yValueStart = startIsInCenter ? toFixedValue((halfOfLength - endPos.y) * yFactor) : toFixedValue(endPos.y * yFactor);
            const xValueEnd = startIsInCenter
                ? toFixedValue((halfOfWidth - (startPos.x + stepoverAmount)) * xFactor)
                : toFixedValue((startPos.x + stepoverAmount) * xFactor);
            const yValueEnd = startIsInCenter ? toFixedValue((halfOfLength - startPos.y) * yFactor) : toFixedValue(startPos.y * yFactor);

            if (cutDirectionFlipped) {
                if (endPos.x >= startPos.x) {
                    arr.push(
                        `G1 X${xValueStart}`,
                    );

                    if (length >= width) {
                        arr.push(
                            `G1 Y${yValueStart}`,
                        );

                        if (endPos.x >= startPos.x + stepoverAmount) {
                            arr.push(`G1 X${xValueEnd}`,);
                        }
                    }

                    if (endPos.y >= (startPos.y)) {
                        if (width > length) {
                            arr.push(
                                `G1 Y${yValueStart}`,
                                `G1 X${xValueEnd}`,
                            );
                        }

                        arr.push(
                            `G1 Y${yValueEnd}`,
                        );
                    }
                }
            } else {
                if (endPos.y >= startPos.y) {
                    arr.push(
                        `G1 Y${yValueStart}`,
                    );

                    if (width >= length) {
                        arr.push(
                            `G1 X${xValueStart}`,
                            `G1 Y${yValueEnd}`,
                        );
                    }
                }


                if (endPos.x >= startPos.x) {
                    if (length > width) {
                        arr.push(
                            `G1 X${xValueStart}`,
                            `G1 Y${yValueEnd}`,
                        );
                    }

                    if (endPos.x >= (startPos.x + stepoverAmount)) {
                        arr.push(
                            `G1 X${xValueEnd}`,
                        );
                    }
                }
            }

            arr.push('');

            return arr;
        }

        const initialPerimeter = drawInitialPerimeter(x, y, z, direction, false, startPosition, cutDirectionFlipped);
        const spirals = drawSpiral(
            [],
            startPos,
            endPos,
            startPos,
            endPos,
            options,
            processGcode,
            exitCondition,
            getNewStartPos,
            getNewEndPos
        );
        const returnToStart = returnToZero();
        const spiralStartArea = enterSpiralStartArea(stepoverAmount * xFactor, stepoverAmount * yFactor, false, 'G1', direction.axis);

        const toolpath = new Toolpath();
        toolpath.loadFromStringSync(spirals.join('\n'));
        const position = toolpath.getPosition();

        const mainSpiralArea = [];

        const startFromCenterPerimeter = drawInitialPerimeter(width, length, z, direction, false, startPosition);

        const startFromCenterPerimeterPosition = [
            '(Entering Perimeter Start Position)',
            `G0 X${halfOfWidth * -1} Y${halfOfLength}`,
            '(End of Entering Perimeter Start Position)',
            ''
        ];

        const safeHeight = this.getSafeZValue();
        const zValue = toFixedValue(safeHeight - (depth - this.surfacing.skimDepth));
        const startFromCenterStartPosition = [
            '(Entering Start Position)',
            `G0 Z${zValue} ; Start Pos - (Curr Depth - Cut Depth)`,
            `G0 X${position.x} Y${position.y}`,
            'G91',
            `G0 Z${(Math.abs(depth) * -1) - safeHeight}`,
            'G90',
            '(End of Entering Start Position)',
            ''
        ];

        if (startIsInCenter) {
            mainSpiralArea.push(
                ...startFromCenterPerimeterPosition,
                ...startFromCenterPerimeter,
                ...startFromCenterStartPosition,
                ...spirals.reverse(),
            );
        } else {
            mainSpiralArea.push(
                ...spirals,
            );
        }

        const remainderXFactor = cutDirectionFlipped ? 1 : -1;
        const remainderYFactor = cutDirectionFlipped ? -1 : 1;
        const remainder = cutDirectionFlipped
            ? [
                '',
                '(Cover Remaining Area)',
                `G1 Y${toFixedValue(Math.abs(halfOfLength - stepoverAmount) * remainderYFactor)}`,
                `G1 X${toFixedValue(Math.abs(halfOfWidth - stepoverAmount) * remainderXFactor * -1)}`,
                `G1 X${toFixedValue(Math.abs(halfOfWidth - stepoverAmount) * remainderXFactor)}`,
                `G1 Y${toFixedValue(Math.abs(halfOfLength) * remainderXFactor * -1)}`,
                '(End of Cover Remaining Area)',
                ''
            ]
            : [
                '',
                '(Cover Remaining Area)',
                `G1 X${toFixedValue(Math.abs(halfOfWidth - stepoverAmount) * remainderXFactor * -1)}`,
                `G1 Y${toFixedValue(Math.abs(halfOfLength) * -remainderYFactor)}`,
                '(End of Cover Remaining Area)',
                ''
            ];

        /**
         * 1. Draw initial surfacing area perimeter
         * 2. Move to the start area
         * 3. Begin drawing spiral recursively
         * 4. End of spiral, move z axis up and return to the zero position
         **/
        const gcodeArr = startIsInCenter
            ? [
                ...mainSpiralArea.flat(),
                ...remainder,
                ...returnToStart,
            ]
            : [
                ...initialPerimeter,
                ...spiralStartArea,
                ...mainSpiralArea.flat(),
                ...returnToStart,
            ];

        return gcodeArr;
    }

    drawSpiral = (arr, startPos, endPos, prevStartPos, prevEndPos, options, processGcode, exitCondition, getNewStartPos, getNewEndPos) => {
        const { drawSpiral } = this;
        const { axisFactors, } = options;
        const { x: xFactor, y: yFactor } = axisFactors;

        arr.push(...processGcode(startPos, endPos, prevStartPos, prevEndPos, xFactor, yFactor));

        if (exitCondition(startPos, endPos, prevStartPos, prevEndPos)) {
            return arr;
        }

        const nextStartPos = getNewStartPos(startPos);
        const nextEndPos = getNewEndPos(endPos);

        return drawSpiral(arr, nextStartPos, nextEndPos, startPos, endPos, options, processGcode, exitCondition, getNewStartPos, getNewEndPos);
    }

    generateZigZag = (options) => {
        const { depth, length, width, axisFactors, stepoverAmount, cutDirectionFlipped, startPosition } = options;
        const { x: xFactor, y: yFactor } = axisFactors;
        const { toFixedValue, drawInitialPerimeter, drawZigZag, returnToZero, rampIntoMaterial } = this;
        const startIsInCenter = startPosition === START_POSITION_CENTER;

        const x = toFixedValue(width * xFactor);
        const y = toFixedValue(length * yFactor);
        const z = toFixedValue(depth * -1);

        const startPos = {
            x: cutDirectionFlipped ? toFixedValue(stepoverAmount) : width,
            y: cutDirectionFlipped ? length : toFixedValue(stepoverAmount),
        };

        const endPos = {
            x: cutDirectionFlipped ? toFixedValue(stepoverAmount * 2) : 0,
            y: cutDirectionFlipped ? 0 : toFixedValue(stepoverAmount * 2),
        };


        const direction = {
            axis: 'Y',
            factor: axisFactors.y,
        };

        if (width > length) {
            direction.axis = 'X';
            direction.factor = axisFactors.x;
        }

        function exitCondition(startPos, endPos) {
            return cutDirectionFlipped ? startPos.x >= width : startPos.y >= length;
        }

        function getNewStartPos(startPos, endPos) {
            if (cutDirectionFlipped) {
                return {
                    x: toFixedValue(endPos.x + stepoverAmount),
                    y: startPos.y
                };
            }

            return {
                x: startPos.x,
                y: toFixedValue(endPos.y + stepoverAmount)
            };
        }

        function getNewEndPos(endPos) {
            if (cutDirectionFlipped) {
                return {
                    x: toFixedValue(endPos.x + (stepoverAmount * 2)),
                    y: endPos.y,
                };
            }

            return {
                x: endPos.x,
                y: toFixedValue(endPos.y + (stepoverAmount * 2))
            };
        }

        function processGcode(startPos, endPos, xFactor, yFactor) {
            const arr = [];

            const halfOfLength = toFixedValue(length / 2);
            const halfOfWidth = toFixedValue(width / 2);

            if (startIsInCenter) {
                if (cutDirectionFlipped) {
                    if (
                        startPos.x - halfOfWidth > halfOfWidth &&
                        endPos.x - halfOfWidth > halfOfWidth &&
                        startPos.y - halfOfLength <= halfOfLength &&
                        endPos.y - halfOfLength <= halfOfLength
                    ) {
                        arr.push(
                            `G1 Y${toFixedValue(halfOfLength) * -1}`,
                            ''
                        );
                        return arr;
                    }

                    if (startPos.y - halfOfLength <= halfOfLength) {
                        arr.push(
                            `G1 Y${toFixedValue(halfOfLength) * -1}`,
                        );
                    }

                    if (startPos.x - halfOfWidth <= halfOfWidth) {
                        arr.push(
                            `G1 X${toFixedValue((halfOfWidth * -1) + startPos.x)}`,
                        );
                    }

                    if (endPos.y - halfOfLength <= halfOfLength) {
                        arr.push(
                            `G1 Y${toFixedValue(halfOfLength)}`,
                        );
                    }

                    if (endPos.x - halfOfWidth <= halfOfWidth) {
                        arr.push(
                            `G1 X${toFixedValue((halfOfWidth * -1) + endPos.x)}`
                        );
                    }
                } else {
                    if (startPos.y - halfOfLength <= halfOfLength) {
                        arr.push(
                            `G1 Y${toFixedValue(halfOfLength - startPos.y)}`,
                            `G1 X${toFixedValue(halfOfWidth)}`,
                        );
                    }

                    if (endPos.y - halfOfLength <= halfOfLength) {
                        arr.push(
                            `G1 Y${toFixedValue(halfOfLength - endPos.y)}`,
                            `G1 X${toFixedValue(halfOfWidth) * -1}`,
                        );
                    }
                }

                arr.push('');

                return arr;
            }

            if (cutDirectionFlipped) {
                if (startPos.x <= width) {
                    arr.push(
                        `G1 X${toFixedValue(startPos.x * xFactor)}`,
                        `G1 Y${toFixedValue(startPos.y * yFactor)}`,
                    );
                }

                if (endPos.x <= width) {
                    arr.push(
                        `G1 X${toFixedValue(endPos.x * xFactor)}`,
                        `G1 Y${toFixedValue(endPos.y * yFactor)}`,
                    );
                }
            } else {
                if (startPos.y <= length) {
                    arr.push(
                        `G1 Y${toFixedValue(startPos.y * yFactor)}`,
                        `G1 X${toFixedValue(startPos.x * xFactor)}`,
                    );
                }

                if (endPos.y <= length) {
                    arr.push(
                        `G1 Y${toFixedValue(endPos.y * yFactor)}`,
                        `G1 X${toFixedValue(endPos.x * xFactor)}`,
                    );
                }
            }

            arr.push('');

            return arr;
        }

        const initialPerimeter = drawInitialPerimeter(x, y, z, direction, false,);
        const spirals = drawZigZag([], startPos, endPos, options, processGcode, exitCondition, getNewStartPos, getNewEndPos);
        const returnToStart = returnToZero();

        const startArea = [
            '(Entering Start Area)',
            `G0 X${toFixedValue(width / 2) * -1} Y${toFixedValue(length / 2)}`,
            '(End of Entering Start Area)',
        ];

        const startFromCenterPerimeter = [
            '(Drawing Perimeter)',
            `G0 X${toFixedValue((width / 2) * -1)}`,
            `G0 Y${toFixedValue(length / 2)}`,

            `G1 Y${toFixedValue(length / 2) * -1}`,
            `G1 X${toFixedValue(width / 2)}`,
            `G1 Y${toFixedValue(length / 2)}`,
            `G1 X${toFixedValue(width / 2) * -1}`,
            '(End of Drawing Perimeter)',
            '',
        ];

        /**
         * 1. Draw initial surfacing area perimeter and do not zero z axis
         * 2. Begin drawing zig zag recursively
         * 4. End of zig zag, move z axis up and return to the zero position
         **/
        const gcodeArr = startIsInCenter
            ? [
                ...startArea,
                ...rampIntoMaterial(z, direction),
                ...startFromCenterPerimeter,
                ...spirals,
                ...returnToStart,
            ]
            : [
                ...initialPerimeter,
                ...spirals,
                ...returnToStart,
            ];

        return gcodeArr;
    }

    drawZigZag = (arr, startPos, endPos, options, processGcode, exitCondition, getNewStartPos, getNewEndPos) => {
        const { axisFactors } = options;
        const { x: xFactor, y: yFactor } = axisFactors;
        const { drawZigZag } = this;

        arr.push(...processGcode(startPos, endPos, xFactor, yFactor));

        if (exitCondition(startPos, endPos)) {
            return arr;
        }

        const nextStartPos = getNewStartPos(startPos, endPos);
        const nextEndPos = getNewEndPos(endPos);

        return drawZigZag(arr, nextStartPos, nextEndPos, options, processGcode, exitCondition, getNewStartPos, getNewEndPos);
    }
}
