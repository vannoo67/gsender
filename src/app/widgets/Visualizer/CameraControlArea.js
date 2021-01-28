import React, { Component } from 'react';
import PropTypes from 'prop-types';

import leftSideIcon from './images/camera-left-side-view-light.png';
import rightSideIcon from './images/camera-right-side-view-light.png';
import topSideIcon from './images/camera-top-view-light.png';
import frontSideIcon from './images/camera-front-view-light.png';
import threeDIcon from './images/camera-3d-view-light.png';

import styles from './camera-control-area.styl';
import CameraItem from './CameraItem';

/**
 * Control Area component displaying camera toggles and uploaded file details
 * @param {Object} state Default state given from parent component
 * @param {Object} actions Actions object given from parent component
 */
export default class ControlArea extends Component {
    static propTypes = {
        state: PropTypes.object,
        actions: PropTypes.object,
    }

    render() {
        const { cameraPosition, controller, port } = this.props.state;
        const { name, total } = this.props.state.gcode;
        const { camera } = this.props.actions;

        const { state = {} } = controller;

        //Array of objects containing the images, functions and tooltip settings for the CameraItem components being rendered from to be outputted
        const cameraItems = [
            { id: 0, img: rightSideIcon, cameraSide: camera.toRightSideView, tooltip: { text: 'Right Side View', placement: 'top' }, active: cameraPosition === 'right' },
            { id: 1, img: leftSideIcon, cameraSide: camera.toLeftSideView, tooltip: { text: 'Left Side View', placement: 'top' }, active: cameraPosition === 'left' },
            { id: 2, img: frontSideIcon, cameraSide: camera.toFrontView, tooltip: { text: 'Front View', placement: 'right' }, active: cameraPosition === 'front' },
            { id: 3, img: topSideIcon, cameraSide: camera.toTopView, tooltip: { text: 'Top View', placement: 'bottom' }, active: cameraPosition === 'top' },
            { id: 4, img: threeDIcon, cameraSide: camera.to3DView, tooltip: { text: '3D View', placement: 'bottom' }, active: cameraPosition === '3d' },
        ];

        console.log(styles);

        return (
            <div className={styles['control-area']}>
                <div className={styles['camera-control']}>
                    {
                        cameraItems.map(item => (
                            <CameraItem
                                key={item.id}
                                image={item.img}
                                changeCamera={item.cameraSide}
                                tooltip={item.tooltip}
                                active={item.active}
                            />
                        ))
                    }
                </div>

                {port && <div className={styles[`machine-${state.status.activeState}`]}>{state.status.activeState}</div>}

                <div className={styles['machine-status']}>
                    { name && <p><strong>{name}</strong></p> }
                    { total !== 0 && <p>{`${total} lines`}</p> }
                </div>
            </div>
        );
    }
}
