import { GamepadListener } from 'gamepad.js';

import store from 'app/store';
import { Toaster, TOASTER_INFO } from 'app/lib/toaster/ToasterLib';
import { throttle } from 'lodash';

class Gamepad extends GamepadListener {
    constructor() {
        super({ precision: 2 });
        this.shouldHold = false;
        this.start();
    }

    update = ({ deadZone, precision }) => {
        if (deadZone) {
            this.options.deadZone = deadZone;
        }

        if (precision) {
            this.options.precision = precision;
        }
    }

    holdListener = () => {
        this.shouldHold = true;
    }

    unholdLisetner = () => {
        this.shouldHold = false;
    }

    onAxis = (event) => {
        if (this.shouldHold) {
            return;
        }

        const [leftStickX, leftStickY, rightStickX, rightStickY] = event.detail.gamepad.axes;

        const cartesian2Polar = (x, y) => {
            const radians = Math.atan2(y, x);
            const degrees = Math.round((radians * (180 / Math.PI))) * -1;
            return (degrees + 360) % 360; //https://stackoverflow.com/a/25725005
        };

        const leftStick = cartesian2Polar(leftStickX, leftStickY);
        const rightStick = cartesian2Polar(rightStickX, rightStickY);

        const dataOutput = {
            ...event.detail,
            degrees: {
                leftStick,
                rightStick,
            }
        };

        const { index } = dataOutput;

        this.emit('gamepad:axis', dataOutput);
        this.emit(`gamepad:${index}:axis`, dataOutput);
        this.emit(`gamepad:${index}:axis:${dataOutput.axis}`, dataOutput.detail);
    }
}

//  TODO:  Remove this when SSL is working correctly
const getGamepadInstance = () => {
    if (navigator.userAgent.includes('Firefox')) {
        console.log('Mock gamepad');
        return {
            start: () => {},
            on: () => {},
        };
    } else {
        return new Gamepad();
    }
};

const gamepadInstance = getGamepadInstance();

gamepadInstance.start();

export const shortcutComboBuilder = (list = []) => {
    const JOIN_KEY = '+';

    return list.join(JOIN_KEY);
};

const arrayComparator = (parentArr, childArr) => childArr.every(element => parentArr.includes(element));

export const checkButtonHold = (buttonType, currentProfile) => {
    const gamepads = navigator.getGamepads();

    const currentGamepad = gamepads.find(gamepad => currentProfile.id.includes(gamepad.id));

    const isHoldingButton = currentGamepad.buttons[currentProfile[buttonType]?.button]?.pressed;

    return isHoldingButton;
};

const handleGamepadProfileLockout = throttle((currentProfile, isLocked) => {
    setTimeout(() => {
        const isHoldingLockoutButton = checkButtonHold('lockout', currentProfile);

        if (!isHoldingLockoutButton) {
            return;
        }

        const profiles = store.get('workspace.gamepad.profiles', []);

        const updatedProfiles = profiles.map(profile => {
            if (arrayComparator(profile.id, currentProfile.id)) {
                return { ...profile, lockout: { button: profile.lockout?.button, active: !isLocked } };
            }

            return profile;
        });

        store.replace('workspace.gamepad.profiles', updatedProfiles);

        Toaster.pop({
            msg: !isLocked ? 'Gamepad Buttons Locked' : 'Gamepad Buttons Unlocked',
            type: TOASTER_INFO,
            duration: 3000,
        });
    }, 4000);
}, 250, { trailing: false });

export const onGamepadButtonPress = ({ detail }) => {
    if (gamepadInstance.shouldHold) {
        return null;
    }

    const { gamepad, button } = detail;
    const gamepadID = gamepad.id;

    const profiles = store.get('workspace.gamepad.profiles', []);
    const currentProfile = profiles.find(profile => profile.id.includes(gamepadID));

    if (!currentProfile) {
        return null;
    }

    // the result is an array, [0] = key and [1] = shortcuts
    const foundAction = currentProfile.buttons.find(({ value }) => value === button);

    const modifierButton = gamepad.buttons[currentProfile.modifier?.button];
    const lockoutButton = gamepad.buttons[currentProfile.lockout?.button];

    if (lockoutButton?.pressed) {
        handleGamepadProfileLockout(currentProfile, currentProfile.lockout?.active);
    }

    if (currentProfile.lockout?.active) {
        return null;
    }

    if (modifierButton?.pressed) {
        return foundAction?.secondaryAction;
    }

    return foundAction?.primaryAction;
};

export const runAction = ({ event, shuttleControlEvents }) => {
    const action = onGamepadButtonPress(event);

    if (!action) {
        return;
    }

    const shuttleEvent = shuttleControlEvents[action];

    if (shuttleEvent?.callback) {
        shuttleEvent.callback(null, shuttleEvent.payload);
    }
};

gamepadInstance.on('gamepad:connected', ({ detail }) => {
    const { gamepad } = detail;

    const profiles = store.get('workspace.gamepad.profiles');

    const foundGamepad = profiles.find(profile => profile.id.includes(gamepad.id));

    Toaster.pop({
        msg: foundGamepad ? `${foundGamepad.profileName} Connected` : 'New gamepad connected, add it as a profile in your preferences',
        type: TOASTER_INFO,
    });
});

gamepadInstance.on('gamepad:disconnected', () => {
    Toaster.pop({
        msg: 'Gamepad Disconnected',
        type: TOASTER_INFO,
        duration: 2000,
    });
});

export default gamepadInstance;
