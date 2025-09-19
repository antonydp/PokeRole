import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { TrainerData, Nature, ItemsData, Item, HealingItemsSubCategory, ItemInstance } from '../src/types/index.js';
import NatureModal from './PokemonDetail/NatureModal.js';
import { NATURES } from '../src/constants/gameConstants.js';
import { RANK_SKILL_LIMITS, RANK_ATTRIBUTE_POINTS, RANK_SOCIAL_ATTRIBUTE_POINTS, RANK_SKILL_POINTS } from '../src/logic/core.js';
import TrainerSheetHeader from './TrainerSheet/TrainerSheetHeader.js';
import TrainerSheetMainContent from './TrainerSheet/TrainerSheetMainContent.js';
import TrainerSheetSidebar from './TrainerSheet/TrainerSheetSidebar.js';
import ItemModal from './TrainerSheet/ItemModal.js';
import { GlobalTooltip, TooltipData } from './shared/GlobalTooltip.js';

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

    const [isNatureModalOpen, setIsNatureModalOpen] = useState(false);
    const [natureSearchTerm, setNatureSearchTerm] = useState('');
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
    
    // --- Point Calculation Logic ---

    const totalAttributePoints = useMemo(() => RANK_ATTRIBUTE_POINTS[trainerData.trainerRank], [trainerData.trainerRank]);
    const totalSocialAttributePoints = useMemo(() => RANK_SOCIAL_ATTRIBUTE_POINTS[trainerData.trainerRank], [trainerData.trainerRank]);
    const totalSkillPoints = useMemo(() => RANK_SKILL_POINTS[trainerData.trainerRank], [trainerData.trainerRank]);

    const spentAttributePoints = useMemo(() => (trainerData.strength - 1) + (trainerData.dexterity - 1) + (trainerData.vitality - 1) + (trainerData.insight - 1), [trainerData.strength, trainerData.dexterity, trainerData.vitality, trainerData.insight]);
    const spentSocialAttributePoints = useMemo(() => (trainerData.tough - 1) + (trainerData.cool - 1) + (trainerData.beauty - 1) + (trainerData.clever - 1) + (trainerData.cute - 1), [trainerData.tough, trainerData.cool, trainerData.beauty, trainerData.clever, trainerData.cute]);
    const spentSkillPoints = useMemo(() => 
        trainerData.brawl + trainerData.throw + trainerData.evasion + trainerData.weapons +
        trainerData.alert + trainerData.athletic + trainerData.natureSkill + trainerData.stealth +
        trainerData.allure + trainerData.etiquette + trainerData.intimidate + trainerData.perform +
        trainerData.crafts + trainerData.lore + trainerData.medicine + trainerData.science +
        trainerData.extraSkills.reduce((acc, skill) => acc + (skill.value || 0), 0), 
    [trainerData]);

    const isAttributePoolExhausted = spentAttributePoints >= totalAttributePoints;
    const isSocialAttributePoolExhausted = spentSocialAttributePoints >= totalSocialAttributePoints;
    const isSkillPoolExhausted = spentSkillPoints >= totalSkillPoints;
    
    // --- Data Update Handlers ---

    const updateData = useCallback((updater: (prev: TrainerData) => TrainerData) => {
        onDataChange(updater);
    }, [onDataChange]);
    
    const handleFieldChange = useCallback((field: keyof TrainerData, value: any) => {
        updateData(prev => ({...prev, [field]: value}));
    }, [updateData]);

    const handlePointFieldChange = useCallback((
        field: keyof TrainerData, 
        newValue: number,
        pool: { spent: number, total: number }
    ) => {
        updateData(prev => {
            const oldValue = (prev[field] as number) || 0;
            const isIncreasing = newValue > oldValue;
            if(isIncreasing && pool.spent >= pool.total) {
                return prev; // Don't update
            }
            return { ...prev, [field]: newValue };
        });
    }, [updateData]);

    const handleExtraSkillChange = useCallback((index: number, field: 'name' | 'value', value: string | number) => {
        updateData(prev => {
            const currentSpentSkills = spentSkillPoints; // Use pre-calculated value for check
            if (field === 'value') {
                const oldValue = prev.extraSkills[index]?.value || 0;
                const isIncreasing = (value as number) > oldValue;
                if (isIncreasing && currentSpentSkills >= totalSkillPoints) {
                    return prev;
                }
            }
            const newExtraSkills = [...prev.extraSkills];
            newExtraSkills[index] = { ...newExtraSkills[index], [field]: value };
            return { ...prev, extraSkills: newExtraSkills };
        });
    }, [updateData, spentSkillPoints, totalSkillPoints]);

    const handlePocketUpdate = useCallback((pocket: 'smallPocket' | 'mainPocket', updatedPocket: ItemInstance[]) => {
        handleFieldChange(pocket, updatedPocket);
    }, [handleFieldChange]);
    
    const onItemMouseEnter = useCallback((content: { name: string; description: string }, element: HTMLElement) => {
        setTooltipData({ content, rect: element.getBoundingClientRect() });
    }, []);

    const onItemMouseLeave = useCallback(() => {
        setTooltipData(null);
    }, []);

    const handleAchievementChange = useCallback((index: number, field: 'text' | 'completed', value: string | boolean) => {
        const newAchievements = [...trainerData.achievements];
        newAchievements[index] = { ...newAchievements[index], [field]: value };
        handleFieldChange('achievements', newAchievements);
    }, [trainerData.achievements, handleFieldChange]);

    const handleSelectNature = useCallback((nature: Nature) => {
        updateData(prev => ({
            ...prev,
            nature: nature.name,
            confidence: String(nature.confidence),
        }));
        setIsNatureModalOpen(false);
    }, [updateData]);

    const handleAddItem = useCallback((item: Item) => {
        const pocketName = item.usable_in_battle ? 'smallPocket' : 'mainPocket';
        updateData((currentTrainerData: TrainerData) => {
            const currentPocket: ItemInstance[] = currentTrainerData[pocketName] || [];
            const existingItemIndex = currentPocket.findIndex(i => i.name.toLowerCase() === item.name.toLowerCase());
            let newPocket: ItemInstance[];

            if (existingItemIndex > -1) {
                newPocket = [...currentPocket];
                const existingItem = newPocket[existingItemIndex];
                newPocket[existingItemIndex] = { ...existingItem, quantity: existingItem.quantity + 1 };
            } else {
                newPocket = [...currentPocket, {
                    id: `${item.name.replace(/\s+/g, '-')}-${Date.now()}`,
                    name: item.name,
                    quantity: 1,
                    description: item.description,
                }];
            }
            return { ...currentTrainerData, [pocketName]: newPocket };
        });
    }, [updateData]);

    const filteredNatures = useMemo(() => {
        const term = natureSearchTerm.toLowerCase();
        if (!term) return NATURES;
        return NATURES.filter(n => 
            n.name.toLowerCase().includes(term) ||
            n.keywords.toLowerCase().includes(term)
        );
    }, [natureSearchTerm]);

    const openNatureModal = useCallback(() => {
        setNatureSearchTerm('');
        setIsNatureModalOpen(true);
    }, []);

    const itemMap = useMemo(() => {
        const map = new Map<string, Item>();
        if (!allItems) return map;

        Object.values(allItems.items).forEach(categoryContent => {
            if (Array.isArray(categoryContent)) {
                categoryContent.forEach(item => map.set(item.name, item));
            } else { // healing_items case
                const sub = categoryContent as HealingItemsSubCategory;
                sub.potions.forEach(item => map.set(item.name, item));
                sub.status_heals.forEach(item => map.set(item.name, item));
            }
        });
        return map;
    }, [allItems]);
    
    const skillLimit = useMemo(() => RANK_SKILL_LIMITS[trainerData.trainerRank], [trainerData.trainerRank]);

    return (
        <>
            <GlobalTooltip tooltipData={tooltipData} />
            <div className="relative w-full max-w-7xl mx-auto p-4 rounded-xl font-pixel animate-fade-in-scale" style={{ backgroundColor: '#E46243' }}>
                <NatureModal
                    isOpen={isNatureModalOpen}
                    onClose={() => setIsNatureModalOpen(false)}
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
                        onAttributeChange={(field, value) => handlePointFieldChange(field, value, { spent: spentAttributePoints, total: totalAttributePoints })}
                        onSkillChange={(field, value) => handlePointFieldChange(field, value, { spent: spentSkillPoints, total: totalSkillPoints })}
                        onAchievementChange={handleAchievementChange}
                        onExtraSkillChange={handleExtraSkillChange}
                        skillLimit={skillLimit}
                        points={{
                            attributes: { spent: spentAttributePoints, total: totalAttributePoints },
                            skills: { spent: spentSkillPoints, total: totalSkillPoints }
                        }}
                        isAttributePoolExhausted={isAttributePoolExhausted}
                        isSkillPoolExhausted={isSkillPoolExhausted}
                    />
                    
                    <TrainerSheetSidebar
                        trainerData={trainerData}
                        onUpdateField={handleFieldChange}
                        onSocialAttributeChange={(field, value) => handlePointFieldChange(field, value, { spent: spentSocialAttributePoints, total: totalSocialAttributePoints })}
                        onOpenItemModal={() => setIsItemModalOpen(true)}
                        canAddItem={!!allItems}
                        itemMap={itemMap}
                        onPocketUpdate={handlePocketUpdate}
                        onItemMouseEnter={onItemMouseEnter}
                        onItemMouseLeave={onItemMouseLeave}
                        points={{
                            social: { spent: spentSocialAttributePoints, total: totalSocialAttributePoints }
                        }}
                        isSocialAttributePoolExhausted={isSocialAttributePoolExhausted}
                    />
                </div>
            </div>
        </>
    );
};

export default TrainerSheet;