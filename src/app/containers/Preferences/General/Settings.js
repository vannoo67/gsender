import React from 'react';

import store from 'app/store';
import defaultState from 'app/store/defaultState';
import Button from 'app/components/FunctionButton/FunctionButton';
import { Confirm } from 'app/components/ConfirmationDialog/ConfirmationDialogLib';
import { Toaster, TOASTER_DANGER } from 'app/lib/toaster/ToasterLib';
import api from 'app/api';

import Fieldset from '../components/Fieldset';

const Settings = () => {
    const inputRef = React.createRef();

    const handleRestoreDefaultClick = () => {
        Confirm({
            title: 'Restore Settings',
            content: 'All your current settings will be removed. Are you sure you want to restore default settings on gSender?',
            confirmLabel: 'Restore Settings',
            onConfirm: restoreDefault
        });
    };

    const restoreDefault = async () => {
        await api.events.clearAll();

        restoreSettings(defaultState);
    };

    const restoreSettings = (state) => {
        store.restoreState(state);

        setTimeout(() => {
            window.location.reload();
        }, 250);
    };

    const importSettings = (e) => {
        const file = e.target.files[0];

        Confirm({
            title: 'Import Settings',
            content: 'All your current settings will be replaced. Are you sure you want to import your settings on gSender?',
            confirmLabel: 'Import Settings',
            onConfirm: () => onImportConfirm(file)
        });
    };

    const onImportConfirm = (file) => {
        if (file) {
            const reader = new FileReader();
            reader.readAsText(file, 'UTF-8');
            reader.onload = async (event) => {
                const { settings, events = [], state } = JSON.parse(event.target.result);

                await new Promise((resolve, reject) => {
                    // delete all old events
                    const res = api.events.clearAll();
                    resolve(res);
                }).then((result) => {
                    Promise.all([
                        Object.entries(events).map(([key, event]) => api.events.create(event))
                    ]);
                });

                if (settings) {
                    restoreSettings(settings);
                } else {
                    restoreSettings(state);
                }
            };
            reader.onerror = () => {
                Toaster.pop({
                    msg: 'There was a problem importing your settings',
                    type: TOASTER_DANGER
                });
            };
        }
    };

    const exportSettings = async () => {
        const settings = store.get();
        settings.commandKeys = Object.fromEntries(Object.entries(settings.commandKeys).filter(([key, shortcut]) => shortcut.category !== 'Macros')); //Exclude macro shortcuts
        delete settings.session;

        const res = await api.events.fetch();
        const events = res.body.records;

        const settingsJSON = JSON.stringify({ settings, events }, null, 3);
        const data = new Blob([settingsJSON], {
            type: 'application/json'
        });

        const today = new Date();
        const filename = `gSender-settings-${today.toLocaleDateString()}-${today.toLocaleTimeString()}`;

        // IE11 & Edge
        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(data, filename);
        } else {
            // In FF link must be added to DOM to be clicked
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(data);
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <Fieldset legend="Settings">
            <Button primary style={{ margin: 0 }} onClick={handleRestoreDefaultClick}>Restore Default gSender Settings</Button>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <Button
                    primary
                    type="button"
                    title="Import Macros"
                    style={{ marginBottom: '1rem' }}
                    onClick={() => {
                        inputRef.current.click();
                    }}
                >
                    <i className="fas fa-download" /> Import Settings
                </Button>
                <Button
                    primary
                    type="button"
                    title="Export Macros"
                    style={{ marginBottom: '1rem' }}
                    onClick={exportSettings}
                >
                    <i className="fas fa-upload" /> Export Settings
                </Button>
            </div>

            <input
                type="file"
                onChange={importSettings}
                onClick={(e) => {
                    (e.target.value = null);
                }}
                accept=".json"
                style={{ display: 'none' }}
                ref={inputRef}
            />
        </Fieldset>
    );
};

export default Settings;
