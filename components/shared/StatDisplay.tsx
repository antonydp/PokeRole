import React from 'react';

interface StatDisplayProps {
    label: string;
    currentValue: number;
    maxValue: number;
    onValueChange: (newValue: number) => void;
    className?: string;
    circleColorClass?: string;
    variant?: 'default' | 'inline';
}

export const StatDisplay: React.FC<StatDisplayProps> = ({
    label,
    currentValue,
    maxValue,
    onValueChange,
    className = '',
    circleColorClass = 'bg-green-500',
    variant = 'default',
}) => {
    if (variant === 'inline') {
        const circleSize = 'w-3 h-3';
        return (
            <div className={`flex items-center justify-between ${className}`}>
                <span className="font-bold text-sm text-white/90 mr-2">{label}</span>
                <div className="flex flex-row-reverse items-center gap-1 flex-wrap justify-end">
                    {Array.from({ length: maxValue }, (_, i) => {
                        const isFilled = i < currentValue;
                        return (
                            <button
                                key={i}
                                type="button"
                                aria-label={`Set ${label} to ${i + 1}`}
                                onClick={() => onValueChange(i < currentValue ? i : i + 1)}
                                className={`${circleSize} rounded-full transition-all duration-75 ${
                                    isFilled ? `${circleColorClass} shadow-sm` : `bg-black/20 hover:scale-125 hover:bg-white/50`
                                }`}
                            />
                        );
                    })}
                </div>
            </div>
        );
    }

    // Default variant
    const statThreshold = 12;
    const circleSize = maxValue > statThreshold ? 'w-3 h-3' : 'w-4 h-4';
    const containerStyle = maxValue > statThreshold ? 'flex-wrap' : 'flex-nowrap';

    return (
        <div className={`bg-black/40 p-1.5 rounded-lg border-2 border-black/60 shadow-inner ${className}`}>
            <div className="flex justify-between items-center mb-1 px-1">
                <label className="text-white/80 text-[10px] font-bold uppercase tracking-widest">{label}</label>
                <span className="text-white font-sans font-bold">{currentValue} / {maxValue}</span>
            </div>
            <div className={`flex flex-row gap-1 items-center ${containerStyle}`}>
                {Array.from({ length: maxValue }, (_, i) => {
                    const isFilled = i < currentValue;
                    return (
                        <button
                            key={i}
                            type="button"
                            aria-label={`Set ${label} to ${i + 1}`}
                            onClick={() => onValueChange(i < currentValue ? i : i + 1)}
                            className={`${circleSize} rounded-full transition-colors ${
                                isFilled ? circleColorClass : `bg-black/20 hover:${circleColorClass}/50`
                            }`}
                        />
                    );
                })}
            </div>
        </div>
    );
};