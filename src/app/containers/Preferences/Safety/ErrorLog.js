import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from '../index.styl';

const ErrorLog = ({ getErrors }) => {
    const [error, setError] = useState('');
    useEffect(() => {
        setError(getErrors());
    }, [getErrors]);
    return (
        <div className={styles.errorWrapper}>
            <div className={styles.errorHeading}>
                Errors and warnings summary
            </div>
            <div className={styles.errorBody}>
                {error}
            </div>
        </div>
    );
};

ErrorLog.protoTypes = {
    errors: PropTypes.object,
};

export default ErrorLog;
