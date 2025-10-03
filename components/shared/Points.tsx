import React from 'react';

interface PointsDisplayProps {
    spent: number;
    total: number;
    label: string;
}

export const PointsDisplay: React.FC<PointsDisplayProps> = ({ spent, total, label }) => {
    const available = (typeof total === 'number' && typeof spent === 'number') ? total - spent : 0;
    const isExhausted = available <= 0;
    return (
        <div className={`text-sm text-right p-1 rounded ${isExhausted ? 'text-red-600 bg-red-100/30' : 'text-gray-700 bg-gray-200/30'}`}>
            <span className="font-bold">{available}</span> {label} Available
        </div>
    );
};