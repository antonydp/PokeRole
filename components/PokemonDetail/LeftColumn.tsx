import React, { useMemo } from 'react';
import { Pokedex, PokemonData } from '../../src/types/index.js';
import { CurvedSkillBlock, CurvedExtraSkillBlock } from '../shared/CurvedSkillBlock.js';
import { AttributeBlock } from '../shared/AttributeBlock.js';
import { POKEMON_SKILLS, POKEMON_ATTRIBUTES } from '../../src/constants/gameConstants.js';
import { LabeledInput } from '../shared/LabeledInput.js';
import { PointsDisplay } from '../shared/Points.js';
import { usePokemonSheetContext } from '../../src/context/PokemonSheetContext.js';

const LeftColumn: React.FC = () => {
    const {
        pokemon,
        pokemonData,
        handleDataChange: onDataChange,
        skillLimit,
        points,
        isAttributePoolExhausted,
        isSkillPoolExhausted
    } = usePokemonSheetContext();
    const championBonus = useMemo(() => pokemonData.rank === 'Champion' ? 2 : 0, [pokemonData.rank]);

    const attributes = POKEMON_ATTRIBUTES.map(attr => ({
        ...attr,
        value: pokemonData[attr.field as keyof PokemonData] as number,
        max: pokemon[`Max${attr.name.charAt(0) + attr.name.slice(1).toLowerCase()}` as keyof Pokedex] as number + championBonus
    }));

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
                <div className="flex flex-col gap-2">
                    {attributes.map(attr => {
                        const baseStatKey = (attr.name.charAt(0) + attr.name.slice(1).toLowerCase()) as keyof Pokedex;
                        const baseValue = pokemon[baseStatKey] as number;
                        return (
                            <AttributeBlock<PokemonData>
                                name={attr.name}
                                value={attr.value}
                                onChange={v => onDataChange(attr.field as keyof PokemonData, v)}
                                isPoolExhausted={isAttributePoolExhausted}
                                max={attr.max}
                                baseValue={baseValue}
                                key={attr.name}
                            />
                        );
                    })}
                </div>
                <div className="flex gap-3 pt-1">
                    <LabeledInput id="size" label="SIZE:" value={pokemonData.size} onChange={v => onDataChange('size', v)} isReadOnly={true} />
                    <LabeledInput id="weight" label="WEIGHT:" value={pokemonData.weight} onChange={v => onDataChange('weight', v)} isReadOnly={true} />
                </div>
            </div>

            {/* Skills */}
            <div className="flex flex-col w-48 flex-shrink-0 gap-3">
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