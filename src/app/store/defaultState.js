import {
    IMPERIAL_STEPS,
    METRIC_STEPS,
    METRIC_UNITS,
    SPINDLE_MODE
} from '../constants';

const AXIS_X = 'x';
const AXIS_Y = 'y';
const AXIS_Z = 'z';
const FORWARD = 1;
const BACKWARD = -1;

const defaultState = {
    session: {
        name: '',
        token: ''
    },
    workspace: {
        units: METRIC_UNITS,
        reverseWidgets: false,
        safeRetractHeight: 0,
        container: {
            primary: {
                show: true,
                widgets: [
                    'location', 'axes', 'secondary'
                ]
            }
        },
        machineProfile: {
            id: 5,
            company: 'Sienci Labs',
            name: 'LongMill',
            type: '30x30',
            width: 792,
            units: 'mm',
            depth: 845,
            height: 114.3,
            endstops: false,
            spindle: false,
            coolant: false,
            laser: false,
            limits: {
                xmin: 0,
                ymin: 0,
                zmin: 0,
                xmax: 792,
                ymax: 114.3,
                zmax: 845,
            }
        },
        probeProfile: {
            xyThickness: {
                mm: 10,
                in: 0.393
            },
            zThickness: {
                mm: 15,
                in: 0.590
            },
            plateWidth: {
                mm: 50,
                in: 1.968
            },
            plateLength: {
                mm: 50,
                in: 1.968
            },
            functions: {
                x: true,
                y: true,
                z: true
            }
        },
        tools: [
            {
                metricDiameter: 6.35,
                imperialDiameter: 0.25,
                type: 'end mill'
            },
            {
                metricDiameter: 3.175,
                imperialDiameter: 0.125,
                type: 'end mill'
            },
            {
                metricDiameter: 9.525,
                imperialDiameter: 0.375,
                type: 'end mill'
            },
            {
                metricDiameter: 12.7,
                imperialDiameter: 0.5,
                type: 'end mill'
            },
            {
                metricDiameter: 15.875,
                imperialDiameter: 0.625,
                type: 'end mill'
            }
        ],
    },
    widgets: {
        axes: {
            minimized: false,
            axes: ['x', 'y', 'z'],
            jog: {
                xyStep: 5,
                zStep: 2,
                feedrate: 3000,
                keypad: false,
                rapid: {
                    mm: {
                        xyStep: 20,
                        zStep: 10,
                        feedrate: 5000,
                    },
                    in: {
                        xyStep: 1,
                        zStep: 0.5,
                        feedrate: 5000,
                    }
                },
                normal: {
                    mm: {
                        xyStep: 5,
                        zStep: 2,
                        feedrate: 3000,
                    },
                    in: {
                        xyStep: 0.2,
                        zStep: 0.04,
                        feedrate: 3000,
                    },
                },
                precise: {
                    mm: {
                        xyStep: 0.5,
                        zStep: 0.1,
                        feedrate: 1000,
                    },
                    in: {
                        xyStep: 0.02,
                        zStep: 0.004,
                        feedrate: 1000,
                    },
                },
                imperial: {
                    step: IMPERIAL_STEPS.indexOf(1), // Defaults to 1 inch
                    distances: []
                },
                metric: {
                    step: METRIC_STEPS.indexOf(1), // Defaults to 1 mm
                    distances: []
                }
            },
            mdi: {
                disabled: false
            },
            shuttle: {
                feedrateMin: 500,
                feedrateMax: 2000,
                hertz: 10,
                overshoot: 1
            },
        },
        connection: {
            minimized: false,
            controller: {
                type: 'Grbl' // Grbl|Marlin|Smoothie|TinyG
            },
            port: '', // will be deprecated in v2
            baudrate: 115200, // will be deprecated in v2
            connection: {
                type: 'serial',
                serial: {
                    // Hardware flow control (RTS/CTS)
                    rtscts: false
                }
            },
            autoReconnect: false
        },
        console: {
            minimized: false
        },
        gcode: {
            minimized: false
        },
        job_status: {
            minimized: false,
            feedrateMin: 500,
            feedrateMax: 2000,
            spindleSpeedMin: 0,
            spindleSpeedMax: 1000
        },
        grbl: {
            minimized: false,
            panel: {
                queueReports: {
                    expanded: true
                },
                statusReports: {
                    expanded: true
                },
                modalGroups: {
                    expanded: true
                }
            }
        },
        location: {
            minimized: false,
            axes: ['x', 'y', 'z'],
            jog: {
                keypad: true,
                imperial: {
                    step: IMPERIAL_STEPS.indexOf(1), // Defaults to 1 inch
                    distances: []
                },
                metric: {
                    step: METRIC_STEPS.indexOf(1), // Defaults to 1 mm
                    distances: []
                },
                speeds: {
                    xyStep: 5,
                    zStep: 0.5,
                    feedrate: 5000,
                }
            },
            mdi: {
                disabled: false
            },
            shuttle: {
                feedrateMin: 500,
                feedrateMax: 2000,
                hertz: 10,
                overshoot: 1
            }
        },
        macro: {
            minimized: false
        },
        probe: {
            minimized: false,
            probeCommand: 'G38.2',
            useTLO: false,
            probeDepth: 10,
            probeFeedrate: 75,
            probeFastFeedrate: 150,
            touchPlateHeight: 10,
            retractionDistance: 4
        },
        spindle: {
            minimized: false,
            speed: 1000,
            mode: SPINDLE_MODE,
            spindleMax: 2000,
            spindleMin: 0,
            laserTest: {
                power: 0,
                duration: 0,
            }
        },
        visualizer: {
            minimized: false,
            // 3D View
            liteMode: false,
            disabled: false,
            disabledLite: false,
            projection: 'orthographic', // 'perspective' or 'orthographic'
            cameraMode: 'pan', // 'pan' or 'rotate',
            theme: 'dark',
            gcode: {
                displayName: true
            },
            objects: {
                limits: {
                    visible: true,
                },
                coordinateSystem: {
                    visible: true,
                },
                gridLineNumbers: {
                    visible: true,
                },
                cuttingTool: {
                    visible: true,
                    visibleLite: false
                },
                cuttingToolAnimation: {
                    visible: true,
                    visibleLite: false
                },
                cutPath: {
                    visible: true,
                    visibleLite: true
                }
            },
            showWarning: false,
            showLineWarnings: false,
        }
    },
    /**
     * Command Keys Available (default):
     *  Start Job                   ~
     *  Pause Job                   !
     *  Stop Job                    @
     *  Zero All                    $
     *  Go to Zero                  %
     *  Feed Hold                   ^
     *  Cycle Start                 &
     *  Homing                      ctrl + alt + command + h
     *  Unlock                      ctrl + alt + command + u
     *  Reset                       ctrl + alt + command + r
     *  Change Jog Speeds           shift + (+ or -)
     *  Jog X                       shift + (left or right) * arrows *
     *  Jog Y                       shift + (up or down)    * arrows *
     *  Jog Z                       shift + (pageup or pagedown)
     */
    commandKeys: [
        { // Start Job
            id: 0,
            title: 'Start Job',
            keys: '~',
            cmd: 'START_JOB',
            preventDefault: true
        },
        { // Pause Job
            id: 1,
            title: 'Pause Job',
            keys: '!',
            cmd: 'PAUSE_JOB',
            preventDefault: true
        },
        { // Stop Job
            id: 2,
            title: 'Stop Job',
            keys: '@',
            cmd: 'STOP_JOB',
            preventDefault: true
        },
        { // Zero All
            id: 3,
            title: 'Zero All',
            keys: '$',
            cmd: 'ZERO_ALL',
            preventDefault: true
        },
        { // Go to Zero
            id: 4,
            title: 'Go to Zero',
            keys: '%',
            cmd: 'GO_TO_ZERO',
            preventDefault: true
        },
        { // Feed Hold
            id: 5,
            title: 'Feed Hold',
            keys: '^',
            cmd: 'CONTROLLER_COMMAND',
            payload: {
                command: 'feedhold'
            },
            preventDefault: true
        },
        { // Cycle Start
            id: 6,
            title: 'Cycle Start',
            keys: '&',
            cmd: 'CONTROLLER_COMMAND',
            payload: {
                command: 'cyclestart'
            },
            preventDefault: true
        },
        { // Homing
            id: 7,
            title: 'Homing',
            keys: ['ctrl', 'alt', 'command', 'h'].join('+'),
            cmd: 'CONTROLLER_COMMAND',
            payload: {
                command: 'homing'
            },
            preventDefault: true
        },
        { // Unlock
            id: 8,
            title: 'Unlock',
            keys: ['ctrl', 'alt', 'command', 'u'].join('+'),
            cmd: 'CONTROLLER_COMMAND',
            payload: {
                command: 'unlock'
            },
            preventDefault: true
        },
        { // Reset
            id: 9,
            title: 'Reset',
            keys: ['ctrl', 'alt', 'command', 'r'].join('+'),
            cmd: 'CONTROLLER_COMMAND',
            payload: {
                command: 'reset'
            },
            preventDefault: true
        },
        { // Change Jog Speed
            id: 10,
            title: 'Increase Jog Speed',
            keys: '=',
            cmd: 'JOG_SPEED',
            payload: {
                speed: 'increase'
            },
            preventDefault: false
        },
        { // Change Jog Speed
            id: 11,
            title: 'Decrease Jog Speed',
            keys: '-',
            cmd: 'JOG_SPEED',
            payload: {
                speed: 'decrease'
            },
            preventDefault: false
        },
        { // Jog X+
            id: 12,
            title: 'Jog: X+',
            keys: 'shift+right',
            cmd: 'JOG',
            payload: {
                axis: AXIS_X,
                direction: FORWARD,
            },
            preventDefault: false
        },
        { // Jog X-
            id: 13,
            title: 'Jog: X-',
            keys: 'shift+left',
            cmd: 'JOG',
            payload: {
                axis: AXIS_X,
                direction: BACKWARD,
            },
            preventDefault: false
        },
        { // Jog Y+
            id: 14,
            title: 'Jog: Y+',
            keys: 'shift+up',
            cmd: 'JOG',
            payload: {
                axis: AXIS_Y,
                direction: FORWARD,
            },
            preventDefault: false
        },
        { // Jog Y-
            id: 15,
            title: 'Jog: Y-',
            keys: 'shift+down',
            cmd: 'JOG',
            payload: {
                axis: AXIS_Y,
                direction: BACKWARD,
            },
            preventDefault: false
        },
        { // Jog Z+
            id: 16,
            title: 'Jog: Z+',
            keys: 'shift+pageup',
            cmd: 'JOG',
            payload: {
                axis: AXIS_Z,
                direction: FORWARD,
            },
            preventDefault: false
        },
        { // Jog Z-
            id: 17,
            title: 'Jog: Z-',
            keys: 'shift+pagedown',
            cmd: 'JOG',
            payload: {
                axis: AXIS_Z,
                direction: BACKWARD,
            },
            preventDefault: false
        },
    ]
};

export default defaultState;
