import React, { useState } from 'react';
import { Ribbon } from '../../src/types/index.js';
import { GlobalTooltip } from '../shared/GlobalTooltip.js';
import RibbonModal from './RibbonModal.js';

interface RibbonSelectorProps {
    ribbons: (string | null)[];
    allRibbons: Ribbon[];
    onRibbonChange: (index: number, ribbonName: string | null) => void;
}

export const RibbonSelector: React.FC<RibbonSelectorProps> = ({ ribbons, allRibbons, onRibbonChange }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeSlot, setActiveSlot] = useState<number | null>(null);

    const handleSlotClick = (index: number) => {
        setActiveSlot(index);
        setIsModalOpen(true);
    };

    const handleSelectRibbon = (ribbon: Ribbon) => {
        if (activeSlot !== null) {
            onRibbonChange(activeSlot, ribbon.name);
        }
        setIsModalOpen(false);
        setActiveSlot(null);
    };

    const getRibbonByName = (name: string | null) => {
        return allRibbons.find(r => r.name === name);
    };

    return (
        <div>
            <div className="grid grid-cols-4 gap-2 mt-1">
                {ribbons.map((ribbonName, index) => {
                    const ribbon = getRibbonByName(ribbonName);
                    return (
                        <div
                            key={index}
                            className="bg-white rounded-xl w-full aspect-square border-2 border-[#3A3A3A] cursor-pointer"
                            aria-label={`Ribbon slot ${index + 1}`}
                            onClick={() => handleSlotClick(index)}
                            data-tooltip-id="ribbon-tooltip"
                            data-tooltip-content={ribbon ? `${ribbon.name}: ${ribbon.description}` : 'Click to select a ribbon'}
                        >
                            {ribbon && (
                                <img src={ribbon.image_url} alt={ribbon.name} className="w-full h-full object-contain" />
                            )}
                        </div>
                    );
                })}
            </div>
            <RibbonModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                allRibbons={allRibbons}
                onSelectRibbon={handleSelectRibbon}
            />
            <GlobalTooltip id="ribbon-tooltip" />
        </div>
    );
};