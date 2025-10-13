import React from 'react';

interface LiveStatProps {
    label: string;
    base: number;
    attributeValue: number;
    result: number;
    className?: string;
}

export const LiveStat: React.FC<LiveStatProps> = ({ label, base, attributeValue, result, className = '' }) => {
    return (
        <div className={`flex items-center justify-between bg-black/20 px-1.5 py-0.5 rounded-md ${className}`}>
            <span className="font-bold text-xs text-cyan-200/80">{label}</span>
            <div className="font-sans font-bold text-xs text-white text-right flex items-center">
                <span className="bg-white/10 px-1 rounded" title="Base Value">{base}</span>
                <span className="text-cyan-300/80 mx-0.5">+</span>
                <span className="bg-white/10 px-1 rounded" title="From Attribute">{attributeValue}</span>
                <span className="text-cyan-300/80 mx-0.5">=</span>
                <span className="bg-white/20 px-1.5 rounded text-sm" aria-live="polite">{result}</span>
            </div>
        </div>
    );
};