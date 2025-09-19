import React from 'react';
import { TrainerData, PotionBottle, Item, ItemInstance } from '../../src/types/index.js';
import PotionManager from './PotionManager.js';
import Pocket from './Pocket.js';
import { PointsDisplay } from '../shared/Points.js';
import { SocialAttribute } from '../shared/SocialAttribute.js';
import { SOCIAL_ATTRIBUTES } from '../../src/constants/gameConstants.js';

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

    const handlePotionsChange = (newPotions: PotionBottle[]) => {
        onUpdateField('potions', newPotions);
    };
    
    return (
        <div className="lg:col-span-5 space-y-3">
             <div className="space-y-2">
                <PointsDisplay label="Social Points" spent={points.social.spent} total={points.social.total} />
                <div className="grid grid-cols-5 gap-2">
                    {SOCIAL_ATTRIBUTES.map(attr => (
                        <SocialAttribute
                            key={attr.name}
                            label={attr.name}
                            value={trainerData[attr.field]}
                            max={5}
                            min={1}
                            color={attr.color}
                            onChange={(newValue) => onSocialAttributeChange(attr.field, newValue)}
                        />
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