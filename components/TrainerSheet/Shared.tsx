import React from 'react';
import { TrainerData } from '../../types';
import { CircleRating } from '../PokemonDetail/Shared';

interface InfoFieldProps {
    label: string;
    value: string;
    field: keyof TrainerData;
    onChange: (field: keyof TrainerData, value: string) => void;
    placeholder?: string;
}

export const InfoField: React.FC<InfoFieldProps> = ({ label, value, field, onChange, placeholder }) => (
    <div>
        <label className="text-white/80 text-[10px] uppercase tracking-wider font-bold font-pixel">{label}</label>
        <input 
            type="text" 
            value={value} 
            onChange={e => onChange(field, e.target.value)} 
            placeholder={placeholder || label}
            className="w-full bg-transparent text-white font-sans text-sm p-0 border-b-2 border-white/20 focus:outline-none focus:border-poke-yellow transition-colors"
            aria-label={label}
        />
    </div>
);

export const PokedexCounter: React.FC<{
    caught: string;
    seen: string;
    onCaughtChange: (value: string) => void;
    onSeenChange: (value: string) => void;
}> = ({ caught, seen, onCaughtChange, onSeenChange }) => {
    return (
        <div 
            className="p-2 rounded-xl border-2 border-black/40 font-pixel w-full max-w-[280px] shadow-lg" 
            style={{ backgroundColor: '#D75249' }}
        >
            <div className="flex items-center gap-2.5 mb-1.5 px-1">
                <div className="w-4 h-4 rounded-full border border-black/40" style={{ backgroundColor: '#00A99D' }}></div>
                <h3 className="text-xs sm:text-sm" style={{ color: '#F5F1DE', textShadow: '1px 1px 0px rgba(0,0,0,0.3)' }}>POKÉMON CAUGHT/SEEN</h3>
            </div>
            <div 
                className="flex items-center justify-center p-1 rounded-md border border-black/40 shadow-inner"
                style={{ backgroundColor: '#F5F1DE' }}
            >
                <input 
                    type="text" 
                    value={caught}
                    onChange={e => onCaughtChange(e.target.value)}
                    className="w-1/2 bg-transparent text-2xl font-sans font-bold text-center text-stone-800 focus:outline-none"
                    aria-label="Pokémon Caught"
                />
                <span className="text-3xl text-stone-500 font-light mx-1 select-none">/</span>
                 <input 
                    type="text" 
                    value={seen}
                    onChange={e => onSeenChange(e.target.value)}
                    className="w-1/2 bg-transparent text-2xl font-sans font-bold text-center text-stone-800 focus:outline-none"
                    aria-label="Pokémon Seen"
                />
            </div>
        </div>
    );
};

export const PointTracker: React.FC<{ label: string; spent: number; total: number; }> = ({ label, spent, total }) => (
    <div className="bg-black/20 text-white font-pixel p-2 rounded-lg text-center border-2 border-black/30 mb-2">
        <span className="text-sm tracking-wider opacity-80">{label}</span>
        <div className={`text-base font-bold mt-1 transition-colors ${spent > total ? 'text-red-500 animate-pulse' : 'text-poke-yellow'}`}>
            {spent} / {total}
        </div>
    </div>
);


export const CoreAttribute: React.FC<{ name: string; value: number; onChange: (v: number) => void; isPoolExhausted?: boolean; }> = ({ name, value, onChange, isPoolExhausted }) => (
    <div className="bg-[#2DB3B3] rounded-2xl p-3 border-4 border-[#3A3A3A] flex flex-col justify-center">
        <div className="flex flex-col items-center gap-2">
            <span className="text-white font-bold text-sm tracking-wider">{name}</span>
            <CircleRating value={value} max={12} onChange={onChange} className="justify-center" circleClassName="w-5 h-5" isPoolExhausted={isPoolExhausted} />
        </div>
    </div>
);

export const SkillBlock: React.FC<{ title: string; skills: { name: string; value: number; field: keyof TrainerData }[]; onSkillChange: (field: keyof TrainerData, value: number) => void; skillLimit: number; isPoolExhausted?: boolean; }> = ({ title, skills, onSkillChange, skillLimit, isPoolExhausted }) => (
    <div className="flex">
        <div className="bg-[#C95649]/90 p-2 flex-grow flex flex-col justify-center gap-y-2 rounded-l-2xl">
            {skills.map(skill => (
                <div key={skill.name} className="flex flex-col items-center">
                    <span className="text-white text-[10px] uppercase font-bold">{skill.name}</span>
                    <CircleRating value={skill.value} max={5} onChange={v => onSkillChange(skill.field, v)} limit={skillLimit} circleClassName="w-3 h-3" className="gap-1.5" isPoolExhausted={isPoolExhausted} />
                </div>
            ))}
        </div>
        <div className="bg-[#B2483D] rounded-r-2xl w-6 flex items-center justify-center text-[#3A3A3A] font-bold font-pixel text-[10px]">
            <span className="transform rotate-90 block whitespace-nowrap tracking-tighter">{title}</span>
        </div>
    </div>
);

export const ExtraSkillBlock: React.FC<{ title: string; extraSkills: { name: string; value: number }[]; onSkillChange: (index: number, field: 'name' | 'value', value: string | number) => void; skillLimit: number; isPoolExhausted?: boolean; }> = ({ title, extraSkills, onSkillChange, skillLimit, isPoolExhausted }) => (
     <div className="flex">
        <div className="bg-[#C95649]/90 p-2 flex-grow flex flex-col justify-center gap-y-2 rounded-l-2xl">
            {extraSkills.map((skill, index) => (
                <div key={index} className="flex flex-col items-center gap-1">
                    <input
                        type="text"
                        placeholder="Extra Skill"
                        value={skill.name}
                        onChange={e => onSkillChange(index, 'name', e.target.value)}
                        className="w-full bg-white rounded-xl px-2 py-0.5 text-black text-xs font-sans border-2 border-[#3A3A3A] placeholder:text-gray-400"
                    />
                    <CircleRating value={skill.value} max={5} onChange={v => onSkillChange(index, 'value', v)} limit={skillLimit} circleClassName="w-3 h-3" className="gap-1.5 justify-center" isPoolExhausted={isPoolExhausted} />
                </div>
            ))}
        </div>
        <div className="bg-[#B2483D] rounded-r-2xl w-6 flex items-center justify-center text-[#3A3A3A] font-bold font-pixel text-[10px]">
            <span className="transform rotate-90 block whitespace-nowrap tracking-tighter">{title}</span>
        </div>
    </div>
);

export const AchievementsBlock: React.FC<{ achievements: { text: string; completed: boolean }[]; onAchievementChange: (index: number, field: 'text' | 'completed', value: string | boolean) => void }> = ({ achievements, onAchievementChange }) => (
    <div className="bg-black/10 rounded-lg p-3 border-4 border-[#3A3A3A]">
        <h3 className="text-center text-white font-bold text-sm tracking-wider mb-2">ACHIEVEMENTS / GOALS</h3>
        <div className="space-y-2">
            {achievements.map((ach, index) => (
                <div key={index} className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={ach.completed}
                        onChange={e => onAchievementChange(index, 'completed', e.target.checked)}
                        className="form-checkbox h-5 w-5 text-poke-blue bg-white border-2 border-[#3A3A3A] rounded focus:ring-poke-blue flex-shrink-0"
                    />
                    <input
                        type="text"
                        value={ach.text}
                        onChange={e => onAchievementChange(index, 'text', e.target.value)}
                        className="w-full bg-white rounded-md px-2 py-1 text-black text-sm font-sans focus:outline-none border-2 border-[#3A3A3A]"
                        placeholder={`Goal ${index + 1}`}
                    />
                </div>
            ))}
        </div>
    </div>
);

export const LabeledTextarea: React.FC<{
    label: string;
    id: string;
    value: string;
    onChange: (value: string) => void;
    rows?: number;
}> = ({ label, id, value, onChange, rows = 3 }) => (
    <div className="bg-white rounded-lg p-2 border-2 border-[#3A3A3A] space-y-1">
        <label htmlFor={id} className="font-pixel text-[10px] tracking-wider uppercase text-[#3A3A3A] font-bold">
            {label}
        </label>
        <textarea
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-transparent text-black font-sans text-sm focus:outline-none w-full p-0 resize-y"
            rows={rows}
        />
    </div>
);