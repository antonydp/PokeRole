import React, { useMemo } from 'react';
import { Pokedex, PokemonData } from '../../src/types/index.js';
import { CurvedSkillBlock, CurvedExtraSkillBlock } from '../shared/CurvedSkillBlock.js';
import { POKEMON_SKILLS } from '../../src/constants/gameConstants.js';
import { LabeledInput } from '../shared/LabeledInput.js';
import { PointsDisplay } from '../shared/Points.js';
import { StatInput } from '../shared/StatInput.js';

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
        FIGHT: POKEMON_SKILLS.FIGHT.map(skill => ({ ...skill, value: pokemonData[skill.field as keyof PokemonData] as number })),
        SURVIVAL: POKEMON_SKILLS.SURVIVAL.map(skill => ({ ...skill, value: pokemonData[skill.field as keyof PokemonData] as number })),
        SOCIAL: POKEMON_SKILLS.SOCIAL.map(skill => ({ ...skill, value: pokemonData[skill.field as keyof PokemonData] as number })),
    };

    return (
        <div className="lg:col-span-5 flex items-stretch gap-3">
            {/* Attributes */}
            <div className="flex-grow flex flex-col justify-between">
                <PointsDisplay label="Attribute Points" spent={points.attributes.spent} total={points.attributes.total} />
                {attributes.map(attr => (
                    <div key={attr.name} className="bg-slate-700/60 rounded-lg p-2">
                        <StatInput
                            label={attr.name}
                            value={attr.value}
                            onIncrement={() => onDataChange(attr.field, attr.value + 1)}
                            onDecrement={() => onDataChange(attr.field, attr.value - 1)}
                            isPoolExhausted={isAttributePoolExhausted}
                            minValue={pokemon[attr.field as keyof Pokedex] as number}
                        />
                    </div>
                ))}
                <div className="flex gap-3 pt-1">
                    <LabeledInput id="size" label="SIZE:" value={pokemonData.size} onChange={v => onDataChange('size', v)} isReadOnly={true} />
                    <LabeledInput id="weight" label="WEIGHT:" value={pokemonData.weight} onChange={v => onDataChange('weight', v)} isReadOnly={true} />
                </div>
            </div>

            {/* Skills */}
            <div className="flex flex-col w-48 flex-shrink-0">
                <PointsDisplay label="Skill Points" spent={points.skills.spent} total={points.skills.total} />
                <div className="flex flex-col flex-grow">
                    <CurvedSkillBlock<PokemonData> title="FIGHT" skills={skills.FIGHT} onSkillChange={onDataChange} skillLimit={skillLimit} isPoolExhausted={isSkillPoolExhausted} position="top" />
                    <CurvedSkillBlock<PokemonData> title="SURVIVAL" skills={skills.SURVIVAL} onSkillChange={onDataChange} skillLimit={skillLimit} isPoolExhausted={isSkillPoolExhausted} position="middle" />
                    <CurvedSkillBlock<PokemonData> title="SOCIAL" skills={skills.SOCIAL} onSkillChange={onDataChange} skillLimit={skillLimit} isPoolExhausted={isSkillPoolExhausted} position="middle" />
                    <CurvedExtraSkillBlock title="EXTRA" extraSkills={[{ name: pokemonData.extraSkillName, value: pokemonData.extraSkillValue }]} onSkillChange={(index, field, value) => onDataChange(field === 'name' ? 'extraSkillName' : 'extraSkillValue', value)} skillLimit={skillLimit} isPoolExhausted={isSkillPoolExhausted} position="bottom" />
                </div>
            </div>
        </div>
    );
};
export default LeftColumn;