import React, { useMemo } from 'react';
import { Pokedex, PokemonData } from '../../types';
import { CircleRating, LabeledInput, PointTracker } from './Shared';

interface LeftColumnProps {
    pokemon: Pokedex;
    pokemonData: PokemonData;
    onDataChange: (field: keyof PokemonData, value: any) => void;
    skillLimit: number;
    points: {
        attributes: { spent: number; total: number; };
        skills: { spent: number; total: number; };
    };
    isAttributePoolExhausted: boolean;
    isSkillPoolExhausted: boolean;
}

const LeftColumn: React.FC<LeftColumnProps> = ({ pokemon, pokemonData, onDataChange, skillLimit, points, isAttributePoolExhausted, isSkillPoolExhausted }) => {
    const championBonus = useMemo(() => pokemonData.rank === 'Champion' ? 2 : 0, [pokemonData.rank]);

    const attributes = [
        { name: 'STRENGTH', value: pokemonData.strength, field: 'strength' as const, max: pokemon.MaxStrength + championBonus },
        { name: 'DEXTERITY', value: pokemonData.dexterity, field: 'dexterity' as const, max: pokemon.MaxDexterity + championBonus },
        { name: 'VITALITY', value: pokemonData.vitality, field: 'vitality' as const, max: pokemon.MaxVitality + championBonus },
        { name: 'SPECIAL', value: pokemonData.special, field: 'special' as const, max: pokemon.MaxSpecial + championBonus },
        { name: 'INSIGHT', value: pokemonData.insight, field: 'insight' as const, max: pokemon.MaxInsight + championBonus },
    ];

    const skills = {
        FIGHT: [
            { name: 'BRAWL', value: pokemonData.brawl, field: 'brawl' as const },
            { name: 'CHANNEL', value: pokemonData.channel, field: 'channel' as const },
            { name: 'CLASH', value: pokemonData.clash, field: 'clash' as const },
            { name: 'EVASION', value: pokemonData.evasion, field: 'evasion' as const },
        ],
        SURVIVAL: [
            { name: 'ALERT', value: pokemonData.alert, field: 'alert' as const },
            { name: 'ATHLETIC', value: pokemonData.athletic, field: 'athletic' as const },
            { name: 'NATURE', value: pokemonData.nature, field: 'nature' as const },
            { name: 'STEALTH', value: pokemonData.stealth, field: 'stealth' as const },
        ],
        SOCIAL: [
            { name: 'ALLURE', value: pokemonData.allure, field: 'allure' as const },
            { name: 'ETIQUETTE', value: pokemonData.etiquette, field: 'etiquette' as const },
            { name: 'INTIMIDATE', value: pokemonData.intimidate, field: 'intimidate' as const },
            { name: 'PERFORM', value: pokemonData.perform, field: 'perform' as const },
        ],
    };

    return (
        <div className="lg:col-span-5 flex items-stretch gap-3">
            {/* Attributes */}
            <div className="flex-grow flex flex-col justify-between">
                <PointTracker label="Attribute Points" spent={points.attributes.spent} total={points.attributes.total} />
                {attributes.map(attr => (
                    <div key={attr.name} className="bg-[#2DB3B3] rounded-2xl p-3 border-4 border-[#3A3A3A]">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-white font-bold text-sm tracking-wider">{attr.name}</span>
                            <CircleRating
                                value={attr.value}
                                max={attr.max}
                                onChange={(value) => onDataChange(attr.field, value)}
                                isPoolExhausted={isAttributePoolExhausted}
                                className="justify-center"
                                circleClassName="w-5 h-5"
                            />
                        </div>
                    </div>
                ))}
                <div className="flex gap-3 pt-1">
                    <LabeledInput id="size" label="SIZE:" value={pokemonData.size} onChange={v => onDataChange('size', v)} isReadOnly={true} />
                    <LabeledInput id="weight" label="WEIGHT:" value={pokemonData.weight} onChange={v => onDataChange('weight', v)} isReadOnly={true} />
                </div>
            </div>

            {/* Skills */}
            <div className="flex flex-col w-48 flex-shrink-0">
                <PointTracker label="Skill Points" spent={points.skills.spent} total={points.skills.total} />
                {/* FIGHT */}
                <div className="flex flex-grow">
                    <div className="bg-[#C95649]/90 p-2 flex-grow flex flex-col justify-center gap-y-2 rounded-tl-2xl">
                        {skills.FIGHT.map(skill => (
                            <div key={skill.name} className="flex flex-col items-center">
                                <span className="text-white text-[10px] uppercase font-bold">{skill.name}</span>
                                <CircleRating value={skill.value} max={5} onChange={(v) => onDataChange(skill.field, v)} limit={skillLimit} isPoolExhausted={isSkillPoolExhausted} circleClassName="w-3 h-3" className="gap-1.5" />
                            </div>
                        ))}
                    </div>
                    <div className="bg-[#B2483D] rounded-r-2xl w-6 flex items-center justify-center text-[#3A3A3A] font-bold font-pixel text-xs">
                        <span className="transform rotate-90 block whitespace-nowrap tracking-tighter">FIGHT</span>
                    </div>
                </div>
                {/* SURVIVAL */}
                <div className="flex flex-grow">
                    <div className="bg-[#C95649]/90 p-2 flex-grow flex flex-col justify-center gap-y-2">
                        {skills.SURVIVAL.map(skill => (
                            <div key={skill.name} className="flex flex-col items-center">
                                <span className="text-white text-[10px] uppercase font-bold">{skill.name}</span>
                                <CircleRating value={skill.value} max={5} onChange={(v) => onDataChange(skill.field, v)} limit={skillLimit} isPoolExhausted={isSkillPoolExhausted} circleClassName="w-3 h-3" className="gap-1.5" />
                            </div>
                        ))}
                    </div>
                    <div className="bg-[#B2483D] rounded-r-2xl w-6 flex items-center justify-center text-[#3A3A3A] font-bold font-pixel text-xs">
                        <span className="transform rotate-90 block whitespace-nowrap tracking-tighter">SURVIVAL</span>
                    </div>
                </div>
                {/* SOCIAL */}
                <div className="flex flex-grow">
                    <div className="bg-[#C95649]/90 p-2 flex-grow flex flex-col justify-center gap-y-2">
                        {skills.SOCIAL.map(skill => (
                            <div key={skill.name} className="flex flex-col items-center">
                                <span className="text-white text-[10px] uppercase font-bold">{skill.name}</span>
                                <CircleRating value={skill.value} max={5} onChange={(v) => onDataChange(skill.field, v)} limit={skillLimit} isPoolExhausted={isSkillPoolExhausted} circleClassName="w-3 h-3" className="gap-1.5" />
                            </div>
                        ))}
                    </div>
                    <div className="bg-[#B2483D] rounded-r-2xl w-6 flex items-center justify-center text-[#3A3A3A] font-bold font-pixel text-xs">
                        <span className="transform rotate-90 block whitespace-nowrap tracking-tighter">SOCIAL</span>
                    </div>
                </div>
                {/* EXTRA */}
                <div className="flex flex-grow">
                    <div className="bg-[#C95649]/90 p-2 flex-grow flex flex-col justify-center gap-1 rounded-bl-2xl">
                        <input
                            type="text"
                            placeholder="Extra Skill"
                            value={pokemonData.extraSkillName}
                            onChange={e => onDataChange('extraSkillName', e.target.value)}
                            className="w-full bg-white rounded-xl px-2 py-0.5 text-black text-xs font-sans border-2 border-[#3A3A3A] placeholder:text-gray-400" />
                        <CircleRating
                            value={pokemonData.extraSkillValue}
                            max={5}
                            onChange={(v) => onDataChange('extraSkillValue', v)}
                            limit={skillLimit}
                            isPoolExhausted={isSkillPoolExhausted}
                            circleClassName="w-3 h-3"
                            className="justify-center gap-1.5" />
                    </div>
                    <div className="bg-[#B2483D] rounded-r-2xl w-6 flex items-center justify-center text-[#3A3A3A] font-bold font-pixel text-xs">
                        <span className="transform rotate-90 scale-[0.6] block whitespace-nowrap tracking-tighter">EXTRA</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default LeftColumn;