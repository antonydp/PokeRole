import React, { useMemo } from 'react';
import { TrainerData, Nature, ItemsData } from '../src/types/index.js';
import NatureModal from '../components/shared/NatureModal.js';
import { RANK_SKILL_LIMITS } from '../src/logic/core.js';
import TrainerSheetHeader from './TrainerSheet/TrainerSheetHeader.js';
import TrainerSheetMainContent from './TrainerSheet/TrainerSheetMainContent.js';
import TrainerSheetSidebar from './TrainerSheet/TrainerSheetSidebar.js';
import ItemModal from './TrainerSheet/ItemModal.js';
import { GlobalTooltip } from './shared/GlobalTooltip.js';
import { useTrainerSheet } from '../src/hooks/useTrainerSheet.js';
import { useNatureModal } from '../src/hooks/useNatureModal.js';
import { usePointCalculations } from '../src/hooks/usePointCalculations.js';

/**
 * The TrainerSheet component displays and allows editing of a Trainer's character sheet.
 * It includes sections for core attributes, skills, social attributes, inventory, and achievements.
 * It also integrates with modals for selecting natures and adding items.
 * @param {TrainerSheetProps} props - The props for the TrainerSheet component.
 * @returns {React.FC} The rendered TrainerSheet component.
 */

interface TrainerSheetProps {
    trainerData: TrainerData;
    onDataChange: (updaterOrData: ((prev: TrainerData) => TrainerData) | TrainerData) => void;
    allItems: ItemsData | null;
}

const TrainerSheet: React.FC<TrainerSheetProps> = ({ trainerData, onDataChange, allItems }) => {

    const {
        isNatureModalOpen,
        closeNatureModal,
        openNatureModal,
        natureSearchTerm,
        setNatureSearchTerm,
        filteredNatures,
    } = useNatureModal();

    const {
        isItemModalOpen,
        setIsItemModalOpen,
        tooltipData,
        handleFieldChange,
        handlePointFieldChange,
        handleExtraSkillChange,
        handlePocketUpdate,
        onItemMouseEnter,
        onItemMouseLeave,
        handleAchievementChange,
        handleAddAchievement,
        handleRemoveAchievement,
        handleAddItem,
        itemMap
    } = useTrainerSheet(trainerData, onDataChange, allItems);

    const {
        points,
        isAttributePoolExhausted,
        isSocialAttributePoolExhausted,
        isSkillPoolExhausted
    } = usePointCalculations(trainerData);

    const handleSelectNature = (nature: Nature) => {
        onDataChange(prev => ({
            ...prev,
            nature: nature.name,
            confidence: String(nature.confidence),
        }));
        closeNatureModal();
    };

    const skillLimit = useMemo(() => RANK_SKILL_LIMITS[trainerData.trainerRank], [trainerData.trainerRank]);

    return (
        <>
            <GlobalTooltip tooltipData={tooltipData} />
            <div className="relative w-full max-w-7xl mx-auto p-4 rounded-xl font-pixel animate-fade-in-scale" style={{ backgroundColor: '#E46243' }}>
                <NatureModal
                    isOpen={isNatureModalOpen}
                    onClose={closeNatureModal}
                    natures={filteredNatures}
                    onSelectNature={handleSelectNature}
                    searchTerm={natureSearchTerm}
                    onSearchTermChange={setNatureSearchTerm}
                />
                {allItems && (
                     <ItemModal
                        isOpen={isItemModalOpen}
                        onClose={() => setIsItemModalOpen(false)}
                        itemsData={allItems}
                        onSelectItem={handleAddItem}
                    />
                )}
                
                <TrainerSheetHeader 
                    trainerData={trainerData}
                    onUpdateField={handleFieldChange}
                    onOpenNatureModal={openNatureModal}
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <TrainerSheetMainContent
                        trainerData={trainerData}
                        onAttributeChange={(field, value) => handlePointFieldChange(field, value, points.attributes)}
                        onSkillChange={(field, value) => handlePointFieldChange(field, value, points.skills)}
                        onAchievementChange={handleAchievementChange}
                        onExtraSkillChange={(index, field, value) => handleExtraSkillChange(index, field, value, points.skills.spent, points.skills.total)}
                        onAddAchievement={handleAddAchievement}
                        onRemoveAchievement={handleRemoveAchievement}
                        skillLimit={skillLimit}
                        points={points}
                        isAttributePoolExhausted={isAttributePoolExhausted}
                        isSkillPoolExhausted={isSkillPoolExhausted}
                    />
                    
                    <TrainerSheetSidebar
                        trainerData={trainerData}
                        onUpdateField={handleFieldChange}
                        onSocialAttributeChange={(field, value) => handlePointFieldChange(field, value, points.social)}
                        onOpenItemModal={() => setIsItemModalOpen(true)}
                        canAddItem={!!allItems}
                        itemMap={itemMap}
                        onPocketUpdate={handlePocketUpdate}
                        onItemMouseEnter={onItemMouseEnter}
                        onItemMouseLeave={onItemMouseLeave}
                        points={points}
                        isSocialAttributePoolExhausted={isSocialAttributePoolExhausted}
                    />
                </div>
            </div>
        </>
    );
};

export default TrainerSheet;