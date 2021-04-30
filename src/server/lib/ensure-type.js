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

export const ensureBoolean = (value, defaultValue = false) => {
    if (value === undefined || value === null) {
        return Boolean(defaultValue);
    }

    return (typeof value === 'boolean') ? value : Boolean(value);
};

export const ensureString = (value, defaultValue = '') => {
    if (value === undefined || value === null) {
        return String(defaultValue);
    }

    return (typeof value === 'string') ? value : String(value);
};

export const ensureNumber = (value, defaultValue = 0) => {
    if (value === undefined || value === null) {
        return Number(defaultValue);
    }

    return (typeof value === 'number') ? value : Number(value);
};
