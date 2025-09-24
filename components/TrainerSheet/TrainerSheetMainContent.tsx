import React from 'react';
import { TrainerData } from '@/src/types/index.js';
import { AchievementsBlock } from './AchievementsBlock.js';
import { CurvedSkillBlock, CurvedExtraSkillBlock } from '../shared/CurvedSkillBlock.js';
import { AttributeBlock } from '../shared/AttributeBlock.js';
import { SKILLS, TRAINER_ATTRIBUTES } from '../../src/constants/gameConstants.js';
import { PointsDisplay } from '../shared/Points.js';

interface TrainerSheetMainContentProps {
    trainerData: TrainerData;
    onAttributeChange: (field: keyof TrainerData, value: number) => void;
    onSkillChange: (field: keyof TrainerData, value: number) => void;
    onAchievementChange: (index: number, field: 'text' | 'completed', value: string | boolean) => void;
    onExtraSkillChange: (index: number, field: 'name' | 'value', value: string | number) => void;
    onAddAchievement: () => void;
    onRemoveAchievement: (index: number) => void;
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
    onAddAchievement,
    onRemoveAchievement,
    skillLimit,
    points,
    isAttributePoolExhausted,
    isSkillPoolExhausted
}) => {
    
    const coreAttributes = TRAINER_ATTRIBUTES.map(attr => ({ ...attr, value: trainerData[attr.field as keyof TrainerData] as number }));
    
    const skills = {
        FIGHT: SKILLS.FIGHT.map(skill => ({ ...skill, value: trainerData[skill.field as keyof TrainerData] as number })),
        SURVIVAL: SKILLS.SURVIVAL.map(skill => ({ ...skill, value: trainerData[skill.field as keyof TrainerData] as number })),
        SOCIAL: SKILLS.SOCIAL.map(skill => ({ ...skill, value: trainerData[skill.field as keyof TrainerData] as number })),
        KNOWLEDGE: SKILLS.KNOWLEDGE.map(skill => ({ ...skill, value: trainerData[skill.field as keyof TrainerData] as number })),
    };

    return (
    // The main container is now a simple vertical stack. 
    // It's responsible for the vertical space between the Points Header and the content below.
    <div className="lg:col-span-7 flex flex-col gap-4">

        {/* ================================================================== */}
        {/* == Section 1: Points Header ====================================== */}
        {/* ================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
                <PointsDisplay label="Attribute Points" spent={points.attributes.spent} total={points.attributes.total} />
            </div>
            <div className="md:col-span-8">
                <PointsDisplay label="Skill Points" spent={points.skills.spent} total={points.skills.total} />
            </div>
        </div>

        {/* ================================================================== */}
        {/* == Section 2: Main Content (now wrapped in a grid container) ===== */}
        {/* ================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            
            {/* -- Left Column (8/12 width) -- */}
            <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Attributes */}
                    <div className="flex flex-col gap-4">
                        {coreAttributes.map(attr => (
                            <AttributeBlock<TrainerData> key={attr.name} name={attr.name} value={attr.value} onChange={v => onAttributeChange(attr.field as keyof TrainerData, v)} isPoolExhausted={isAttributePoolExhausted} max={5} />
                        ))}
                    </div>
                    {/* Fight & Survival */}
                    <div className="flex flex-col">
                        <CurvedSkillBlock<TrainerData> title="FIGHT" skills={skills.FIGHT} onSkillChange={onSkillChange} skillLimit={skillLimit} isPoolExhausted={isSkillPoolExhausted} position="top" />
                        <CurvedSkillBlock<TrainerData> title="SURVIVAL" skills={skills.SURVIVAL} onSkillChange={onSkillChange} skillLimit={skillLimit} isPoolExhausted={isSkillPoolExhausted} position="bottom" />
                    </div>
                </div>
                {/* Achievements */}
                <AchievementsBlock achievements={trainerData.achievements} onAchievementChange={onAchievementChange} onAddAchievement={onAddAchievement} onRemoveAchievement={onRemoveAchievement} />
            </div>
            
            {/* -- Right Column (4/12 width) -- */}
            <div className="lg:col-span-4 flex flex-col">
                <CurvedSkillBlock<TrainerData> title="SOCIAL" skills={skills.SOCIAL} onSkillChange={onSkillChange} skillLimit={skillLimit} isPoolExhausted={isSkillPoolExhausted} position="top" />
                <CurvedSkillBlock<TrainerData> title="KNOWLEDGE" skills={skills.KNOWLEDGE} onSkillChange={onSkillChange} skillLimit={skillLimit} isPoolExhausted={isSkillPoolExhausted} position="middle" />
                <CurvedExtraSkillBlock title="EXTRA" extraSkills={trainerData.extraSkills} onSkillChange={onExtraSkillChange} skillLimit={skillLimit} isPoolExhausted={isSkillPoolExhausted} position="bottom" />
            </div>

        </div>
    </div>
);
}

export default TrainerSheetMainContent;