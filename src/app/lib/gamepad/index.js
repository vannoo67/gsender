import { GamepadListener } from 'gamepad.js';
import store from 'app/store';
import { Toaster, TOASTER_INFO } from 'app/lib/toaster/ToasterLib';

const JOG_CMD = 'JOG';
const STOP_JOG_CMD = 'STOP_JOG';

class Gamepad extends GamepadListener {
    constructor() {
        // const { deadZone = 0.4 } = store.get('workspace.gamepad');
        super({ deadZone: 0.5, precision: 2, analog: false });
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
}
const gamepadInstance = new Gamepad();
gamepadInstance.start();

export const shortcutComboBuilder = (list = []) => {
    const JOIN_KEY = '+';

    return list.join(JOIN_KEY);
};

export const onGamepadButtonClick = ({ detail }) => {
    if (gamepadInstance.shouldHold) {
        return null;
    }

    const { gamepad, pressed, button } = detail;
    const buttons = gamepad.buttons;
    const gamepadID = gamepad.id;

    const profiles = store.get('workspace.gamepad.profiles', []);
    const currentProfile = profiles.find(profile => profile.id === gamepadID);

    const buttonCombo = shortcutComboBuilder(
        buttons
            .map((button, i) => ({ pressed: button.pressed, touched: button.touched, buttonIndex: i }))
            .filter(button => button.pressed || button.touched)
            .map(button => button.buttonIndex)
    );

    const foundAction = currentProfile.shortcuts.find(shortcut => {
        return shortcut.keys === buttonCombo;
    });

    if (!buttonCombo) {
        const foundAction = currentProfile.shortcuts.find(shortcut => {
            return shortcut.keys === String(button);
        });

        //If we found a jog action and the current button was not pressed (lifted up), send a stop jog command instead
        if (foundAction?.cmd === JOG_CMD && !pressed) {
            const foundStopCommand = currentProfile.shortcuts.find(shortcut => shortcut.cmd === STOP_JOG_CMD);
            delete foundStopCommand?.payload; //We don't need to send a payload
            return foundStopCommand;
        }

        return null;
    }

    if (!currentProfile) {
        return null;
    }

    if (!foundAction) {
        return null;
    }

    if (!foundAction.isActive) {
        return null;
    }

    return foundAction;
};

export const runAction = ({ event, shuttleControlEvents }) => { //Added throttle to prevent uncessary spam when controller is connecting
    const action = onGamepadButtonClick(event);

    if (!action) {
        return;
    }

    const runEvent = shuttleControlEvents[action.cmd];

    if (runEvent) {
        runEvent(null, action.payload);
    }
};

gamepadInstance.on('gamepad:connected', ({ detail }) => {
    const { gamepad } = detail;

    const profiles = store.get('workspace.gamepad.profiles');

    const foundGamepad = profiles.find(profile => profile.id === gamepad.id);

    Toaster.pop({
        msg: foundGamepad ? `${foundGamepad.profileName} Connected` : 'New joystick connected, add it as a profile in your preferences',
        type: TOASTER_INFO,
    });
});

gamepadInstance.on('gamepad:disconnected', () => {
    Toaster.pop({
        msg: 'Joystick Disconnected',
        type: TOASTER_INFO,
        duration: 2000,
    });
});

export default gamepadInstance;
