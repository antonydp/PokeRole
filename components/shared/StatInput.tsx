import React from 'react';
import { MinusIcon, PlusIcon } from '../Icons.js';

interface StatInputProps {
    label: string;
    value: number;
    onIncrement: () => void;
    onDecrement: () => void;
    isPoolExhausted: boolean;
    minValue?: number;
}

export const StatInput: React.FC<StatInputProps> = ({ label, value, onIncrement, onDecrement, isPoolExhausted, minValue = 0 }) => {
    const canIncrement = !isPoolExhausted;
    const canDecrement = value > minValue;

    return (
        <div className="flex items-center justify-between">
            <label className="text-white font-bold capitalize">{label}</label>
            <div className="flex items-center gap-2">
                <button 
                    onClick={onDecrement} 
                    disabled={!canDecrement}
                    className="p-1 rounded-full bg-poke-red disabled:bg-slate-600 text-white transition-colors"
                >
                    <MinusIcon className="w-4 h-4" />
                </button>
                <span className="text-lg font-bold text-white w-6 text-center">{value}</span>
                <button 
                    onClick={onIncrement} 
                    disabled={!canIncrement}
                    className="p-1 rounded-full bg-poke-blue disabled:bg-slate-600 text-white transition-colors"
                >
                    <PlusIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};