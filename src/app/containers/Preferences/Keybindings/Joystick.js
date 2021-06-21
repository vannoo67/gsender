import React, { useState } from 'react';

import Button from 'app/components/FunctionButton/FunctionButton';

import styles from './index.styl';

import { Profile } from './Profile';
import ProfileList from './ProfileList';
import AddActionModal from './AddActionModal';
import AddProfileModal from './AddProfileModal';

const Joystick = () => {
    const [profiles, setProfiles] = useState([
        { id: 1, title: 'Logitech Gamepad', icon: 'fas fa-gamepad' },
        { id: 2, title: 'Dualshock Playstation 5 Controller', icon: 'fas fa-gamepad' },
        { id: 3, title: 'Xbox 360 Controller', icon: 'fas fa-gamepad' },
        { id: 4, title: '1980\'s Arcade Joystick', icon: 'fas fa-gamepad' },
        { id: 5, title: 'Xbox One X Controller', icon: 'fas fa-gamepad' },
    ]);
    const [currentProfile, setCurrentProfile] = useState(null);
    const [showAddAction, setShowAddAction] = useState(false);
    const [showAddProfile, setShowAddProfile] = useState(false);

    const handleClick = (id) => {
        const profile = profiles.find((profile) => profile.id === id);

        if (profile) {
            setCurrentProfile(profile);
        }
    };

    const handleDelete = (id) => {
        const filteredProfiles = profiles.filter(profile => profile.id !== id);

        setProfiles(filteredProfiles);
        setCurrentProfile(null);
    };

    return (
        <div className={styles.container}>
            {
                currentProfile
                    ? (
                        <>
                            <Profile title={currentProfile.title} icon={currentProfile.icon} id={currentProfile.id} />

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <Button primary onClick={() => setShowAddAction(true)}>
                                    <i className="fas fa-plus" />
                                    <span>Add Action to Profile</span>
                                </Button>
                                <Button primary onClick={() => setCurrentProfile(null)}>
                                    <i className="fas fa-arrow-left" />
                                    <span>Back to Profiles List</span>
                                </Button>
                            </div>
                        </>
                    )
                    : <ProfileList profiles={profiles} onClick={handleClick} onDelete={handleDelete} onAdd={() => setShowAddProfile(true)} />
            }

            {
                showAddAction && <AddActionModal onClose={() => setShowAddAction(false)} />
            }
            {
                showAddProfile && <AddProfileModal onClose={() => setShowAddProfile(false)} />
            }
        </div>
    );
};

export default Joystick;
