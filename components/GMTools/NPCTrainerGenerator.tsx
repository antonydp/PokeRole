// components/GMTools/NPCTrainerGenerator.tsx

import React, { useState, useCallback } from 'react';
import { Rank, NPCTrainer } from '../../src/types/index.js';
import { useGameDataStore } from '../../src/store/useGameDataStore.js';
import { useUIStore } from '../../src/store/useUIStore.js';
import { generateNPCTrainer, NPCTrainerOptions } from '../../src/logic/npc-generator.js';
import { RANKS, SKILLS, TRAINER_ATTRIBUTES } from '../../src/constants/gameConstants.js';
import EncounterPokemonCard from './EncounterPokemonCard.js'; // We can reuse this!

const StatDisplay: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div className="flex justify-between items-center bg-slate-700/50 p-2 rounded">
        <span className="font-semibold text-sm text-gray-300">{label}</span>
        <span className="font-bold text-lg text-white">{value}</span>
    </div>
);

const NPCTrainerGenerator: React.FC = () => {
    const [rank, setRank] = useState<Rank>('Starter');
    const [generatedTrainer, setGeneratedTrainer] = useState<NPCTrainer | null>(null);
    const [teamSizeOverride, setTeamSizeOverride] = useState<number | ''>('');
    const [allowLegendaries, setAllowLegendaries] = useState<boolean>(false);

    const { allPokemon, allMoves, allSprites } = useGameDataStore();
    const { unitSettings } = useUIStore();

    const handleGenerate = useCallback(() => {
        if (allSprites.length === 0) {
            alert("Sprite data is not loaded yet. Please wait a moment and try again.");
            return;
        }
        const options: NPCTrainerOptions = {
            teamSize: teamSizeOverride === '' ? undefined : teamSizeOverride,
            allowLegendaries,
        };
        const trainer = generateNPCTrainer(rank, allPokemon, allMoves, allSprites, unitSettings, options);
        setGeneratedTrainer(trainer);
    }, [rank, allPokemon, allMoves, allSprites, unitSettings, teamSizeOverride, allowLegendaries]);

    return (
        <div className="p-4 bg-gray-800 rounded-lg text-white">
            <h2 className="text-2xl font-bold mb-4 text-center md:text-left">NPC Trainer Generator</h2>
            <div className="flex flex-col md:flex-row gap-6">
                {/* Control Panel */}
                <div className="bg-slate-800/50 p-4 rounded-lg md:w-64 flex flex-col gap-4 self-start">
                    <h3 className="text-xl font-semibold border-b border-gray-600 pb-2 mb-2">Controls</h3>
                    
                    <div>
                        <label htmlFor="rank" className="block text-sm font-bold text-gray-300 mb-1">Trainer Rank</label>
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
                        <label htmlFor="team-size" className="block text-sm font-bold text-gray-300 mb-1">Team Size (1-6)</label>
                        <input
                            id="team-size"
                            type="number"
                            min="1"
                            max="6"
                            value={teamSizeOverride}
                            onChange={e => {
                                const val = e.target.value;
                                if (val === '') {
                                    setTeamSizeOverride('');
                                } else {
                                    const num = parseInt(val, 10);
                                    if (!isNaN(num) && num >= 1 && num <= 6) {
                                        setTeamSizeOverride(num);
                                    }
                                }
                            }}
                            placeholder="Auto (Rank-based)"
                            className="w-full p-2 bg-slate-700 rounded"
                        />
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                        <input
                            id="allow-legendaries"
                            type="checkbox"
                            checked={allowLegendaries}
                            onChange={e => setAllowLegendaries(e.target.checked)}
                            className="h-4 w-4 rounded bg-slate-700 border-gray-600 text-poke-yellow focus:ring-poke-yellow"
                        />
                        <label htmlFor="allow-legendaries" className="text-sm font-bold text-gray-300">Allow Legendaries</label>
                    </div>

                    <button
                        onClick={handleGenerate}
                        className="w-full bg-poke-yellow text-slate-900 font-bold py-3 px-4 rounded-lg hover:bg-yellow-300 transition-colors text-lg mt-4"
                    >
                        Generate NPC Trainer
                    </button>
                </div>

                {/* Trainer Display */}
                <div className="flex-1">
                    {generatedTrainer ? (
                        <div className="flex flex-col xl:flex-row gap-6">
                            {/* Left Column: Info & Stats */}
                            <div className="xl:w-1/3">
                                <h3 className="text-2xl font-bold text-white mb-4">Generated Trainer</h3>
                                <div className="bg-slate-800/50 p-4 rounded-lg mb-4 flex items-center gap-4">
                                    <img src={generatedTrainer.spriteUrl} alt="Trainer Sprite" className="w-24 h-24 object-contain bg-slate-700 rounded-full p-1" />
                                    <div>
                                        <p className="text-2xl font-bold text-poke-yellow">{generatedTrainer.name}</p>
                                        <p className="text-lg text-gray-300">Rank: {generatedTrainer.rank}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <h4 className="col-span-2 text-xl font-bold text-white mb-1">Attributes</h4>
                                    {TRAINER_ATTRIBUTES.map(attr => (
                                        <StatDisplay key={attr.field} label={attr.name} value={generatedTrainer[attr.field as keyof NPCTrainer] as number} />
                                    ))}
                                    
                                    <h4 className="col-span-2 text-xl font-bold text-white mt-4 mb-1">Skills</h4>
                                    {Object.entries(SKILLS).map(([category, skills]) => (
                                        <div key={category} className="col-span-2 grid grid-cols-2 gap-2">
                                            {/* <h5 className="col-span-2 text-md font-semibold text-poke-yellow mt-2">{category}</h5> */}
                                            {skills.map(skill => (
                                                 <StatDisplay key={skill.field} label={skill.name} value={generatedTrainer[skill.field as keyof NPCTrainer] as number} />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Column: Team */}
                            <div className="xl:w-2/3">
                                <h3 className="text-2xl font-bold text-white mb-4">Pokémon Team</h3>
                                <div className="space-y-4">
                                    {generatedTrainer.team.map((pokemon) => (
                                        <EncounterPokemonCard
                                            key={pokemon.pokedexData.DexID}
                                            pokemon={{
                                                instanceID: pokemon.pokedexData.DexID, // Simple key for display
                                                pokedexData: pokemon.pokedexData,
                                                sheetData: pokemon.sheetData,
                                                forms: {},
                                                currentFormName: null,
                                            }}
                                            onUpdatePokemon={() => {}} // Read-only, no updates needed
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full bg-slate-800/50 rounded-lg min-h-[300px]">
                            <div className="text-center text-gray-400">
                                <p className="text-lg">No trainer generated yet.</p>
                                <p>Use the controls to create an NPC trainer.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NPCTrainerGenerator;