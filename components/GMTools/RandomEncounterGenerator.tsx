// components/GMTools/RandomEncounterGenerator.tsx

import React, { useState, useCallback } from 'react';
import { TeamMember, Rank } from '../../src/types/index.js';
import { useGameDataStore } from '../../src/store/useGameDataStore.js';
import { useUIStore } from '../../src/store/useUIStore.js';
import { createInitialSheetData } from '../../src/logic/initializers.js';
import { applyRandomBonusPoints, selectRandomMoves } from '../../src/logic/gm-tools.js';
import { RANKS } from '../../src/constants/gameConstants.js';
import EncounterPokemonCard from './EncounterPokemonCard.js';

const RandomEncounterGenerator: React.FC = () => {
    const [numPokemon, setNumPokemon] = useState(1);
    const [rank, setRank] = useState<Rank>('Starter');
    const [type, setType] = useState('');
    const [generatedPokemon, setGeneratedPokemon] = useState<TeamMember[]>([]);

    const { allPokemon, allMoves } = useGameDataStore();
    const { unitSettings } = useUIStore();

    const handleGenerate = useCallback(() => {
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
            
            const selectedMoves = selectRandomMoves(pokemonData, sheetWithBonuses, allMoves);

            const encounter: TeamMember = {
                instanceID: crypto.randomUUID(),
                pokedexData: pokemonData,
                sheetData: {
                    ...sheetWithBonuses,
                    moves: selectedMoves,
                },
                forms: {},
                currentFormName: null,
            };
            encounters.push(encounter);
        }
        setGeneratedPokemon(encounters);
    }, [allPokemon, allMoves, numPokemon, rank, type, unitSettings]);

    const handleUpdatePokemon = useCallback((updatedMember: TeamMember) => {
        setGeneratedPokemon(prev =>
            prev.map(member =>
                member.instanceID === updatedMember.instanceID ? updatedMember : member
            )
        );
    }, []);

    return (
        <div className="p-4 bg-gray-800 rounded-lg text-white">
            <h2 className="text-2xl font-bold mb-4 text-center md:text-left">Random Encounter Generator</h2>
            <div className="flex flex-col md:flex-row gap-6">
                {/* Control Panel */}
                <div className="bg-slate-800/50 p-4 rounded-lg md:w-80 flex flex-col gap-4 self-start">
                    <h3 className="text-xl font-semibold border-b border-gray-600 pb-2 mb-2">Controls</h3>
                    
                    <div>
                        <label htmlFor="num-pokemon" className="block text-sm font-bold text-gray-300 mb-1">Number of Pokémon</label>
                        <input 
                            id="num-pokemon" 
                            type="number" 
                            min="1" 
                            max="10" 
                            value={numPokemon} 
                            onChange={e => setNumPokemon(parseInt(e.target.value, 10))} 
                            className="w-full p-2 bg-slate-700 rounded"
                        />
                    </div>

                    <div>
                        <label htmlFor="rank" className="block text-sm font-bold text-gray-300 mb-1">Rank</label>
                        <select 
                            id="rank" 
                            value={rank} 
                            onChange={e => setRank(e.target.value as Rank)} 
                            className="w-full p-2 bg-slate-700 rounded"
                        >
                            {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="type" className="block text-sm font-bold text-gray-300 mb-1">Type (Optional)</label>
                        <input 
                            id="type" 
                            type="text" 
                            placeholder="e.g., Fire" 
                            value={type} 
                            onChange={e => setType(e.target.value)} 
                            className="w-full p-2 bg-slate-700 rounded"
                        />
                    </div>

                    <button 
                        onClick={handleGenerate} 
                        className="w-full bg-poke-yellow text-slate-900 font-bold py-3 px-4 rounded-lg hover:bg-yellow-300 transition-colors text-lg mt-4"
                    >
                        Generate Encounter
                    </button>
                </div>

                {/* Encounter Display */}
                <div className="flex-1">
                    {generatedPokemon.length > 0 ? (
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-4">Generated Encounter</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
                                {generatedPokemon.map((pokemon) => (
                                    <EncounterPokemonCard
                                        key={pokemon.instanceID}
                                        pokemon={pokemon}
                                        onUpdatePokemon={handleUpdatePokemon}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full bg-slate-800/50 rounded-lg min-h-[300px]">
                            <div className="text-center text-gray-400">
                                <p className="text-lg">No Pokémon generated yet.</p>
                                <p>Use the controls to create an encounter.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RandomEncounterGenerator;