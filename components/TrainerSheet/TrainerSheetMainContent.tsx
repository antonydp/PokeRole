import React from 'react';
import { TrainerData } from '../../types';
import { CoreAttribute, SkillBlock, ExtraSkillBlock, AchievementsBlock } from './Shared';

interface TrainerSheetMainContentProps {
    trainerData: TrainerData;
    onUpdateField: (field: keyof TrainerData, value: any) => void;
    onAchievementChange: (index: number, field: 'text' | 'completed', value: string | boolean) => void;
    onExtraSkillChange: (index: number, field: 'name' | 'value', value: string | number) => void;
}

const TrainerSheetMainContent: React.FC<TrainerSheetMainContentProps> = ({ trainerData, onUpdateField, onAchievementChange, onExtraSkillChange }) => {
    
    const coreAttributes = [
        { name: 'STRENGTH', value: trainerData.strength, field: 'strength' as const },
        { name: 'DEXTERITY', value: trainerData.dexterity, field: 'dexterity' as const },
        { name: 'VITALITY', value: trainerData.vitality, field: 'vitality' as const },
        { name: 'INSIGHT', value: trainerData.insight, field: 'insight' as const },
    ];
    
    const skills = {
        FIGHT: [
            { name: 'BRAWL', value: trainerData.brawl, field: 'brawl' as const },
            { name: 'THROW', value: trainerData.throw, field: 'throw' as const },
            { name: 'EVASION', value: trainerData.evasion, field: 'evasion' as const },
            { name: 'WEAPONS', value: trainerData.weapons, field: 'weapons' as const },
        ],
        SURVIVAL: [
            { name: 'ALERT', value: trainerData.alert, field: 'alert' as const },
            { name: 'ATHLETIC', value: trainerData.athletic, field: 'athletic' as const },
            { name: 'NATURE', value: trainerData.natureSkill, field: 'natureSkill' as const },
            { name: 'STEALTH', value: trainerData.stealth, field: 'stealth' as const },
        ],
        SOCIAL: [
            { name: 'ALLURE', value: trainerData.allure, field: 'allure' as const },
            { name: 'ETIQUETTE', value: trainerData.etiquette, field: 'etiquette' as const },
            { name: 'INTIMIDATE', value: trainerData.intimidate, field: 'intimidate' as const },
            { name: 'PERFORM', value: trainerData.perform, field: 'perform' as const },
        ],
        KNOWLEDGE: [
            { name: 'CRAFTS', value: trainerData.crafts, field: 'crafts' as const },
            { name: 'LORE', value: trainerData.lore, field: 'lore' as const },
            { name: 'MEDICINE', value: trainerData.medicine, field: 'medicine' as const },
            { name: 'SCIENCE', value: trainerData.science, field: 'science' as const },
        ]
    };

    return (
        <div className="lg:col-span-7">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{alignItems: 'start'}}>
                {/* Col 1: Core Attributes */}
                <div className="space-y-4 md:col-span-2">
                    {coreAttributes.map(attr => <CoreAttribute key={attr.name} name={attr.name} value={attr.value} onChange={v => onUpdateField(attr.field, v)} />)}
                </div>

                {/* Col 2: Fight & Survival */}
                <div className="space-y-4">
                    <SkillBlock title="FIGHT" skills={skills.FIGHT} onSkillChange={onUpdateField} />
                    <SkillBlock title="SURVIVAL" skills={skills.SURVIVAL} onSkillChange={onUpdateField} />
                </div>
                
                {/* Col 3: Social, Knowledge, Extra */}
                <div className="space-y-4 md:row-span-2">
                    <SkillBlock title="SOCIAL" skills={skills.SOCIAL} onSkillChange={onUpdateField} />
                    <SkillBlock title="KNOWLEDGE" skills={skills.KNOWLEDGE} onSkillChange={onUpdateField} />
                    <ExtraSkillBlock title="EXTRA" extraSkills={trainerData.extraSkills} onSkillChange={onExtraSkillChange} />
                </div>

                {/* Achievements spanning Col 1 and 2 */}
                <div className="md:col-span-3">
                    <AchievementsBlock achievements={trainerData.achievements} onAchievementChange={onAchievementChange} />
                </div>
            </div>
        </div>
    );
}

export default TrainerSheetMainContent;
