import { useState, useCallback, useMemo } from 'react';
import type { TrainerData, Item, ItemsData, HealingItemsSubCategory, ItemInstance } from '../types/index.js';
import { TooltipData } from '../../components/shared/GlobalTooltip.js';

export function useTrainerSheet(
    trainerData: TrainerData,
    onDataChange: (updaterOrData: ((prev: TrainerData) => TrainerData) | TrainerData) => void,
    allItems: ItemsData | null
) {
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);

    const updateData = useCallback((updater: (prev: TrainerData) => TrainerData) => {
        onDataChange(updater);
    }, [onDataChange]);

    const handleFieldChange = useCallback((field: keyof TrainerData, value: any) => {
        updateData(prev => ({ ...prev, [field]: value }));
    }, [updateData]);

    const handlePointFieldChange = useCallback((
        field: keyof TrainerData,
        newValue: number,
        pool: { spent: number, total: number }
    ) => {
        updateData(prev => {
            const oldValue = (prev[field] as number) || 0;
            const isIncreasing = newValue > oldValue;
            if (isIncreasing && pool.spent >= pool.total) {
                return prev;
            }
            return { ...prev, [field]: newValue };
        });
    }, [updateData]);

    const handleExtraSkillChange = useCallback((index: number, field: 'name' | 'value', value: string | number, spentSkillPoints: number, totalSkillPoints: number) => {
        updateData(prev => {
            if (field === 'value') {
                const oldValue = prev.extraSkills[index]?.value || 0;
                const isIncreasing = (value as number) > oldValue;
                if (isIncreasing && spentSkillPoints >= totalSkillPoints) {
                    return prev;
                }
            }
            const newExtraSkills = [...prev.extraSkills];
            newExtraSkills[index] = { ...newExtraSkills[index], [field]: value };
            return { ...prev, extraSkills: newExtraSkills };
        });
    }, [updateData]);

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

    const handleAddAchievement = useCallback(() => {
        updateData(prev => ({
            ...prev,
            achievements: [...prev.achievements, { text: '', completed: false }]
        }));
    }, [updateData]);

    const handleRemoveAchievement = useCallback((index: number) => {
        updateData(prev => {
            const newAchievements = prev.achievements.filter((_, i) => i !== index);
            return { ...prev, achievements: newAchievements };
        });
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

    const itemMap = useMemo(() => {
        const map = new Map<string, Item>();
        if (!allItems) return map;

        Object.values(allItems.items).forEach(categoryContent => {
            if (Array.isArray(categoryContent)) {
                categoryContent.forEach(item => map.set(item.name, item));
            } else {
                const sub = categoryContent as HealingItemsSubCategory;
                sub.potions.forEach(item => map.set(item.name, item));
                sub.status_heals.forEach(item => map.set(item.name, item));
            }
        });
        return map;
    }, [allItems]);

    return {
        isItemModalOpen,
        setIsItemModalOpen,
        tooltipData,
        setTooltipData,
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
    };
}