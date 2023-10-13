import React, { useContext } from 'react';

import Button from 'app/components/FunctionButton/FunctionButton';

import ProfileItem from './ProfileItem';
import { GamepadContext } from './utils/context';

import styles from '../index.styl';
import { GAMEPAD_MODAL } from './utils/constants';
import { setCurrentModal } from './utils/actions';

const ProfileList = () => {
    const { state: { settings: { profiles } }, dispatch } = useContext(GamepadContext);

    const addNewGamepadProfileButton = (
        <Button primary onClick={() => dispatch(setCurrentModal(GAMEPAD_MODAL.ADD_NEW_PROFILE))}>
            <i className="fas fa-plus" />
            <span>Add New Gamepad Profile</span>
        </Button>
    );

    if (profiles.length === 0) {
        return (
            <div className={styles.profileListEmpty}>
                <p style={{ fontSize: '1.5rem' }}>No Profiles, Click the Button Below to Add One</p>

                { addNewGamepadProfileButton }
            </div>
        );
    }

    return (
        <>
            <div className={styles.profileList}>
                {
                    profiles.map(({ id, profileName, icon = 'fas fa-gamepad' }) => (
                        <ProfileItem
                            id={id}
                            key={id}
                            title={profileName}
                            icon={icon}
                        />
                    ))
                }
            </div>

            { addNewGamepadProfileButton }
        </>
    );
};

export default ProfileList;
