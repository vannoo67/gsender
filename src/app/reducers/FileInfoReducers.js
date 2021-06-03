/*
 * Copyright (C) 2021 Sienci Labs Inc.
 *
 * This file is part of gSender.
 *
 * gSender is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, under version 3 of the License.
 *
 * gSender is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with gSender.  If not, see <https://www.gnu.org/licenses/>.
 *
 * Contact for information regarding this program and its license
 * can be sent through gSender@sienci.com or mailed to the main office
 * of Sienci Labs Inc. in Waterloo, Ontario, Canada.
 *
 */
import { createReducer } from 'redux-action';
import { UNLOAD_FILE_INFO, PROCESS_FILE_INFO } from 'app/actions/fileInfoActions';

const initialState = {
    fileLoaded: false,
    name: null,
    size: 0,
    total: 0,
    toolSet: null,
    spindleSet: null,
    movementSet: null,
    invalidGcode: null,
    estimatedTime: 0,
    bbox: {
        min: { x: 0, y: 0, z: 0 },
        max: { x: 0, y: 0, z: 0 },
    },
};

const reducer = createReducer(initialState, {
    [UNLOAD_FILE_INFO]: (context, reducerState) => {
        return {
            ...initialState
        };
    },
    [PROCESS_FILE_INFO]: (payload, reducerState) => {
        return {
            ...payload
        };
    }
});

export default reducer;
