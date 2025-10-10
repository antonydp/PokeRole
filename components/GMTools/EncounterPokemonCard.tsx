// components/GMTools/EncounterPokemonCard.tsx

import React, { useState, useCallback } from 'react';
import { TeamMember, Rank, Pokedex, PokemonData } from '../../src/types/index.js';
import { IMAGE_BASE_URL } from '../../src/constants/config.js';
import TypeBadge from '../TypeBadge.js';
import { ChevronDownIcon } from '../Icons.js';
import { RANKS, POKEMON_ATTRIBUTES } from '../../src/constants/gameConstants.js';
import { useUIStore } from '../../src/store/useUIStore.js';
import { useGameDataStore } from '../../src/store/useGameDataStore.js'; // Import the store hook
import { createInitialSheetData } from '../../src/logic/initializers.js';
import { applyRandomBonusPoints, selectRandomMoves } from '../../src/logic/gm-tools.js'; // Import move selector
import { calculatePokemonHP, calculatePokemonWill, calculateInitiative, calculateEvasion, calculateDefSDef, calculateClash } from '../../src/logic/core.js';

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
    const { pokedexData, sheetData } = pokemon;
    const { unitSettings } = useUIStore();
    const { allMoves } = useGameDataStore(); // Get allMoves for display and recalculation

    const handleRankChange = useCallback((newRank: Rank) => {
        const baseSheet = createInitialSheetData(pokedexData, unitSettings, newRank);
        const sheetWithBonuses = applyRandomBonusPoints(pokedexData, baseSheet, newRank);
        
        // NEW: Also recalculate moves
        const newMoves = selectRandomMoves(pokedexData, sheetWithBonuses, allMoves);

        const updatedMember: TeamMember = {
            ...pokemon,
            sheetData: {
                ...sheetWithBonuses,
                rank: newRank,
                moves: newMoves, // Set the new moves
            },
        };
        onUpdatePokemon(updatedMember);
    }, [pokemon, onUpdatePokemon, pokedexData, unitSettings, allMoves]);

    return (
        <div className="bg-slate-700 rounded-lg shadow-lg overflow-hidden animate-fade-in-scale">
            {/* ... (Header section is the same) ... */}
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

            <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-3 pb-3 space-y-2">
                    {/* ... (Rank selector and stats sections are the same) ... */}
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
                    
                    {/* NEW: Moves Display Section */}
                    <div className="col-span-2 mt-2 pt-2 border-t border-slate-600">
                        <h5 className="font-bold text-poke-yellow mb-2">Moves</h5>
                        <div className="space-y-1">
                            {sheetData.moves.map((moveId, index) => {
                                const move = moveId ? allMoves[moveId] : null;
                                if (!move) {
                                    return (
                                        <div key={index} className="text-sm bg-slate-800/50 px-2 py-1 rounded text-gray-500 italic">
                                            - Empty Slot -
                                        </div>
                                    );
                                }
                                return (
                                    <div key={index} className="flex justify-between items-center text-sm bg-slate-800/50 px-2 py-1 rounded">
                                        <span className="font-semibold text-gray-200">{move.Name}</span>
                                        <TypeBadge type={move.Type} />
                                    </div>
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