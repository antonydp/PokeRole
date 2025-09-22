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

    return (
        <div className={`flex flex-col items-center py-5 px-2 rounded-lg ${className}`} style={{ backgroundColor: '#00a6ff99' }}>
            <span className="font-bold text-white uppercase text-sm mb-1">{name}</span>
            <div className="flex items-center justify-center w-full">
                <CircleRating
                    value={value}
                    max={max}
                    onChange={(v) => {
                        if (v >= minValue && v <= max) {
                            onChange(v);
                        }
                    }}
                    isPoolExhausted={isPoolExhausted}
                    circleClassName="w-4 h-4"
                    className="gap-1.5"
                    baseValue={baseValue}
                />
            </div>
        </div>
    );
};