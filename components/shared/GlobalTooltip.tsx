import React, { useState, useEffect } from 'react';

export interface TooltipData {
    content: { name: string; description: string };
    rect: DOMRect;
}

export const GlobalTooltip: React.FC<{ tooltipData: TooltipData | null }> = ({ tooltipData }) => {
    const [currentTooltipData, setCurrentTooltipData] = useState<TooltipData | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let animationFrameId: number;
        let timeoutId: ReturnType<typeof setTimeout>;

        if (tooltipData) {
            setCurrentTooltipData(tooltipData);
            animationFrameId = requestAnimationFrame(() => {
                setIsVisible(true);
            });
        } else {
            setIsVisible(false);
            timeoutId = setTimeout(() => {
                setCurrentTooltipData(null);
            }, 150); // Match transition duration
        }

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [tooltipData]);
    
    if (!currentTooltipData) return null;

    const { content, rect } = currentTooltipData;
    
    const style: React.CSSProperties = {
        position: 'fixed',
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
        transform: 'translate(-50%, -100%)',
        pointerEvents: 'none',
        zIndex: 1000,
    };

    return (
        <div 
            style={style} 
            className={`
                w-60 bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg z-20 
                transition-opacity duration-150 ease-in-out
                ${isVisible ? 'opacity-100' : 'opacity-0'}
            `}
        >
             <div className="absolute bottom-[-9px] left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-800 border-b border-r border-slate-600 transform rotate-45"></div>
            <h4 className="font-bold text-poke-yellow mb-1 text-base font-pixel">{content.name}</h4>
            <p className="text-sm text-gray-300 font-sans">{content.description}</p>
        </div>
    );
};