/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import get from 'lodash/get';
import includes from 'lodash/includes';
import PropTypes from 'prop-types';
import pick from 'lodash/pick';
import log from 'app/lib/log';
import React, { PureComponent } from 'react';
import i18n from 'app/lib/i18n';
import { Tooltip } from 'app/components/Tooltip';
import Modal from 'app/components/Modal';
import CameraDisplay from './CameraDisplay/CameraDisplay';
import FunctionButton from '../../components/FunctionButton/FunctionButton';
import { Toaster, TOASTER_INFO } from '../../lib/toaster/ToasterLib';
import {
    // Grbl
    GRBL,
    GRBL_ACTIVE_STATE_ALARM,
    // Marlin
    MARLIN,
    // Smoothie
    SMOOTHIE,
    SMOOTHIE_ACTIVE_STATE_ALARM,
    // TinyG
    TINYG,
    TINYG_MACHINE_STATE_ALARM,
    // Workflow
    WORKFLOW_STATE_IDLE,
    WORKFLOW_STATE_PAUSED,
    WORKFLOW_STATE_RUNNING
} from '../../constants';
import styles from './workflow-control.styl';


class WorkflowControl extends PureComponent {
    static propTypes = {
        state: PropTypes.object,
        actions: PropTypes.object
    };

    fileInputEl = null;

    state = this.getInitialState();

    getInitialState() {
        return {
            closeFile: false,
            showRecent: false,
            showLoadFile: false,
            filetoLoad: '',
            recentFiles: [JSON.parse(localStorage.getItem('Recent Gcode Files:'))]
        };
    }

    handleClickUpload = (event) => {
        this.fileInputEl.value = null;
        this.fileInputEl.click();
    };

    handleCloseFile = () => {
        this.setState({ closeFile: true });
    }

    handleChangeFile = (event, fileToLoad) => {
        const { actions } = this.props;
        const files = event.target.files;
        const file = files[0];
        const reader = new FileReader();
        // let recentFiles = actions.savegCodeFilenameAsRecentFile(file.name, file);
        // this.setState({ recentFiles: recentFiles });
        reader.onloadend = (event) => {
            const { result, error } = event.target;

            if (error) {
                log.error(error);
                return;
            }

            log.debug('FileReader:', pick(file, [
                'lastModified',
                'lastModifiedDate',
                'meta',
                'name',
                'size',
                'type'
            ]));

            const meta = {
                name: file.name,
                size: file.size
            };
            actions.uploadFile(result, meta);
        };

        try {
            reader.readAsText(file);
        } catch (err) {
            // Ignore error
        }
    };

    handleLoadRecent = (event) => {
        console.log(event);
    };

    canRun() {
        const { state } = this.props;
        const { port, gcode, workflow } = state;
        const controllerType = state.controller.type;
        const controllerState = state.controller.state;

        if (!port) {
            return false;
        }
        if (!gcode.ready) {
            return false;
        }
        if (!includes([WORKFLOW_STATE_IDLE, WORKFLOW_STATE_PAUSED], workflow.state)) {
            return false;
        }
        if (controllerType === GRBL) {
            const activeState = get(controllerState, 'status.activeState');
            const states = [
                GRBL_ACTIVE_STATE_ALARM
            ];
            if (includes(states, activeState)) {
                return false;
            }
        }
        if (controllerType === MARLIN) {
            // Marlin does not have machine state
        }
        if (controllerType === SMOOTHIE) {
            const activeState = get(controllerState, 'status.activeState');
            const states = [
                SMOOTHIE_ACTIVE_STATE_ALARM
            ];
            if (includes(states, activeState)) {
                return false;
            }
        }
        if (controllerType === TINYG) {
            const machineState = get(controllerState, 'sr.machineState');
            const states = [
                TINYG_MACHINE_STATE_ALARM
            ];
            if (includes(states, machineState)) {
                return false;
            }
        }

        return true;
    }

    handleOnStop = () => {
        const { actions: { handlePause, handleStop } } = this.props;
        handlePause();
        handleStop();
    }

    handleShowRecentFiles = (event) => {
        let clickedValue = event.currentTarget.innerHTML;
        this.setState({ showLoadFile: true });
        this.setState({ filetoLoad: clickedValue });
    };

    render() {
        const { cameraPosition } = this.props.state;
        const { camera } = this.props.actions;
        const { handleOnStop } = this;
        const { state, actions } = this.props;
        const { port, gcode, workflow } = state;
        const canClick = !!port;
        const isReady = canClick && gcode.ready;
        const canRun = this.canRun();
        const canPause = isReady && includes([WORKFLOW_STATE_RUNNING], workflow.state);
        const canStop = isReady && includes([WORKFLOW_STATE_RUNNING, WORKFLOW_STATE_PAUSED], workflow.state);
        // const canClose = isReady && includes([WORKFLOW_STATE_IDLE], workflow.state);
        // const canUpload = isReady ? canClose : (canClick && !gcode.loading);

        return (
            <div className={styles.workflowControl}>
                <input
                    // The ref attribute adds a reference to the component to
                    // this.refs when the component is mounted.
                    ref={(node) => {
                        this.fileInputEl = node;
                    }}
                    type="file"
                    style={{ display: 'none' }}
                    multiple={false}
                    onChange={this.handleChangeFile}
                    accept=".gcode,.gc,.nc,.tap,.cnc"
                />

                <button
                    type="button"
                    className={`${styles['workflow-button-upload']}`}
                    title={i18n._('Load File')}
                    onClick={this.handleClickUpload}
                    // disabled={!canUpload}
                    style={{ writingMode: 'vertical-lr' }}
                >
                    {i18n._('Load File')} <i className="fa fa-folder-open" style={{ writingMode: 'horizontal-tb' }} />
                </button>
                <Tooltip
                    placement="top"
                    content={i18n._('Close File')}
                    hideOnClick
                >
                    <button
                        type="button"
                        className={this.props.state.gcode.content ? `${styles['workflow-button-split-top']}` : `${styles['workflow-button-disabled']}`}
                        onClick={this.handleCloseFile}
                    >
                        <i className="fas fa-times" />
                    </button>
                </Tooltip>
                {
                    canRun && (
                        <button
                            type="button"
                            className={styles['workflow-button-play']}
                            title={workflow.state === WORKFLOW_STATE_PAUSED ? i18n._('Resume') : i18n._('Run')}
                            onClick={actions.onRunClick}
                            disabled={!canRun}
                        >
                            {i18n._(`${workflow.state === 'paused' ? 'Resume' : 'Start'} Job`)} <i className="fa fa-play" style={{ writingMode: 'horizontal-tb' }} />
                        </button>
                    )
                }
                {
                    this.state.closeFile && (
                        <Modal showCloseButton={false}>
                            <Modal.Header className={styles.modalHeader}>
                                <Modal.Title>Are You Sure?</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <div className={styles.runProbeBody}>
                                    <div className={styles.left}>
                                        <div className={styles.greyText}>
                                            <p>Close this gcode File?</p>
                                        </div>
                                        <div className={styles.buttonsContainer}>
                                            <FunctionButton
                                                primary
                                                onClick={() => {
                                                    this.setState({ closeFile: false });
                                                    actions.closeModal();
                                                    actions.unloadGCode();
                                                    actions.reset();
                                                    Toaster.pop({
                                                        msg: 'Gcode File Closed',
                                                        type: TOASTER_INFO,
                                                        icon: 'fa-exclamation'
                                                    });
                                                }}
                                            >
                                                Yes
                                            </FunctionButton>
                                            <FunctionButton
                                                className={styles.activeButton}
                                                onClick={() => {
                                                    this.setState({ closeFile: false });
                                                    actions.closeModal();
                                                }}
                                            >
                                                No
                                            </FunctionButton>
                                        </div>
                                    </div>

                                </div>
                            </Modal.Body>
                        </Modal>
                    )
                }

                {this.state.showLoadFile && (
                    <Modal showCloseButton={false}>
                        <Modal.Header className={styles.modalHeader}>
                            <Modal.Title>Are You Sure?</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className={styles.runProbeBody}>
                                <div className={styles.left}>
                                    <div className={styles.greyText}>
                                        <p>Load {this.state.filetoLoad}?</p>
                                    </div>
                                    <div className={styles.buttonsContainer}>
                                        <FunctionButton
                                            primary
                                            onClick={() => {
                                                this.handleLoadRecent(this.state.filetoLoad);
                                                this.setState({ showLoadFile: false });
                                                actions.closeModal();
                                                Toaster.pop({
                                                    msg: `${this.state.filetoLoad} Loaded...`,
                                                    type: TOASTER_INFO,
                                                    icon: 'fa-exclamation'
                                                });
                                            }}
                                        >
                                                Yes
                                        </FunctionButton>
                                        <FunctionButton
                                            className={styles.activeButton}
                                            onClick={() => {
                                                this.setState({ closeFile: false });
                                                actions.closeModal();
                                            }}
                                        >
                                                No
                                        </FunctionButton>
                                    </div>
                                </div>

                            </div>
                        </Modal.Body>
                    </Modal>
                )}

                {
                    canPause && (
                        <button
                            type="button"
                            className={styles['workflow-button-pause']}
                            title={i18n._('Pause')}
                            onClick={actions.handlePause}
                            disabled={!canPause}
                        >
                            {i18n._('Pause Job')} <i className="fa fa-pause" style={{ writingMode: 'vertical-lr' }} />
                        </button>
                    )
                }

                {
                    canStop && (
                        <button
                            type="button"
                            className={styles['workflow-button-stop']}
                            title={i18n._('Stop')}
                            onClick={handleOnStop}
                            disabled={!canStop}
                        >
                            {i18n._('Stop Job')} <i className="fa fa-stop" style={{ writingMode: 'vertical-lr' }} />
                        </button>
                    )
                }


                <CameraDisplay
                    camera={camera}
                    cameraPosition={cameraPosition}
                />
            </div>
        );
    }
}

export default WorkflowControl;
