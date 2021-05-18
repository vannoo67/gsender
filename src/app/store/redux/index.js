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

import { createStore, applyMiddleware } from 'redux';
import { END } from 'redux-saga';
import thunk from 'redux-thunk';
import mainReducer from 'app/reducers';
import sagaMiddleware from './saga';

const enhancer = applyMiddleware(thunk, sagaMiddleware);

const configureStore = (preloadedState) => {
    const store = createStore(mainReducer, preloadedState, enhancer);
    store.close = () => store.dispatch(END);
    store.runSaga = sagaMiddleware.run;
    return store;
};

const store = configureStore();

export default store;
