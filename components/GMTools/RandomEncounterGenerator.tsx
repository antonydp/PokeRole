// components/GMTools/RandomEncounterGenerator.tsx

import React, { useState, useCallback } from 'react';
import { Pokedex, TeamMember, Rank } from '../../src/types/index.js';
import { useGameDataStore } from '../../src/store/useGameDataStore.js';
import { useUIStore } from '../../src/store/useUIStore.js';
import { createInitialSheetData } from '../../src/logic/initializers.js';
// Import BOTH of our new logic functions
import { applyRandomBonusPoints, selectRandomMoves } from '../../src/logic/gm-tools.js';
import { RANKS } from '../../src/constants/gameConstants.js';
import EncounterPokemonCard from './EncounterPokemonCard.js';

const RandomEncounterGenerator: React.FC = () => {
    // ... (state hooks are the same)
    const [numPokemon, setNumPokemon] = useState(1);
    const [rank, setRank] = useState<Rank>('Starter');
    const [type, setType] = useState('');
    const [generatedPokemon, setGeneratedPokemon] = useState<TeamMember[]>([]);

    const { allPokemon, allMoves } = useGameDataStore(); // Get allMoves from the store
    const { unitSettings } = useUIStore();

    const handleGenerate = useCallback(() => {
        // ... (candidate filtering logic is the same)
        let candidates = [...allPokemon];
        if (type) { candidates = candidates.filter(p => p.Type1 === type || p.Type2 === type); }
        candidates = candidates.filter(p => p.RecommendedRank === rank);
        
        if (candidates.length === 0) {
            alert(`No Pokémon found for Rank "${rank}" and Type "${type}". Try different parameters.`);
            return;
        }

        const encounters: TeamMember[] = [];
        for (let i = 0; i < numPokemon; i++) {
            const randomIndex = Math.floor(Math.random() * candidates.length);
            const pokemonData = candidates[randomIndex];

            const baseSheet = createInitialSheetData(pokemonData, unitSettings, rank);
            const sheetWithBonuses = applyRandomBonusPoints(pokemonData, baseSheet, rank);
            
            // NEW: Select moves based on the final stats
            const selectedMoves = selectRandomMoves(pokemonData, sheetWithBonuses, allMoves);

            const encounter: TeamMember = {
                instanceID: crypto.randomUUID(),
                pokedexData: pokemonData,
                sheetData: {
                    ...sheetWithBonuses,
                    moves: selectedMoves, // Add the moves to the sheet
                },
                forms: {},
                currentFormName: null,
            };
            encounters.push(encounter);
        }
        setGeneratedPokemon(encounters);
    }, [allPokemon, allMoves, numPokemon, rank, type, unitSettings]);

    // Function to update a single Pokémon in the list
    const handleUpdatePokemon = useCallback((updatedMember: TeamMember) => {
        setGeneratedPokemon(prev =>
            prev.map(member =>
                member.instanceID === updatedMember.instanceID ? updatedMember : member
            )
        );
    }, []);

    return (
        <div className="max-w-4xl mx-auto">
            {/* ... (The form is the same) ... */}
            <div className="bg-slate-800/50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label htmlFor="num-pokemon" className="block text-sm font-bold text-gray-300 mb-1">Number of Pokémon</label>
                    <input id="num-pokemon" type="number" min="1" max="10" value={numPokemon} onChange={e => setNumPokemon(parseInt(e.target.value, 10))} className="w-full p-2 bg-slate-700 rounded"/>
                </div>
                <div>
                    <label htmlFor="rank" className="block text-sm font-bold text-gray-300 mb-1">Rank</label>
                    <select id="rank" value={rank} onChange={e => setRank(e.target.value as Rank)} className="w-full p-2 bg-slate-700 rounded">
                        {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="type" className="block text-sm font-bold text-gray-300 mb-1">Type (Optional)</label>
                    <input id="type" type="text" placeholder="e.g., Fire" value={type} onChange={e => setType(e.target.value)} className="w-full p-2 bg-slate-700 rounded"/>
                </div>
                <button onClick={handleGenerate} className="bg-poke-yellow text-slate-900 font-bold p-2 rounded-lg hover:bg-yellow-300 transition-colors h-10">
                    Generate Encounter
                </button>
            </div>

            {generatedPokemon.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-2xl font-bold text-white mb-4">Generated Encounter</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {generatedPokemon.map(pokemon => (
                            <EncounterPokemonCard
                                key={pokemon.instanceID}
                                pokemon={pokemon}
                                onUpdatePokemon={handleUpdatePokemon} // Pass the update handler
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RandomEncounterGenerator;