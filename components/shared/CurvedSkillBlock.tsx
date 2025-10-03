import React from 'react';
import { CircleRating } from './CircleRating.js';

const positionClasses = {
    top: 'rounded-tl-2xl',
    bottom: 'rounded-bl-2xl',
    middle: '',
    single: 'rounded-l-2xl',
};

// --- CurvedSkillBlock Component ---
interface CurvedSkillBlockProps<T extends Record<string, any>> {
    title: string;
    skills: { name: string; value: number; field: keyof T | string }[];
    onSkillChange: (field: keyof T | string, value: number) => void;
    skillLimit: number;
    isPoolExhausted: boolean;
    position: 'top' | 'bottom' | 'middle' | 'single';
    className?: string;
}

export const CurvedSkillBlock = <T extends Record<string, any>>({ title, skills, onSkillChange, skillLimit, isPoolExhausted, position, className }: CurvedSkillBlockProps<T>) => (
    <div className={`flex flex-grow ${className}`}>
        <div className={`bg-[#C95649]/90 p-2 flex-grow flex flex-col justify-center gap-y-2 ${positionClasses[position]}`}>
            {(skills || []).map(skill => (
                <div key={skill.name} className="flex flex-col items-center">
                    <span className="text-white uppercase font-bold">{skill.name}</span>
                    <CircleRating 
                        value={skill.value} 
                        max={skillLimit} 
                        onChange={(v) => onSkillChange(skill.field, v)} 
                        isPoolExhausted={isPoolExhausted}
                        circleClassName="w-3 h-3" 
                        className="gap-1.5"
                    />
                </div>
            ))}
        </div>
        <div className="bg-[#B2483D] rounded-r-2xl w-6 flex items-center justify-center text-[#3A3A3A] font-bold font-primary text-xs">
            <span className="transform rotate-90 block whitespace-nowrap tracking-tighter">{title}</span>
        </div>
    </div>
);

// --- CurvedExtraSkillBlock Component ---
interface CurvedExtraSkillBlockProps {
    title: string;
    extraSkills: { name: string; value: number }[];
    onSkillChange: (index: number, field: 'name' | 'value', value: string | number) => void;
    skillLimit: number;
    isPoolExhausted: boolean;
    position: 'top' | 'bottom' | 'middle' | 'single';
    className?: string;
}

export const CurvedExtraSkillBlock: React.FC<CurvedExtraSkillBlockProps> = ({ title, extraSkills, onSkillChange, skillLimit, isPoolExhausted, position, className }) => (
    <div className={`flex flex-grow ${className}`}>
        <div className={`bg-[#C95649]/90 p-2 flex-grow flex flex-col justify-center gap-y-2 ${positionClasses[position]}`}>
            {(extraSkills || []).map((skill, index) => (
                <div key={index} className="flex flex-col gap-y-1 items-center w-full">
                    <input
                        type="text"
                        placeholder="Extra Skill"
                        value={skill.name}
                        onChange={e => onSkillChange(index, 'name', e.target.value)}
                        className="w-full bg-white rounded-xl px-2 py-0.5 text-black text-xs font-sans border-2 border-[#3A3A3A] placeholder:text-gray-400"
                    />
                    <CircleRating
                        value={skill.value}
                        max={skillLimit}
                        onChange={(v) => onSkillChange(index, 'value', v)}
                        isPoolExhausted={isPoolExhausted}
                        circleClassName="w-3 h-3"
                        className="gap-1.5"
                    />
                </div>
            ))}
        </div>
        <div className="bg-[#B2483D] rounded-r-2xl w-6 flex items-center justify-center text-[#3A3A3A] font-bold font-primary text-xs">
            <span className="transform rotate-90 block whitespace-nowrap tracking-tighter">{title}</span>
        </div>
    </div>
);