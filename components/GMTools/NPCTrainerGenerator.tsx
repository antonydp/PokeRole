// components/GMTools/NPCTrainerGenerator.tsx

import React, { useState, useCallback } from 'react';
import { Rank, NPCTrainer } from '../../src/types/index.js';
import { useGameDataStore } from '../../src/store/useGameDataStore.js';
import { useUIStore } from '../../src/store/useUIStore.js';
import { generateNPCTrainer, NPCTrainerOptions } from '../../src/logic/npc-generator.js';
import { RANKS, SKILLS, TRAINER_ATTRIBUTES } from '../../src/constants/gameConstants.js';
import EncounterPokemonCard from './EncounterPokemonCard.js';
import { PokeballIcon } from '../Icons.js';

const StatDisplay: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div className="bg-slate-900/50 p-2 rounded-lg text-center shadow-inner w-full">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</div>
        <div className="text-3xl font-bold text-white mt-1">{value}</div>
    </div>
);

const SkillDisplay: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div className="flex items-center justify-between bg-slate-700/60 px-3 py-1.5 rounded-lg shadow-sm text-white">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="font-bold text-lg bg-slate-900/50 rounded-full h-7 w-7 flex items-center justify-center">{value}</span>
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
        <div className="p-4 bg-gray-900 rounded-lg text-white font-sans">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-poke-yellow tracking-wide">NPC Trainer Generator</h2>
                <p className="text-gray-400">Create unique and challenging opponents for your players.</p>
            </div>

            {/* Controls */}
            <div className="bg-slate-800/60 p-4 rounded-xl mb-6 shadow-lg sticky top-2 z-10 backdrop-blur-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label htmlFor="rank" className="block text-sm font-bold text-gray-300 mb-1">Trainer Rank</label>
                        <select
                            id="rank"
                            value={rank}
                            onChange={e => setRank(e.target.value as Rank)}
                            className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:ring-poke-yellow focus:border-poke-yellow"
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
                            className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:ring-poke-yellow focus:border-poke-yellow"
                        />
                    </div>

                    <div className="flex items-center justify-center h-full pb-2">
                        <input
                            id="allow-legendaries"
                            type="checkbox"
                            checked={allowLegendaries}
                            onChange={e => setAllowLegendaries(e.target.checked)}
                            className="h-5 w-5 rounded bg-slate-700 border-gray-600 text-poke-yellow focus:ring-poke-yellow"
                        />
                        <label htmlFor="allow-legendaries" className="ml-2 text-sm font-bold text-gray-300">Allow Legendaries</label>
                    </div>

                    <button
                        onClick={handleGenerate}
                        className="w-full bg-poke-yellow text-slate-900 font-bold py-2.5 px-4 rounded-lg hover:bg-yellow-300 transition-colors text-lg shadow-md"
                    >
                        Generate
                    </button>
                </div>
            </div>

            {/* Display Area */}
            <div className="min-h-[500px] bg-slate-800/50 p-4 rounded-lg shadow-inner">
                {generatedTrainer ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                        {/* Left Column: Trainer Info */}
                        <div className="lg:col-span-1 bg-slate-900/40 p-4 rounded-lg flex flex-col items-center text-center">
                            <div className="relative">
                                <img
                                    src={generatedTrainer.spriteUrl}
                                    alt="Trainer Sprite"
                                    className="w-40 h-40 object-contain bg-slate-700/50 rounded-full p-1 mb-4 border-2 border-slate-600"
                                />
                                <span className="absolute bottom-4 -right-2 bg-slate-800 text-poke-yellow font-bold px-2 py-0.5 rounded-md text-sm border border-slate-600">{generatedTrainer.rank}</span>
                            </div>
                            <h3 className="text-3xl font-bold text-white">{generatedTrainer.name}</h3>
                            
                            <div className="w-full border-t border-slate-700 my-4"></div>

                            <h4 className="text-xl font-bold text-poke-yellow mb-3">Attributes</h4>
                            <div className="grid grid-cols-2 gap-2 w-full">
                                {TRAINER_ATTRIBUTES.map(attr => (
                                    <StatDisplay key={attr.field} label={attr.name} value={generatedTrainer[attr.field as keyof NPCTrainer] as number} />
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Skills & Team */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-slate-900/40 p-4 rounded-lg">
                                <h4 className="text-xl font-bold text-poke-yellow mb-3 text-center">Skills</h4>
                                <div className="flex flex-wrap justify-center gap-x-6 gap-y-4">
                                    {Object.entries(SKILLS).map(([category, skills]) => (
                                        <div key={category} className="space-y-2 flex-shrink-0">
                                            <h5 className="text-center font-semibold text-gray-300 capitalize">{category}</h5>
                                            {skills.map(skill => (
                                                <SkillDisplay key={skill.field} label={skill.name} value={generatedTrainer[skill.field as keyof NPCTrainer] as number} />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-900/40 p-4 rounded-lg">
                                <h4 className="text-xl font-bold text-poke-yellow mb-3">Pokémon Team ({generatedTrainer.team.length})</h4>
                                <div className="space-y-4">
                                    {generatedTrainer.team.map((pokemon, index) => (
                                        <EncounterPokemonCard
                                            key={`${pokemon.pokedexData.DexID}-${index}`}
                                            pokemon={{
                                                instanceID: `${pokemon.pokedexData.DexID}-${index}`,
                                                pokedexData: pokemon.pokedexData,
                                                sheetData: pokemon.sheetData,
                                                forms: {},
                                                currentFormName: null,
                                            }}
                                            onUpdatePokemon={() => {}}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center text-gray-500">
                        <PokeballIcon className="w-24 h-24 text-slate-700/50 mb-4" />
                        <h3 className="text-2xl font-semibold">Generator Ready</h3>
                        <p>Adjust the settings above and click 'Generate' to create a new NPC trainer.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NPCTrainerGenerator;