import React from 'react';
import { CircleRating } from './CircleRating.js';

interface SocialAttributeProps {
    label: string;
    value: number;
    max: number;
    min?: number;
    color: string;
    onChange: (newValue: number) => void;
}

export const SocialAttribute: React.FC<SocialAttributeProps> = ({ label, value, max, min = 1, color, onChange }) => {

    const handleRatingChange = (newValue: number) => {
        // If circle rating allows deselecting to 0, this will enforce the minimum.
        if (newValue < min) {
            onChange(min);
        } else {
            onChange(newValue);
        }
    };

    return (
        <div className={`${color} rounded-lg p-2 text-black shadow-inner flex flex-col items-center`}>
            <span className="font-bold text-xs uppercase tracking-wider mb-1">{label}</span>
            <CircleRating
                value={value}
                max={max}
                onChange={handleRatingChange}
                circleClassName="w-3 h-3"
            />
        </div>
    );
};