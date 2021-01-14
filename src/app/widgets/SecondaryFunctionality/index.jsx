import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import TabbedWidget from 'app/components/TabbedWidget';
import controller from 'app/lib/controller';
import WidgetConfig from '../WidgetConfig';
import ProbeWidget from '../Probe';
import MacroWidget from '../Macro';
import ConsoleWidget from '../Console';
import LaserWidget from '../Laser';
import SpindleWidget from '../Spindle';

import {
    MODAL_NONE,
} from './constants';


class SecondaryFunctionality extends PureComponent {
    static propTypes = {
        widgetId: PropTypes.string.isRequired,
        onFork: PropTypes.func.isRequired,
        onRemove: PropTypes.func.isRequired,
        sortable: PropTypes.object
    };

    config = new WidgetConfig(this.props.widgetId);

    state = this.getInitialState();

    actions = {
        toggleDisabled: () => {
            const { disabled } = this.state;
            this.setState({ disabled: !disabled });
        },
        toggleFullscreen: () => {
            const { minimized, isFullscreen } = this.state;
            this.setState({
                minimized: isFullscreen ? minimized : false,
                isFullscreen: !isFullscreen
            });
        },
        toggleMinimized: () => {
            const { minimized } = this.state;
            this.setState({ minimized: !minimized });
        },
        openModal: (name = MODAL_NONE, params = {}) => {
            this.setState({
                modal: {
                    name: name,
                    params: params
                }
            });
        },
        closeModal: () => {
            this.setState({
                modal: {
                    name: MODAL_NONE,
                    params: {}
                }
            });
        },
        refreshContent: () => {
            if (this.content) {
                const forceGet = true;
                this.content.reload(forceGet);
            }
        },
        handleTabSelect: (index) => {
            this.setState({
                selectedTab: index
            });
        }
    };

    controllerEvents = {
        'serialport:open': (options) => {
            const { port } = options;
            this.setState({ port: port });
        },
        'serialport:close': (options) => {
            const initialState = this.getInitialState();
            this.setState({ ...initialState });
        },
        'workflow:state': (workflowState) => {
            this.setState(state => ({
                workflow: {
                    state: workflowState
                }
            }));
        }
    };

    content = null;

    component = null;

    componentDidMount() {
        this.addControllerEvents();
    }

    componentWillUnmount() {
        this.removeControllerEvents();
    }

    componentDidUpdate(prevProps, prevState) {
        const {
            disabled,
            minimized,
            title,
            url
        } = this.state;

        this.config.set('disabled', disabled);
        this.config.set('minimized', minimized);
        this.config.set('title', title);
        this.config.set('url', url);
    }

    getInitialState() {
        return {
            minimized: this.config.get('minimized', false),
            isFullscreen: false,
            disabled: this.config.get('disabled'),
            port: controller.port,
            controller: {
                type: controller.type,
                state: controller.state
            },
            workflow: {
                state: controller.workflow.state
            },
            selectedTab: 0,
            tabs: [
                {
                    label: 'Probe',
                    widgetId: 'probe',
                    component: ProbeWidget
                },
                {
                    label: 'Macros',
                    widgetId: 'macro',
                    component: MacroWidget
                },
                {
                    label: 'Console',
                    widgetId: 'console',
                    component: ConsoleWidget
                },
                {
                    label: 'Laser',
                    widgetId: 'laser',
                    component: LaserWidget
                },
                {
                    label: 'Spindle',
                    widgetId: 'spindle',
                    component: SpindleWidget
                }
            ]
        };
    }

    addControllerEvents() {
        Object.keys(this.controllerEvents).forEach(eventName => {
            const callback = this.controllerEvents[eventName];
            controller.addListener(eventName, callback);
        });
    }

    removeControllerEvents() {
        Object.keys(this.controllerEvents).forEach(eventName => {
            const callback = this.controllerEvents[eventName];
            controller.removeListener(eventName, callback);
        });
    }

    render() {
        const { isFullscreen, tabs, selectedTab } = this.state;
        const { onFork, onRemove, sortable } = this.props;
        const actions = { ...this.actions };

        return (
            <TabbedWidget fullscreen={isFullscreen}>
                <TabbedWidget.Tabs tabs={tabs} activeTabIndex={selectedTab} onClick={actions.handleTabSelect}>
                    <div>Hi </div>
                </TabbedWidget.Tabs>
                <TabbedWidget.Content>
                    {
                        tabs.map((tab, index) => {
                            const active = index === selectedTab;
                            return (
                                <TabbedWidget.ChildComponent active={active}>
                                    <tab.component
                                        onFork={onFork}
                                        onRemove={onRemove}
                                        sortable={sortable}
                                        widgetId={tab.widgetId}
                                        embedded
                                    />
                                </TabbedWidget.ChildComponent>
                            );
                        })
                    }
                </TabbedWidget.Content>
            </TabbedWidget>
        );
    }
}

export default SecondaryFunctionality;
