import React, { useState } from 'react';
import { TrainerData, PotionBottle, Item, ItemInstance, Badge } from '../../src/types/index.js';
import BadgeModal from './BadgeModal.js';
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
    allBadges: Badge[];
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
    isSocialAttributePoolExhausted,
    allBadges
}) => {
    const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);

    const handlePotionsChange = (newPotions: PotionBottle[]) => {
        onUpdateField('potions', newPotions);
    };

    const handleSelectBadge = (badge: Badge) => {
        // Assuming badges are stored as a comma-separated string of names
        const currentBadges = trainerData.badges ? trainerData.badges.split(',') : [];
        if (!currentBadges.includes(badge.name)) {
            const newBadges = [...currentBadges, badge.name].join(',');
            onUpdateField('badges', newBadges);
        }
        setIsBadgeModalOpen(false);
    };
    
    return (
    // Main container for the right column.
    // A gap of 4 provides clear separation between the major sections.
    <div className="lg:col-span-5 flex flex-col gap-4">

        {/* ================================================================== */}
        {/* == Social Attributes Section ===================================== */}
        {/* ================================================================== */}
        <div className="flex flex-col gap-4">
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

        {/* ================================================================== */}
        {/* == Inventory Management Section ================================== */}
        {/* ================================================================== */}
        <div className="flex flex-col gap-3">
            <PotionManager potions={trainerData.potions} onUpdate={handlePotionsChange} />

            {/* Wrapper for the button for consistent styling */}
            <div className="p-2 bg-black/10 rounded-lg border-2 border-[#3A3A3A]">
                <button
                    onClick={onOpenItemModal}
                    disabled={!canAddItem}
                    className="w-full bg-poke-blue text-white font-primary text-sm rounded-md py-2 border-b-4 border-blue-900 hover:bg-blue-600 active:translate-y-0.5 active:border-b-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-poke-yellow disabled:bg-slate-600 disabled:border-slate-700 disabled:cursor-not-allowed disabled:transform-none"
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
        </div>
        
        {/* ================================================================== */}
        {/* == Gym Badges Section ============================================ */}
        {/* ================================================================== */}
        <div className="flex flex-col gap-2">
            <h3 className="text-center text-white/80 font-bold text-xs">GYM BADGES</h3>
            <div className="grid grid-cols-8 gap-2">
                {Array.from({ length: 8 }).map((_, i) => {
                    const badgeName = trainerData.badges?.split(',')[i];
                    const badge = badgeName ? allBadges.find(b => b.name === badgeName.trim()) : null;
                    return (
                        <div
                            key={i}
                            className="w-full aspect-square bg-black/10 border-2 border-dashed border-black/40 rounded-full cursor-pointer"
                            aria-label={`Badge Slot ${i + 1}`}
                            onClick={() => setIsBadgeModalOpen(true)}
                        >
                            {badge && (
                                <img src={badge.image_url} alt={badge.name} title={badge.name} className="w-full h-full object-contain p-1" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
        <BadgeModal
            isOpen={isBadgeModalOpen}
            onClose={() => setIsBadgeModalOpen(false)}
            allBadges={allBadges}
            onSelectBadge={handleSelectBadge}
        />
    </div>
);
};

export default TrainerSheetSidebar;