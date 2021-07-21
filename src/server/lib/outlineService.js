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

import Toolpath from 'gcode-toolpath';
import ch from 'hull.js';
import * as THREE from 'three';
import logger from './logger';

const log = logger('service:outline');

// Generate an ordered pair - we don't care about Z index for outline purposes so it's removed
function vertex(x, y) {
    return [
        x.toFixed(3),
        y.toFixed(3)
    ];
    /*return {
        x: x.toFixed(3),
        y: y.toFixed(3),
    };*/
}

export function getOutlineGcode(gcode) {
    const vertices = [];
    const toolpath = new Toolpath({
        addLine: ({ motion }, v1, v2) => {
            // We ignore G0 movements since they generally aren't cutting movements
            if (motion === 'G1') {
                vertices.push(vertex(v1.x, v1.y));
                vertices.push(vertex(v2.x, v2.y));
            }
        },
        addArcCurve: ({ motion, plane }, v1, v2, v0) => {
            const isClockwise = (motion === 'G2');
            const radius = Math.sqrt(
                ((v1.x - v0.x) ** 2) + ((v1.y - v0.y) ** 2)
            );
            let startAngle = Math.atan2(v1.y - v0.y, v1.x - v0.x);
            let endAngle = Math.atan2(v2.y - v0.y, v2.x - v0.x);

            // Draw full circle if startAngle and endAngle are both zero
            if (startAngle === endAngle) {
                endAngle += (2 * Math.PI);
            }

            const arcCurve = new THREE.ArcCurve(
                v0.x, // aX
                v0.y, // aY
                radius, // aRadius
                startAngle, // aStartAngle
                endAngle, // aEndAngle
                isClockwise // isClockwise
            );
            const divisions = 30;
            const points = arcCurve.getPoints(divisions);
            vertices.push(vertex(v1.x, v1.y));

            for (let i = 0; i < points.length; ++i) {
                const point = points[i];
                const z = ((v2.z - v1.z) / points.length) * i + v1.z;

                if (plane === 'G17') { // XY-plane
                    vertices.push(vertex(point.x, point.y));
                } else if (plane === 'G18') { // ZX-plane
                    vertices.push(vertex(point.y, z));
                } else if (plane === 'G19') { // YZ-plane
                    vertices.push(vertex(z, point.x));
                }
            }
        }
    });
    log.debug('Parsing g-code');
    toolpath.loadFromStringSync(gcode);

    log.debug('Generating hull');
    const fileHull = ch(vertices, 25);

    const gCode = convertPointsToGCode(fileHull);

    return gCode;
}

/*function generateConvexHull(points) {
    if (points.length < 3) {
        return [];
    }
    const result = [];
    const leftMostPoint = getLeftmostPoint(points);
    let currentPoint = leftMostPoint;
    do {
        result.push(points[currentPoint]);
        currentPoint = getNextOuterPoint(points, currentPoint);
    } while (currentPoint !== leftMostPoint);
    return result;
}

function getLeftmostPoint(points) {
    let leftMostPoint = 0;
    for (let i = 1; i < points.length; i++) {
        const pointX = points[i].x;
        const leftMostPointX = points[leftMostPoint].x;
        if (pointX < leftMostPointX) {
            leftMostPoint = i;
        }
    }
    return leftMostPoint;
}

function getNextOuterPoint(points, startingIndex) {
    console.log(startingIndex);
    let q = (startingIndex + 1) % points.length;
    console.log(q);
    for (let i = 0; i < points.length; i++) {
        if (orientation(points[startingIndex], points[i], points[q]) === COUNTER_CLOCKWISE) {
            q = i;
        }
    }
    console.log(`Returning ${q}`);
    return q;
}

function orientation(p, q, r) {
    // https://www.geeksforgeeks.org/orientation-3-ordered-points/
    const value = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (value === 0) {
        return COLLINEAR;
    }
    return (value > 0) ? CLOCKWISE : COUNTER_CLOCKWISE;
}
*/
function convertPointsToGCode(points) {
    const gCode = [];
    points.forEach(point => {
        const [x, y] = point;
        gCode.push(`G21 G0 X${x} Y${y}`);
    });
    return gCode;
}
