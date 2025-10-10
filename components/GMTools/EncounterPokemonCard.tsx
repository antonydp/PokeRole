// components/GMTools/EncounterPokemonCard.tsx

import React, { useState, useCallback } from 'react';
import { TeamMember, Rank, Pokedex, PokemonData } from '../../src/types/index.js';
import { IMAGE_BASE_URL } from '../../src/constants/config.js';
import TypeBadge from '../TypeBadge.js';
import { ChevronDownIcon } from '../Icons.js';
import { RANKS, POKEMON_ATTRIBUTES, POKEMON_SKILLS } from '../../src/constants/gameConstants.js';
import { useUIStore } from '../../src/store/useUIStore.js';
import { useGameDataStore } from '../../src/store/useGameDataStore.js';
import { createInitialSheetData } from '../../src/logic/initializers.js';
import { applyRandomBonusPoints, selectRandomMoves } from '../../src/logic/gm-tools.js';
import { calculatePokemonHP, calculatePokemonWill, calculateInitiative, calculateEvasion, calculateDefSDef, calculateClash } from '../../src/logic/core.js';
import MoveCard from '../PokemonDetail/MoveCard.js';

// A new component to display stats with bonus indicators
const BonusStatDisplay: React.FC<{ label: string; baseValue: number | string; currentValue: number | string }> = ({ label, baseValue, currentValue }) => {
    const base = Number(baseValue);
    const current = Number(currentValue);
    const bonus = current > base ? current - base : 0;

    return (
        <div className="flex justify-between text-sm bg-slate-900/50 px-2 py-1 rounded">
            <span className="font-semibold text-gray-300">{label}:</span>
            <div className="font-bold text-white flex items-center">
                <span>{currentValue}</span>
                {bonus > 0 && (
                    <span className="ml-2 text-green-400 text-xs">(+{bonus})</span>
                )}
            </div>
        </div>
    );
};


const EncounterPokemonCard: React.FC<{ pokemon: TeamMember; onUpdatePokemon: (updatedMember: TeamMember) => void; }> = ({ pokemon, onUpdatePokemon }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedMoves, setExpandedMoves] = useState<Set<number>>(new Set());
    const { pokedexData, sheetData } = pokemon;
    const { unitSettings } = useUIStore();
    const { allMoves } = useGameDataStore();

    const handleToggleMoveExpand = useCallback((index: number) => {
        setExpandedMoves(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    }, []);

    const handleRankChange = useCallback((newRank: Rank) => {
        const baseSheet = createInitialSheetData(pokedexData, unitSettings, newRank);
        const sheetWithBonuses = applyRandomBonusPoints(pokedexData, baseSheet, newRank);
        
        const newMoves = selectRandomMoves(pokedexData, sheetWithBonuses, allMoves);

        const updatedMember: TeamMember = {
            ...pokemon,
            sheetData: {
                ...sheetWithBonuses,
                rank: newRank,
                moves: newMoves,
            },
        };
        onUpdatePokemon(updatedMember);
    }, [pokemon, onUpdatePokemon, pokedexData, unitSettings, allMoves]);

    // Create a flattened list of all skills with their values for easier rendering
    const activeSkills = Object.values(POKEMON_SKILLS)
        .flat()
        .map(skill => ({
            name: skill.name,
            value: sheetData[skill.field as keyof PokemonData] as number
        }))
        .filter(skill => skill.value > 0); // Only show skills with points in them
    
    // Handle the extra skill separately
    if (sheetData.extraSkillValue > 0) {
        activeSkills.push({ name: sheetData.extraSkillName || 'Extra Skill', value: sheetData.extraSkillValue as number });
    }

    return (
        <div className="bg-slate-700 rounded-lg shadow-lg overflow-hidden animate-fade-in-scale">
            <div className="p-3 flex items-center gap-3">
                <img src={`${IMAGE_BASE_URL}${pokedexData.Image}`} alt={pokedexData.Name} className="w-16 h-16 object-contain bg-slate-800 rounded-full" />
                <div className="flex-grow">
                    <h4 className="font-bold text-lg text-white">{pokedexData.Name}</h4>
                    <div className="flex gap-1 mt-1">
                        <TypeBadge type={pokedexData.Type1} />
                        {pokedexData.Type2 && <TypeBadge type={pokedexData.Type2} />}
                    </div>
                </div>
                <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 text-gray-400 hover:text-white">
                    <ChevronDownIcon className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
            </div>

            <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[60vh] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0'}`}>
                <div className="px-3 pb-3 space-y-2">
                    <div>
                        <label htmlFor={`rank-${pokemon.instanceID}`} className="text-xs font-bold text-poke-yellow">Adjust Rank</label>
                        <select 
                            id={`rank-${pokemon.instanceID}`} 
                            value={sheetData.rank} 
                            onChange={e => handleRankChange(e.target.value as Rank)} 
                            className="w-full p-1 bg-slate-800 rounded mt-1"
                        >
                            {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-600">
                        <BonusStatDisplay label="HP" currentValue={sheetData.hp} baseValue={calculatePokemonHP(pokedexData.BaseHP, pokedexData.Vitality, sheetData.rank as Rank)} />
                        <BonusStatDisplay label="Will" currentValue={sheetData.will} baseValue={calculatePokemonWill(pokedexData.Insight, sheetData.rank as Rank)} />
                        <BonusStatDisplay label="Initiative" currentValue={sheetData.initiative} baseValue={calculateInitiative(pokedexData.Dexterity, 0, sheetData.rank as Rank)} />
                        <BonusStatDisplay label="Evasion" currentValue={sheetData.evasionValue} baseValue={calculateEvasion(pokedexData.Dexterity, 0)} />
                        <BonusStatDisplay label="DEF/S.DEF" currentValue={sheetData.defSDef} baseValue={calculateDefSDef(pokedexData.Vitality, pokedexData.Insight, sheetData.rank as Rank)} />
                        <BonusStatDisplay label="Clash" currentValue={sheetData.clashValue} baseValue={calculateClash(pokedexData.Strength, pokedexData.Special, 0)} />
                    </div>
                    
                    <div className="col-span-2 mt-2 pt-2 border-t border-slate-600 grid grid-cols-5 gap-1 text-center">
                        {POKEMON_ATTRIBUTES.map(attr => {
                            const baseValue = pokedexData[attr.field.charAt(0).toUpperCase() + attr.field.slice(1) as keyof Pokedex] as number;
                            const currentValue = sheetData[attr.field as keyof PokemonData] as number;
                            const bonus = currentValue > baseValue ? currentValue - baseValue : 0;
                            return (
                                <div key={attr.field}>
                                    <div className="text-xs text-gray-400">{attr.name.substring(0,3)}</div>
                                    <div className="font-bold">{currentValue}</div>
                                    {bonus > 0 ? <div className="text-xs text-green-400">(+{bonus})</div> : <div className="text-xs text-transparent">--</div>}
                                </div>
                            );
                        })}
                    </div>

                    {activeSkills.length > 0 && (
                         <div className="col-span-2 mt-2 pt-2 border-t border-slate-600">
                            <h5 className="font-bold text-poke-yellow mb-2">Skills</h5>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                {activeSkills.map(skill => (
                                    <div key={skill.name} className="flex justify-between text-sm">
                                        <span className="text-gray-300 capitalize">{skill.name.toLowerCase()}</span>
                                        <span className="font-bold text-white">{skill.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="col-span-2 mt-2 pt-2 border-t border-slate-600">
                        <h5 className="font-bold text-poke-yellow mb-2">Moves</h5>
                        <div className="space-y-2">
                            {sheetData.moves.map((moveId, index) => {
                                const move = moveId ? allMoves[moveId] : null;
                                if (!move) {
                                    return (
                                        <div key={index} className="text-sm bg-slate-800/50 px-2 py-4 rounded text-center text-gray-500 italic border-2 border-dashed border-slate-600">
                                            - Empty Slot -
                                        </div>
                                    );
                                }
                                return (
                                    <MoveCard
                                        key={index}
                                        move={move}
                                        pokemonStats={sheetData}
                                        index={index}
                                        onClear={() => {}} // No-op, we don't clear moves here
                                        isExpanded={expandedMoves.has(index)}
                                        onToggleExpand={() => handleToggleMoveExpand(index)}
                                        showClearButton={false} // Use our new prop to hide the 'X'
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EncounterPokemonCard;