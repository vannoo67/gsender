import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { PRIMARY_COLOR, SECONDARY_COLOR } from '../constants';

//Main styles
const Container = styled.div`
        text-align: center;
        border: 2px solid ${PRIMARY_COLOR};
        border-radius: 5px;
        width: 100%;
        max-width: 5rem;
        min-width: 4rem;
        transition: 200ms ease-in-out;
      --tw-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
       box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);

        &.active:hover {
            color: white;
            background-color: ${PRIMARY_COLOR};
            transition: 200ms ease-in-out;

            h3 {
                color: white;
                transition: 200ms ease-in-out;
            }
        }

        &.disabled {
            color: ${SECONDARY_COLOR};
            border: 2px solid ${SECONDARY_COLOR};
            cursor: no-drop;

            h3 {
                color: ${SECONDARY_COLOR};
                transition: 200ms ease-in-out;
            }
        }
    
    &:focus {
        outline: none;
    }
    &:active{
        outline: none;
    }

    h3 {
      font-weight: bold;
      line-height: 1.8rem;
      font-size: 1.6rem;
    }

    p {
        margin: 0;
      
    }

    p, h3 {
      margin: 1px;
    }

`;

const AxisButton = ({ label, axis, onClick, disabled }) => {
    return (
        <Container
            role="button"
            onClick={onClick}
            onKeyDown={onClick}
            tabIndex={0}
            className={disabled ? 'disabled' : 'active'}
        >
            <p>{label}</p>

            <h3>{axis.toUpperCase()}</h3>
        </Container>
    );
};

AxisButton.propTypes = {
    label: PropTypes.string,
    axis: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

AxisButton.defaultProps = {
    label: 'Zero'
};

export default AxisButton;
