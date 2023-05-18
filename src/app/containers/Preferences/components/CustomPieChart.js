/*
    From: https://github.com/recharts/recharts/blob/master/demo/component/PieChart.tsx
*/

import React from 'react';
import uniqueId from 'lodash/uniqueId';
import { PieChart, Pie, Legend, Cell, Label } from 'recharts';


const CustomPieChart = ({ propsData, height, width, showAnimation }) => {
    const renderLabelContent = (props) => {
        const { value, percent, x, y, midAngle } = props;
        return (
            <g transform={`translate(${x}, ${y})`} textAnchor={midAngle < -90 || midAngle >= 90 ? 'end' : 'start'}>
                <text x={0} y={0}>{`${value}`}</text>
                <text x={0} y={20}>{`(${(percent * 100).toFixed(2)}%)`}</text>
            </g>
        );
    };

    return (
        <PieChart width={width} height={height} style={{ marginBottom: '30px' }}>
            <Legend />
            <Pie
                data={propsData}
                dataKey="value"
                startAngle={180}
                endAngle={-180}
                innerRadius={55}
                outerRadius={90}
                label={renderLabelContent}
                paddingAngle={5}
                isAnimationActive={showAnimation}
                style={{ outline: 'none' }}
            >
                {propsData.map((entry, index) => (
                    <Cell style={{ outline: 'none' }} key={`slice-${uniqueId()}`} fill={entry.color} />
                ))}
                <Label width={50} position="center">
                    Jobs Run
                </Label>
            </Pie>
        </PieChart>
    );
};

export default CustomPieChart;
