import React from 'react';
import { TrajectoryDataPoint } from '../types';

interface Series {
    data: TrajectoryDataPoint[];
    color: string;
    name?: string;
    isDashed?: boolean;
    strokeWidth?: number;
}

interface LineChartProps {
    series: Series[];
    width?: number;
    height?: number;
}

const LineChart: React.FC<LineChartProps> = ({ series, width = 300, height = 100 }) => {
    if (!series || series.length === 0 || series.every(s => s.data.length === 0)) {
        return <div style={{ width, height }} className="flex items-center justify-center text-slate-500">No data</div>;
    }

    const allPoints = series.flatMap(s => s.data);
    const yMin = Math.min(...allPoints.map(p => p.value));
    const yMax = Math.max(...allPoints.map(p => p.value));
    const xMin = Math.min(...allPoints.map(p => p.year));
    const xMax = Math.max(...allPoints.map(p => p.year));

    const yRange = yMax - yMin === 0 ? 1 : yMax - yMin;
    const xRange = xMax - xMin === 0 ? 1 : xMax - xMin;

    const getCoords = (point: TrajectoryDataPoint) => {
        const x = ((point.year - xMin) / xRange) * width;
        const y = height - ((point.value - yMin) / yRange) * height;
        return { x, y };
    };

    const generatePath = (data: TrajectoryDataPoint[]) => {
        if (data.length < 2) return '';
        let path = `M ${getCoords(data[0]).x} ${getCoords(data[0]).y}`;
        for (let i = 1; i < data.length; i++) {
            path += ` L ${getCoords(data[i]).x} ${getCoords(data[i]).y}`;
        }
        return path;
    };

    return (
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            {series.map((s, index) => (
                <path
                    key={index}
                    d={generatePath(s.data)}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={s.strokeWidth || 2}
                    strokeDasharray={s.isDashed ? '4 4' : 'none'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            ))}
        </svg>
    );
};

export default LineChart;
