import React from 'react';

interface PointsDisplayProps {
    spent: number;
    total: number;
    label: string;
}

export const PointsDisplay: React.FC<PointsDisplayProps> = ({ spent, total, label }) => {
    const isExhausted = spent >= total;
    return (
        <div className={`text-sm text-right p-1 rounded ${isExhausted ? 'text-red-600 bg-red-100/30' : 'text-gray-700 bg-gray-200/30'}`}>
            <span className="font-bold">{spent}</span> / {total} {label}
        </div>
    );
};