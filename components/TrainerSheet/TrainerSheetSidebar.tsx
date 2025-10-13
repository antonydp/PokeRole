import React from 'react';
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
    isBadgeModalOpen: boolean;
    onOpenBadgeModal: () => void;
    onCloseBadgeModal: () => void;
    onSelectBadge: (badge: Badge) => void;
    onRemoveItem: (itemId: string) => void;
    onRemoveMainPocketItem: (itemId: string) => void;
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
    allBadges,
    isBadgeModalOpen,
    onOpenBadgeModal,
    onCloseBadgeModal,
    onSelectBadge,
    onRemoveItem,
    onRemoveMainPocketItem
}) => {

    const handlePotionsChange = (newPotions: PotionBottle[]) => {
        onUpdateField('potions', newPotions);
    };

    return (
    // Main container for the right column.
    // A gap of 4 provides clear separation between the major sections.
    <div className="lg:col-span-5 flex flex-col gap-2">

        {/* ================================================================== */}
        {/* == Social Attributes Section ===================================== */}
        {/* ================================================================== */}
        <div className="flex flex-col gap-2">
            <PointsDisplay label="Social Points" spent={points.social.spent} total={points.social.total} />
            <div className="grid grid-cols-5 gap-1.5">
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
        <div className="flex flex-col gap-2">
            <PotionManager potions={trainerData.potions} onUpdate={handlePotionsChange} />

            {/* Wrapper for the button for consistent styling */}
            <div className="p-1 bg-black/10 rounded-lg border-2 border-[#3A3A3A]">
                <button
                    onClick={onOpenItemModal}
                    disabled={!canAddItem}
                    className="w-full bg-poke-blue text-white font-primary text-xs rounded-md py-1.5 border-b-2 border-blue-900 hover:bg-blue-600 active:translate-y-px active:border-b-0 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-poke-yellow disabled:bg-slate-600 disabled:border-slate-700 disabled:cursor-not-allowed disabled:transform-none"
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
                onRemoveItem={onRemoveItem}
            />
            <Pocket
                title="Main Pocket"
                items={trainerData.mainPocket}
                itemMap={itemMap}
                onUpdate={(updatedItems) => onPocketUpdate('mainPocket', updatedItems)}
                onItemMouseEnter={onItemMouseEnter}
                onItemMouseLeave={onItemMouseLeave}
                onRemoveItem={onRemoveMainPocketItem}
            />
        </div>
        
        {/* ================================================================== */}
        {/* == Gym Badges Section ============================================ */}
        {/* ================================================================== */}
        <div className="flex flex-col gap-1.5">
            <h3 className="text-center text-white/80 font-bold text-[10px]">GYM BADGES</h3>
            <div className="grid grid-cols-8 gap-1.5">
                {trainerData.badges?.map((badge, i) => (
                    <div
                        key={i}
                        className="w-full aspect-square bg-black/10 border-2 border-black/40 rounded-full cursor-pointer"
                        aria-label={`Badge Slot ${i + 1}`}
                        onClick={onOpenBadgeModal}
                        onMouseEnter={(e) => onItemMouseEnter({ name: badge.name, description: badge.description }, e.currentTarget)}
                        onMouseLeave={onItemMouseLeave}
                    >
                        <img src={badge.image_url} alt={badge.name} title={badge.name} className="w-full h-full object-contain p-1" />
                    </div>
                ))}
                {Array.from({ length: 8 - (trainerData.badges?.length || 0) }).map((_, i) => (
                    <div
                        key={`empty-${i}`}
                        className="w-full aspect-square bg-black/10 border-2 border-dashed border-black/40 rounded-full cursor-pointer"
                        aria-label={`Badge Slot ${ (trainerData.badges?.length || 0) + i + 1}`}
                        onClick={onOpenBadgeModal}
                    >
                    </div>
                ))}
            </div>
        </div>
        <BadgeModal
            isOpen={isBadgeModalOpen}
            onClose={onCloseBadgeModal}
            allBadges={allBadges}
            onSelectBadge={onSelectBadge}
        />
    </div>
);
};

export default TrainerSheetSidebar;
