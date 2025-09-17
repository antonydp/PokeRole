import React from 'react';
import { TrainerData, PotionBottle, Item, ItemInstance } from '../../types';
import { CircleRating } from '../PokemonDetail/Shared';
import PotionManager from './PotionManager';
import Pocket from './Pocket';
import { PointTracker } from './Shared';

interface TrainerSheetSidebarProps {
    trainerData: TrainerData;
    onUpdateField: (field: keyof TrainerData, value: any) => void;
    onSocialAttributeChange: (field: keyof TrainerData, value: number) => void;
    onOpenItemModal: () => void;
    canAddItem: boolean;
    itemMap: Map<string, Item>;
    onPocketUpdate: (pocket: 'smallPocket' | 'mainPocket', updatedPocket: ItemInstance[]) => void;
    onItemMouseEnter: (content: { name: string; description: string }, element: HTMLElement) => void;
    onItemMouseLeave: () => void;
    points: { social: { spent: number; total: number; } };
    isSocialAttributePoolExhausted: boolean;
}

const TrainerSheetSidebar: React.FC<TrainerSheetSidebarProps> = ({ 
    trainerData, 
    onUpdateField, 
    onSocialAttributeChange, 
    onOpenItemModal, 
    canAddItem, 
    itemMap, 
    onPocketUpdate, 
    onItemMouseEnter, 
    onItemMouseLeave,
    points,
    isSocialAttributePoolExhausted
}) => {
    
    const socialAttributes = [
        { name: 'TOUGH', value: trainerData.tough, field: 'tough' as const, color: 'bg-[#F7F0A0]' },
        { name: 'COOL', value: trainerData.cool, field: 'cool' as const, color: 'bg-[#F4A27A]' },
        { name: 'BEAUTY', value: trainerData.beauty, field: 'beauty' as const, color: 'bg-[#A1C6F4]' },
        { name: 'CUTE', value: trainerData.cute, field: 'cute' as const, color: 'bg-[#F6B8D0]' },
        { name: 'CLEVER', value: trainerData.clever, field: 'clever' as const, color: 'bg-[#A8D79A]' },
    ];

    const handlePotionsChange = (newPotions: PotionBottle[]) => {
        onUpdateField('potions', newPotions);
    };
    
    return (
        <div className="lg:col-span-5 space-y-3">
             <div className="space-y-2">
                <PointTracker label="Social Points" spent={points.social.spent} total={points.social.total} />
                <div className="flex gap-2">
                    {socialAttributes.map(attr => (
                        <div key={attr.name} className={`${attr.color} rounded-lg p-1 border-2 border-[#3A3A3A] flex-grow flex flex-col justify-center items-center`}>
                            <span className="text-[#3A3A3A] font-bold text-[10px] tracking-wider">{attr.name}</span>
                            <CircleRating 
                                value={attr.value} 
                                max={5} 
                                onChange={(value) => onSocialAttributeChange(attr.field, value)} 
                                circleClassName="w-3 h-3" 
                                className="mt-1" 
                                isPoolExhausted={isSocialAttributePoolExhausted}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <PotionManager potions={trainerData.potions} onUpdate={handlePotionsChange} />

            <div className="p-2 bg-black/10 rounded-lg border-2 border-[#3A3A3A]">
                <button
                    onClick={onOpenItemModal}
                    disabled={!canAddItem}
                    className="w-full bg-poke-blue text-white font-pixel text-sm rounded-md py-2 border-b-4 border-blue-900 hover:bg-blue-600 active:translate-y-0.5 active:border-b-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-poke-yellow disabled:bg-slate-600 disabled:border-slate-700 disabled:cursor-not-allowed disabled:transform-none"
                >
                    Add Item to Pockets
                </button>
            </div>

            <Pocket 
                title="Small Pocket"
                items={trainerData.smallPocket}
                itemMap={itemMap}
                onUpdate={(updatedItems) => onPocketUpdate('smallPocket', updatedItems)}
                onItemMouseEnter={onItemMouseEnter}
                onItemMouseLeave={onItemMouseLeave}
            />
            <Pocket 
                title="Main Pocket"
                items={trainerData.mainPocket}
                itemMap={itemMap}
                onUpdate={(updatedItems) => onPocketUpdate('mainPocket', updatedItems)}
                onItemMouseEnter={onItemMouseEnter}
                onItemMouseLeave={onItemMouseLeave}
            />
            
            <div>
                <h3 className="text-center text-white/80 font-bold text-xs mb-1">GYM BADGES</h3>
                <div className="grid grid-cols-8 gap-2 mb-1.5">
                    {Array.from({length: 8}).map((_, i) => (
                        <div key={i} className="w-full aspect-square bg-black/10 border-2 border-dashed border-black/40 rounded-full" aria-label={`Badge Slot ${i + 1}`}></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrainerSheetSidebar;