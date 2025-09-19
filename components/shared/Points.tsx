import React from 'react';

interface PointsDisplayProps {
    spent: number;
    total: number;
    label: string;
}

export const PointsDisplay: React.FC<PointsDisplayProps> = ({ spent, total, label }) => {
    const isExhausted = spent >= total;
    return (
        <div className={`text-sm text-right ${isExhausted ? 'text-red-400' : 'text-gray-300'}`}>
            <span className="font-bold">{spent}</span> / {total} {label}
        </div>
    );
};