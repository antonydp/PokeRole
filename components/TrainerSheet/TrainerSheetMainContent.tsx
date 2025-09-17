import React from 'react';
import { TrainerData } from '../../types';
import { CoreAttribute, SkillBlock, ExtraSkillBlock, AchievementsBlock, PointTracker } from './Shared';

interface TrainerSheetMainContentProps {
    trainerData: TrainerData;
    onAttributeChange: (field: keyof TrainerData, value: number) => void;
    onSkillChange: (field: keyof TrainerData, value: number) => void;
    onAchievementChange: (index: number, field: 'text' | 'completed', value: string | boolean) => void;
    onExtraSkillChange: (index: number, field: 'name' | 'value', value: string | number) => void;
    skillLimit: number;
    points: {
        attributes: { spent: number; total: number; };
        skills: { spent: number; total: number; };
    };
    isAttributePoolExhausted: boolean;
    isSkillPoolExhausted: boolean;
}

const TrainerSheetMainContent: React.FC<TrainerSheetMainContentProps> = ({ 
    trainerData, 
    onAttributeChange, 
    onSkillChange, 
    onAchievementChange, 
    onExtraSkillChange, 
    skillLimit,
    points,
    isAttributePoolExhausted,
    isSkillPoolExhausted
}) => {
    
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
                {/* Col 1 & 2: Core Attributes & Achievements */}
                <div className="md:col-span-2 space-y-4">
                    <PointTracker label="Attribute Points" spent={points.attributes.spent} total={points.attributes.total} />
                    <div className="space-y-4">
                        {coreAttributes.map(attr => <CoreAttribute key={attr.name} name={attr.name} value={attr.value} onChange={v => onAttributeChange(attr.field, v)} isPoolExhausted={isAttributePoolExhausted} />)}
                    </div>
                     <AchievementsBlock achievements={trainerData.achievements} onAchievementChange={onAchievementChange} />
                </div>

                {/* Col 3: Fight & Survival */}
                <div className="space-y-4">
                    <PointTracker label="Skill Points" spent={points.skills.spent} total={points.skills.total} />
                    <SkillBlock title="FIGHT" skills={skills.FIGHT} onSkillChange={onSkillChange} skillLimit={skillLimit} isPoolExhausted={isSkillPoolExhausted} />
                    <SkillBlock title="SURVIVAL" skills={skills.SURVIVAL} onSkillChange={onSkillChange} skillLimit={skillLimit} isPoolExhausted={isSkillPoolExhausted} />
                </div>
                
                {/* Col 4: Social, Knowledge, Extra */}
                <div className="space-y-4">
                    <SkillBlock title="SOCIAL" skills={skills.SOCIAL} onSkillChange={onSkillChange} skillLimit={skillLimit} isPoolExhausted={isSkillPoolExhausted} />
                    <SkillBlock title="KNOWLEDGE" skills={skills.KNOWLEDGE} onSkillChange={onSkillChange} skillLimit={skillLimit} isPoolExhausted={isSkillPoolExhausted} />
                    <ExtraSkillBlock title="EXTRA" extraSkills={trainerData.extraSkills} onSkillChange={onExtraSkillChange} skillLimit={skillLimit} isPoolExhausted={isSkillPoolExhausted} />
                </div>
            </div>
        </div>
    );
}

export default TrainerSheetMainContent;