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
import { useSessionStore } from '../src/store/useSessionStore.js';
import { useGameDataStore } from '../src/store/useGameDataStore.js';

const TrainerSheet: React.FC = () => {
    const { trainerData, updateTrainerData } = useSessionStore();
    const { allItems, allBadges } = useGameDataStore();

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
        isBadgeModalOpen,
        setIsBadgeModalOpen,
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
        handleAddBadge,
        itemMap
    } = useTrainerSheet(trainerData, updateTrainerData, allItems);

    const {
        points,
        isAttributePoolExhausted,
        isSocialAttributePoolExhausted,
        isSkillPoolExhausted
    } = usePointCalculations(trainerData);

    const handleSelectNature = (nature: Nature) => {
        updateTrainerData(prev => ({
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
            <div className="relative w-full max-w-7xl mx-auto p-4 rounded-xl font-primary animate-fade-in-scale" style={{ backgroundColor: '#E46243' }}>
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
                    onDataChange={handleFieldChange}
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
                        allBadges={allBadges}
                        isBadgeModalOpen={isBadgeModalOpen}
                        onOpenBadgeModal={() => setIsBadgeModalOpen(true)}
                        onCloseBadgeModal={() => setIsBadgeModalOpen(false)}
                        onSelectBadge={handleAddBadge}
                    />
                </div>
            </div>
        </>
    );
};

export default TrainerSheet;