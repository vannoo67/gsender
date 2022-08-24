import Toolpath from 'gcode-toolpath';

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
    SPINDLE_MODES
} from 'app/constants';
import { convertToImperial } from '../../Preferences/calculate';

const [M3] = SPINDLE_MODES;

export default class Generator {
    constructor({ surfacing, units, controller, rampingDegrees = 10 }) {
        this.surfacing = surfacing;
        this.units = units;
        this.controller = controller;
        this.rampingDegrees = rampingDegrees;
    }

    /**
     * Main function to generate gcode
     */
    handleGenerate = () => {
        const { surfacing, controller, units, generateGcode } = this;
        const { skimDepth, maxDepth, feedrate, spindleRPM, spindle = M3 } = surfacing;

        let wcs = controller.state?.parserstate?.modal?.wcs || 'G54';

        let depth = skimDepth;
        let gCodeArr = [
            '(Header)',
            '(Generated by gSender from Sienci Labs)',
            wcs,
            units === METRIC_UNITS ? 'G21 ;mm' : 'G20 ;inches',
            'G90',
            'G0 X0 Y0',
            `G1 F${feedrate}`,
            `${spindle} S${spindleRPM}`,
            '(Header End)',
            '\n'
        ];
        let count = 1;

        function processGcode(obj) {
            const generatedArr = generateGcode({ depth: obj.depth, count: obj.count });
            gCodeArr.push(...generatedArr);
            count++;
            depth += skimDepth;
        }

        //Skip loop if there is only 1 layer
        if (depth === maxDepth) {
            processGcode({ depth: maxDepth, count });
        } else {
            // eslint-disable-next-line no-constant-condition
            while (true) {
                if (depth >= maxDepth) {
                    processGcode({ depth: maxDepth, count });
                    break;
                } else {
                    processGcode({ depth, count });
                }
            }
        }
        gCodeArr.push(
            '\n',
            '(Footer)',
            'M5 ;Turn off spindle',
            '(Footer End)'
        );

        const gCodeArrStr = gCodeArr.join('\n');

        return gCodeArrStr;
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
        } = this.surfacing;

        const stepoverAmount = this.toFixedValue(bitDiameter * (stepover / 100));

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

        const surfacingTypeFunction = {
            [SPIRAL_MOVEMENT]: this.generateSpiral,
            [ZIG_ZAG_MOVEMENT]: this.generateZigZag
        }[type];

        const gcodeArr = surfacingTypeFunction(options);

        return gcodeArr;
    };

    toFixedValue(value = 0, amount = 3) {
        return Number(value.toFixed(amount));
    }

    rampIntoMaterial = (z, direction = { axis: 'Y', factor: 1 }) => {
        const { axis, factor } = direction;
        const degrees = this.rampingDegrees;
        const { skimDepth, feedrate } = this.surfacing;
        const units = store.get('workspace.units');
        const depth = skimDepth;
        const extraLength = units === METRIC_UNITS ? 1 : convertToImperial(1);
        const rampingLength = Number(((depth + extraLength) / getTanFromDegrees(degrees)).toFixed(2));
        const halfOfFeedrate = Math.round((feedrate / 2));

        function getTanFromDegrees(degrees) {
            return Math.tan(degrees * Math.PI / 180);
        }

        const rampingArr = [];

        rampingArr.push(
            '(Ramping into Material)',
            'G91',
            `G0 ${axis}${rampingLength * factor}`,
            `G1 ${axis}${(rampingLength * factor) * -1} Z${z} F${halfOfFeedrate}`, //Negate and return to starting position
            `G1 F${feedrate}`, // Set back to regular feedrate
            'G90', //Set back to absolute positioning
            '(End of Ramping into Material)',
            ''
        );

        return rampingArr;
    }

    drawInitialPerimeter = (x, y, z, direction, shouldZeroAxisZ = true, startPosition) => {
        const enterMaterial = this.rampIntoMaterial(z, direction);

        const mainPerimeterArea = startPosition === START_POSITION_CENTER
            ? [`G1 Y${Math.abs(y) * -1}`, `G1 X${Math.abs(x)}`, `G1 Y${Math.abs(y)}`, `G1 X${Math.abs(x) * -1}`]
            : [`G1 Y${y}`, `G1 X${x}`, 'G1 Y0', 'G1 X0'];

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
        const Z_VALUE = workspaceUnits === METRIC_UNITS ? '3' : '0.12';

        return Z_VALUE;
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
        const { drawInitialPerimeter, enterSpiralStartArea, drawSpiral, returnToZero, rampIntoMaterial, toFixedValue } = this;
        // const { depth, length, width, axisFactors, count, stepoverAmount, startFromCenter } = options;
        const { depth, length, width, axisFactors, count, stepoverAmount, cutDirectionFlipped, startPosition } = options;
        const { x: xFactor, y: yFactor } = axisFactors;
        const startIsInCenter = startPosition === START_POSITION_CENTER;

        const x = toFixedValue(width * xFactor);
        const y = toFixedValue(length * yFactor);
        const z = toFixedValue(depth * -1);

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

        if (width >= length || cutDirectionFlipped) {
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
                x: toFixedValue(startIsInCenter ? endPos.x - stepoverAmount * 2 : endPos.x - stepoverAmount),
                y: toFixedValue(startIsInCenter ? endPos.y - stepoverAmount * 2 : endPos.y - stepoverAmount),
            };
        }

        function exitCondition (startPos, endPos) {
            return endPos.x <= startPos.x || endPos.y <= startPos.y;
        }

        function centerExitCondition(startPos) {
            return cutDirectionFlipped ? startPos.y >= (length / 2) : startPos.x >= (width / 2);
        }

        function processGcode (startPos, endPos, xFactor, yFactor) {
            const arr = [];

            const xValueStart = toFixedValue(endPos.x * xFactor);
            const yValueStart = toFixedValue(endPos.y * yFactor);
            const xValueEnd = toFixedValue((startPos.x + stepoverAmount) * xFactor);
            const yValueEnd = toFixedValue(startPos.y * yFactor);

            if (startIsInCenter) {
                // const firstSegmentX = toFixedValue(Math.abs(endPos.x - stepoverAmount));
                // const firstSegmentY = toFixedValue(Math.abs(endPos.y) * -1);

                // const secondSegmentX = toFixedValue(Math.abs(endPos.x - stepoverAmount * 2) * -1);
                // const secondSegmentY = toFixedValue(Math.abs(endPos.y - stepoverAmount));

                if (cutDirectionFlipped) {
                    // arr.push(
                    //     `G1 X${firstSegmentX}`,
                    //     `G1 Y${firstSegmentY}`,
                    //     `G1 X${secondSegmentX}`,
                    //     `G1 Y${secondSegmentY}`,
                    // );
                    arr.push(
                        `G1 X-${startPos.x}`,
                        `G1 Y${startPos.y}`,
                        `G1 X${startPos.x}`,
                        `G1 Y-${startPos.y}`,
                    );
                } else {
                    // arr.push(
                    //     `G1 X${firstSegmentX}`,
                    //     `G1 Y${firstSegmentY}`,
                    //     `G1 X${secondSegmentX}`,
                    //     `G1 Y${secondSegmentY}`,
                    // );
                    arr.push(
                        `G1 X${startPos.x}`,
                        `G1 Y-${startPos.y}`,
                        `G1 X-${startPos.x}`,
                        `G1 Y${startPos.y}`,
                    );
                }

                arr.push('');

                return arr;
            }

            if (cutDirectionFlipped) {
                if (endPos.x >= startPos.x) {
                    arr.push(`G1 X${xValueStart}`);
                }

                if (endPos.y >= startPos.y) {
                    arr.push(`G1 Y${yValueStart}`);
                }

                if (endPos.x > startPos.x && endPos.y > startPos.y) {
                    arr.push(
                        `G1 X${xValueEnd}`,
                        `G1 Y${yValueEnd}`,
                    );
                }

                // arr.push(
                //     `G1 X${xValueStart}`,
                //     `G1 Y${yValueStart}`,
                //     `G1 X${xValueEnd}`,
                //     `G1 Y${yValueEnd}`,
                // );
            } else {
                if (endPos.y >= startPos.y) {
                    arr.push(`G1 Y${yValueStart}`);
                }

                if (endPos.x >= startPos.x) {
                    arr.push(`G1 X${xValueStart}`);
                }

                if (endPos.x > startPos.x && endPos.y > startPos.y) {
                    arr.push(
                        `G1 Y${yValueEnd}`,
                        `G1 X${xValueEnd}`,
                    );
                }

                // arr.push(
                //     `G1 Y${yValueStart}`,
                //     `G1 X${xValueStart}`,
                //     `G1 Y${yValueEnd}`,
                //     `G1 X${xValueEnd}`,
                // );
            }

            arr.push('');

            return arr;
        }

        const initialPerimeter = drawInitialPerimeter(x, y, z, direction, !startIsInCenter, startPosition);
        const spirals = drawSpiral([], startPos, endPos, options, processGcode, startIsInCenter ? centerExitCondition : exitCondition, getNewStartPos, getNewEndPos);
        const returnToStart = returnToZero();
        const spiralStartArea = enterSpiralStartArea(stepoverAmount * xFactor, stepoverAmount * yFactor, false, 'G0', direction.axis);

        // This is the area that is not accounted for due to the positioning of the gcode when starting from the center
        // (Easiest way to do this would be to generaete the spiral array and reverse it)
        // const remainder = [
        //     '(Covering Remaining Area)',
        //     `G1 X${this.toFixedValue((stepoverAmount) * xFactor)}`,
        //     `G1 Y${this.toFixedValue(0)}`,
        //     '(End of Covering Remaining Area)',
        //     ''
        // ];

        const toolpath = new Toolpath();
        toolpath.loadFromStringSync(spirals.join('\n'));
        // const position = toolpath.getPosition();

        const mainSpiralArea = [];

        mainSpiralArea.push(
            rampIntoMaterial(z, direction),
            startIsInCenter
                ? [
                    ...spirals,
                ]
                : spirals,
        );

        const remainderFactor = cutDirectionFlipped ? -1 : 1;

        const remainder = cutDirectionFlipped
            ? [
                '(Covering Remaining Area)',
                `G1 X${toFixedValue(((width / 2) - stepoverAmount) * remainderFactor)}`,
                `G1 Y${toFixedValue(length / 2)}`,
                `G1 X${toFixedValue(((width / 2) - (stepoverAmount * 2)) * remainderFactor)}`,
                `G1 X${toFixedValue(((width / 2)) * remainderFactor)}`,
                `G1 Y-${toFixedValue(length / 2)}`,
                `G1 X${toFixedValue(((width / 2) - stepoverAmount) * remainderFactor)}`,
                '(End of Covering Remaining Area)'
            ]
            : [
                '(Covering Remaining Area)',
                `G1 X${toFixedValue((width / 2) * remainderFactor)}`,
                `G1 Y${toFixedValue((length / 2) - stepoverAmount)}`,
                '(End of Covering Remaining Area)'
            ];

        // if (startFromCenter) {
        //     mainSpiralArea.push(
        //         enterSpiralStartArea(position.x, position.y, true, 'G0', 'Y'),
        //         rampIntoMaterial(z, direction),
        //         spirals.reverse(),
        //         remainder
        //     );
        // } else {
        //     mainSpiralArea.push(
        //         enterSpiralStartArea(stepoverAmount * xFactor, stepoverAmount * yFactor, false, 'G1', 'Y'),
        //         rampIntoMaterial(z, direction),
        //         spirals
        //     );
        // }

        // const x = startPosition === START_POSITION_CENTER ? toFixedValue((width / 2) * -1) : toFixedValue(width * xFactor);
        // const y = startPosition === START_POSITION_CENTER ? toFixedValue((length / 2) * -1) : toFixedValue(length * yFactor);

        /**
         * 1. Draw initial surfacing area perimeter
         * 2. Move to the start area
         * 3. Begin drawing spiral recursively
         * 4. End of spiral, move z axis up and return to the zero position
         **/
        const gcodeArr = startIsInCenter
            ? [
                `(*** Layer ${count} ***)`,
                ...mainSpiralArea.flat(),
                ...remainder,
                // `G1 X-${width}`,
                // `G1 Y${length}`,
                // `G1 X${width}`,
                // `G1 Y-${length}`,
                ...returnToStart,
                `(*** End of Layer ${count} ***)`
            ]
            : [
                `(*** Layer ${count} ***)`,
                ...initialPerimeter,
                ...spiralStartArea,
                ...mainSpiralArea.flat(),
                ...returnToStart,
                `(*** End of Layer ${count} ***)`
            ];

        return gcodeArr;
    }

    drawSpiral = (arr, startPos, endPos, options, processGcode, exitCondition, getNewStartPos, getNewEndPos) => {
        const { drawSpiral } = this;
        const { axisFactors, } = options;
        const { x: xFactor, y: yFactor } = axisFactors;

        arr.push(...processGcode(startPos, endPos, xFactor, yFactor));

        if (exitCondition(startPos, endPos)) {
            return arr;
        }

        const nextStartPos = getNewStartPos(startPos);
        const nextEndPos = getNewEndPos(endPos);

        return drawSpiral(arr, nextStartPos, nextEndPos, options, processGcode, exitCondition, getNewStartPos, getNewEndPos);
    }

    generateZigZag = (options) => {
        const { depth, length, width, axisFactors, count, stepoverAmount, cutDirectionFlipped, startPosition } = options;
        const { x: xFactor, y: yFactor } = axisFactors;
        const { toFixedValue, drawInitialPerimeter, drawZigZag, returnToZero, rampIntoMaterial } = this;
        const startIsInCenter = startPosition === START_POSITION_CENTER;

        const x = toFixedValue(width * xFactor);
        const y = toFixedValue(length * yFactor);
        const z = toFixedValue(depth * -1);

        // const startPos = {
        //     x: cutDirectionFlipped ? 0 : toFixedValue(stepoverAmount),
        //     y: cutDirectionFlipped ? toFixedValue(stepoverAmount * 2) : toFixedValue(stepoverAmount),
        // };

        // const endPos = {
        //     x: toFixedValue(width - stepoverAmount),
        //     y: toFixedValue(length - stepoverAmount),
        // };

        const startPos = {
            x: cutDirectionFlipped ? toFixedValue(stepoverAmount) : width,
            y: cutDirectionFlipped ? length : toFixedValue(stepoverAmount),
        };

        const endPos = {
            x: cutDirectionFlipped ? toFixedValue(stepoverAmount * 2) : 0,
            y: cutDirectionFlipped ? 0 : this.toFixedValue(stepoverAmount * 2),
        };


        const direction = {
            axis: 'Y',
            factor: axisFactors.y,
        };

        if (width >= length) {
            direction.axis = 'X';
            direction.factor = axisFactors.x;
        }

        function exitCondition(startPos, endPos) {
            return cutDirectionFlipped ? startPos.x >= width : startPos.y >= length;
        }

        // const nextStartPos = {
        //     x: cutDirectionFlipped ? toFixedValue(endPos.x + stepoverAmount) : startPos.x,
        //     y: cutDirectionFlipped ? startPos.y : toFixedValue(startPos.y + stepoverAmount)
        // };
        // const nextEndPos = {
        //     x: cutDirectionFlipped ? toFixedValue(endPos.x + (stepoverAmount * 2)) : endPos.x,
        //     y: cutDirectionFlipped ? 0 : toFixedValue(endPos.y + stepoverAmount)
        // };

        function getNewStartPos(startPos, endPos) {
            return {
                x: cutDirectionFlipped ? toFixedValue(endPos.x + stepoverAmount) : startPos.x,
                y: cutDirectionFlipped ? startPos.y : toFixedValue(startPos.y + stepoverAmount)
            };
        }

        function getNewEndPos(endPos) {
            return {
                x: cutDirectionFlipped ? toFixedValue(endPos.x + (stepoverAmount * 2)) : endPos.x,
                y: cutDirectionFlipped ? 0 : toFixedValue(endPos.y + stepoverAmount)
            };
        }

        function processGcode(startPos, endPos, xFactor, yFactor) {
            const arr = [];

            if (startIsInCenter) {
                if (cutDirectionFlipped) {
                    arr.push(
                        `G1 Y-${toFixedValue(length / 2)}`,
                        `G1 X${toFixedValue((width / 2) - startPos.x)}`,
                        `G1 Y${toFixedValue(length / 2)}`,
                        `G1 X${toFixedValue((width / 2) - endPos.x)}`,
                        ''
                    );
                } else {
                    arr.push(
                        `G1 Y${toFixedValue((length / 2) - startPos.y)}`,
                        `G1 X${toFixedValue(width / 2)}`,
                        `G1 Y${toFixedValue((length / 2) - endPos.y)}`,
                        `G1 X-${toFixedValue(width / 2)}`,
                        ''
                    );
                }

                return arr;
            }

            if (cutDirectionFlipped) {
                arr.push(
                    `G1 Y${toFixedValue(startPos.y * yFactor)}`,
                    `G1 X${startPos.x * xFactor}`,
                    `G1 Y${toFixedValue(endPos.y * yFactor)}`,
                );

                if (endPos.x <= width) {
                    arr.push(`G1 X${toFixedValue(endPos.x * xFactor)}`);
                }
            } else {
                arr.push(
                    `G1 X${startPos.x * xFactor}`,
                    `G1 Y${toFixedValue(startPos.y * yFactor)}`,
                    `G1 X${toFixedValue(endPos.x * xFactor)}`,
                    `G1 Y${toFixedValue(endPos.y * yFactor)}`,
                );
            }

            arr.push('');

            return arr;
        }

        const initialPerimeter = drawInitialPerimeter(x, y, z, direction, false,);
        const spirals = drawZigZag([], startPos, endPos, options, processGcode, exitCondition, getNewStartPos, getNewEndPos);
        const returnToStart = returnToZero();

        const startArea = [
            '(Entering Start Area)',
            `G0 X-${toFixedValue(width / 2)}`,
            `G0 Y${toFixedValue(cutDirectionFlipped ? (length / 2) : (length / 2 - stepoverAmount))}`,
            '(End of Entering Start Area)',
        ];

        // { axis: 'Y', factor: cutDirectionFlipped ? -1 : 1 }

        /**
         * 1. Draw initial surfacing area perimeter and do not zero z axis
         * 2. Begin drawing zig zag recursively
         * 4. End of zig zag, move z axis up and return to the zero position
         **/
        const gcodeArr = startIsInCenter
            ? [
                `(*** Layer ${count} ***)`,
                ...startArea,
                ...rampIntoMaterial(z, direction),
                ...spirals,
                ...[
                    `G1 Y${toFixedValue(length / 2)}`,
                    `G1 X${toFixedValue(width / 2)}`,
                    `G1 Y-${toFixedValue(length / 2)}`,
                    `G1 X-${toFixedValue(width / 2)}`
                ],
                ...returnToStart,
                `(*** End of Layer ${count} ***)`
            ]
            : [
                `(*** Layer ${count} ***)`,
                ...initialPerimeter,
                ...spirals,
                ...returnToStart,
                `(*** End of Layer ${count} ***)`
            ];

        return gcodeArr;
    }

    drawZigZag = (arr, startPos, endPos, options, processGcode, exitCondition, getNewStartPos, getNewEndPos) => {
        // const { axisFactors, stepoverAmount, length } = options;
        const { axisFactors } = options;
        const { x: xFactor, y: yFactor } = axisFactors;
        const { drawZigZag } = this;

        if (exitCondition(startPos, endPos)) {
            return arr;
        }

        arr.push(...processGcode(startPos, endPos, xFactor, yFactor));

        // if (startPos.y >= length) {
        //     return arr;
        // }

        // arr.push(
        //     `G1 X${startPos.x * xFactor}`,
        //     `G1 Y${this.toFixedValue(startPos.y * yFactor)}`,
        //     `G1 X${this.toFixedValue(endPos.x * yFactor)}`,
        //     `G1 Y${this.toFixedValue(endPos.y * yFactor)}`,
        // );

        const nextStartPos = getNewStartPos(startPos, endPos);
        const nextEndPos = getNewEndPos(endPos);

        return drawZigZag(arr, nextStartPos, nextEndPos, options, processGcode, exitCondition, getNewStartPos, getNewEndPos);
    }
}
