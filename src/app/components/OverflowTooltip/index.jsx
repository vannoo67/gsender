/*
 *     This file is part of gSender.
 *
 *     gSender is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     gSender is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with gSender.  If not, see <https://www.gnu.org/licenses/>.
 */

import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';

class OverflowTooltip extends React.Component {
    static propTypes = {
        title: PropTypes.string
    };

    state = {
        overflow: false
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        return {
            overflow: false
        };
    }

    detectOverflow = () => {
        const el = ReactDOM.findDOMNode(this);
        const overflow = (el.clientWidth < el.scrollWidth);
        if (overflow !== this.state.overflow) {
            this.setState({ overflow: overflow });
        }
    };

    componentDidMount() {
        this.detectOverflow();
    }

    componentDidUpdate() {
        this.detectOverflow();
    }

    render() {
        const { title, ...props } = this.props;

        if (this.state.overflow) {
            props.title = title;
        }

        return (
            <div {...props} />
        );
    }
}

export default OverflowTooltip;
