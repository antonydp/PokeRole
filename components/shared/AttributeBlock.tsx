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
}

export const AttributeBlock = <T extends Record<string, any>>({ name, value, onChange, isPoolExhausted, max, minValue = 0, className }: AttributeBlockProps<T>) => {
    const handleDecrement = () => {
        if (value > minValue) {
            onChange(value - 1);
        }
    };

    const handleIncrement = () => {
        if (value < max) {
            onChange(value + 1);
        }
    };

    return (
        <div className={`flex flex-col items-center bg-blue-700/60 p-2 rounded-lg ${className}`}>
            <span className="font-bold text-white uppercase text-sm mb-1">{name}</span>
            <div className="flex items-center justify-between w-full">
                <button
                    onClick={handleDecrement}
                    disabled={value <= minValue}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded disabled:opacity-50"
                >
                    -
                </button>
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
                />
                <button
                    onClick={handleIncrement}
                    disabled={isPoolExhausted || value >= max}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded disabled:opacity-50"
                >
                    +
                </button>
            </div>
        </div>
    );
};