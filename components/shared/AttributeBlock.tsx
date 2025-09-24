import React from 'react';
import { CircleRating } from './CircleRating.js';

interface AttributeBlockProps<T extends Record<string, any>> {
    name: string;
    value: number;
    onChange: (value: number) => void;
    isPoolExhausted: boolean;
    max: number;
    minValue?: number;
    className?: string;
    key?: React.Key;
    baseValue?: number;
}

export const AttributeBlock = <T extends Record<string, any>>({ name, value, onChange, isPoolExhausted, max, minValue = 0, className, baseValue }: AttributeBlockProps<T>) => {
    const circleClassName = max > 10 ? 'w-3 h-3' :  max > 9 ? 'w-3.5 h-3.5' :'w-4 h-4';
    const gapClassName =  max > 12 ? 'gap-0.5' :max > 10 ? 'gap-1' : 'gap-1.5';

    return (
        <div
            className={`flex flex-col items-center p-6 gap-2 rounded-lg ${className}`}
            style={{ backgroundColor: '#00a6ff99' }}
        >
            <span className="font-bold text-white uppercase text-center">{name}</span>

            <CircleRating
                value={value}
                max={max}
                onChange={(v) => {
                    if (v >= minValue && v <= max) {
                        onChange(v);
                    }
                }}
                isPoolExhausted={isPoolExhausted}
                circleClassName={circleClassName}
                className={gapClassName}
                baseValue={baseValue}
            />
        </div>
    );
};