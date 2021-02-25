import React, { PureComponent } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { trackPage } from '../lib/analytics';
import Workspace from './Workspace';
import Settings from './Settings';
import styles from './App.styl';

class App extends PureComponent {
    static propTypes = {
        ...withRouter.propTypes
    };

    render() {
        const { location } = this.props;
        const accepted = ([
            '/workspace',
            '/settings',
            '/settings/general',
            '/settings/workspace',
            '/settings/machine-profiles',
            '/settings/user-accounts',
            '/settings/controller',
            '/settings/commands',
            '/settings/events',
            '/settings/about'
        ].indexOf(location.pathname) >= 0);

        if (!accepted) {
            return (
                <Redirect
                    to={{
                        pathname: '/workspace',
                        state: {
                            from: location
                        }
                    }}
                />
            );
        }

        trackPage(location.pathname);

        return (
            <div>
                <div className={styles.main}>
                    <div className={styles.content}>
                        <Workspace
                            {...this.props}
                            style={{
                                display: (location.pathname !== '/workspace') ? 'none' : 'block'
                            }}
                        />
                        {location.pathname.indexOf('/settings') === 0 &&
                            <Settings {...this.props} />
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(App);
