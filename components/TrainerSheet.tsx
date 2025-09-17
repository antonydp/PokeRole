import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { TrainerData, Nature, ItemsData, Item, HealingItemsSubCategory, ItemInstance } from '../types';
import NatureModal from './PokemonDetail/NatureModal';
import { NATURES } from '../../constants';
import TrainerSheetHeader from './TrainerSheet/TrainerSheetHeader';
import TrainerSheetMainContent from './TrainerSheet/TrainerSheetMainContent';
import TrainerSheetSidebar from './TrainerSheet/TrainerSheetSidebar';
import ItemModal from './TrainerSheet/ItemModal';

interface TrainerSheetProps {
    trainerData: TrainerData;
    onDataChange: (updaterOrData: ((prev: TrainerData) => TrainerData) | TrainerData) => void;
    allItems: ItemsData | null;
}

interface TooltipData {
    content: { name: string; description: string };
    rect: DOMRect;
}

const GlobalTooltip: React.FC<{ tooltipData: TooltipData | null }> = ({ tooltipData }) => {
    // This state will help manage the mounting/unmounting for transitions.
    const [currentTooltipData, setCurrentTooltipData] = useState<TooltipData | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let animationFrameId: number;
        let timeoutId: ReturnType<typeof setTimeout>;

        if (tooltipData) {
            // If new data comes in, update it and start fade-in
            setCurrentTooltipData(tooltipData);
            // requestAnimationFrame ensures the element is mounted before we try to transition its opacity
            animationFrameId = requestAnimationFrame(() => {
                setIsVisible(true);
            });
        } else {
            // If data is null, start fade-out
            setIsVisible(false);
            // Wait for transition to finish before unmounting
            timeoutId = setTimeout(() => {
                setCurrentTooltipData(null);
            }, 150); // Should match transition duration
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
    
    if (!currentTooltipData) return null; // Only render if we have data

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


const TrainerSheet: React.FC<TrainerSheetProps> = ({ trainerData, onDataChange, allItems }) => {
    const [isNatureModalOpen, setIsNatureModalOpen] = useState(false);
    const [natureSearchTerm, setNatureSearchTerm] = useState('');
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
    
    const updateField = useCallback((field: keyof TrainerData, value: any) => {
        onDataChange({ ...trainerData, [field]: value });
    }, [trainerData, onDataChange]);

    const handlePocketUpdate = useCallback((pocket: 'smallPocket' | 'mainPocket', updatedPocket: ItemInstance[]) => {
        onDataChange({ ...trainerData, [pocket]: updatedPocket });
    }, [trainerData, onDataChange]);
    
    const onItemMouseEnter = useCallback((content: { name: string; description: string }, element: HTMLElement) => {
        setTooltipData({ content, rect: element.getBoundingClientRect() });
    }, []);

    const onItemMouseLeave = useCallback(() => {
        setTooltipData(null);
    }, []);

    const handleAchievementChange = useCallback((index: number, field: 'text' | 'completed', value: string | boolean) => {
        const newAchievements = [...trainerData.achievements];
        newAchievements[index] = { ...newAchievements[index], [field]: value };
        updateField('achievements', newAchievements);
    }, [trainerData.achievements, updateField]);

    const handleExtraSkillChange = useCallback((index: number, field: 'name' | 'value', value: string | number) => {
        const newExtraSkills = [...trainerData.extraSkills];
        newExtraSkills[index] = { ...newExtraSkills[index], [field]: value };
        updateField('extraSkills', newExtraSkills);
    }, [trainerData.extraSkills, updateField]);

    const handleSelectNature = useCallback((nature: Nature) => {
        onDataChange({
            ...trainerData,
            nature: nature.name,
            confidence: String(nature.confidence),
        });
        setIsNatureModalOpen(false);
    }, [trainerData, onDataChange]);

    const handleAddItem = useCallback((item: Item) => {
        const pocketName = item.usable_in_battle ? 'smallPocket' : 'mainPocket';

        onDataChange((currentTrainerData: TrainerData) => {
            const currentPocket: ItemInstance[] = currentTrainerData[pocketName] || [];
            const existingItemIndex = currentPocket.findIndex(i => i.name.toLowerCase() === item.name.toLowerCase());
            
            let newPocket: ItemInstance[];

            if (existingItemIndex > -1) {
                // Increment quantity of existing item
                newPocket = [...currentPocket];
                const existingItem = newPocket[existingItemIndex];
                newPocket[existingItemIndex] = { ...existingItem, quantity: existingItem.quantity + 1 };
            } else {
                // Add new item instance
                newPocket = [...currentPocket, {
                    id: `${item.name.replace(/\s+/g, '-')}-${Date.now()}`,
                    name: item.name,
                    quantity: 1,
                    description: item.description, // Pass the description
                }];
            }
            
            return { ...currentTrainerData, [pocketName]: newPocket };
        });
    }, [onDataChange]);

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
                    onUpdateField={updateField}
                    onOpenNatureModal={openNatureModal}
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <TrainerSheetMainContent
                        trainerData={trainerData}
                        onUpdateField={updateField}
                        onAchievementChange={handleAchievementChange}
                        onExtraSkillChange={handleExtraSkillChange}
                    />
                    
                    <TrainerSheetSidebar
                        trainerData={trainerData}
                        onUpdateField={updateField}
                        onOpenItemModal={() => setIsItemModalOpen(true)}
                        canAddItem={!!allItems}
                        itemMap={itemMap}
                        onPocketUpdate={handlePocketUpdate}
                        onItemMouseEnter={onItemMouseEnter}
                        onItemMouseLeave={onItemMouseLeave}
                    />
                </div>
            </div>
        </>
    );
};

export default TrainerSheet;
