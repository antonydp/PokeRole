// components/GMTools/NPCTrainerGenerator.tsx

import React, { useState, useCallback } from 'react';
import { Rank, NPCTrainer, Pokedex } from '../../src/types/index.js';
import { useGameDataStore } from '../../src/store/useGameDataStore.js';
import { useUIStore } from '../../src/store/useUIStore.js';
import { generateNPCTrainer, NPCTrainerOptions, regenerateNPCTrainerStats } from '../../src/logic/npc-generator.js';
import { RANKS, SKILLS, TRAINER_ATTRIBUTES } from '../../src/constants/gameConstants.js';
import EncounterPokemonCard from './EncounterPokemonCard.js';
import { PokeballIcon, SparklesIcon, DiceIcon } from '../Icons.js';
import { suggestNPC } from '../../services/aiService.js';
import AIExplanation from '../shared/AIExplanation.js';

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

type GenerationMode = 'random' | 'ai';

const NPCTrainerGenerator: React.FC = () => {
    const [rank, setRank] = useState<Rank>('Starter');
    const [generatedTrainer, setGeneratedTrainer] = useState<NPCTrainer | null>(null);
    const [teamSizeOverride, setTeamSizeOverride] = useState<number | ''>('');
    const [allowLegendaries, setAllowLegendaries] = useState<boolean>(false);
    const [generationMode, setGenerationMode] = useState<GenerationMode>('random');
    const [aiPrompt, setAiPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [aiExplanation, setAiExplanation] = useState<string | null>(null);

    const { allPokemon, allMoves, allSprites } = useGameDataStore();
    const { unitSettings } = useUIStore();

    const handleReloadStats = useCallback(() => {
        if (!generatedTrainer) return;

        const reloadedTrainer = regenerateNPCTrainerStats(
            generatedTrainer,
            allPokemon,
            allMoves,
            unitSettings
        );
        setGeneratedTrainer(reloadedTrainer);
    }, [generatedTrainer, allPokemon, allMoves, unitSettings]);

    const handleGenerate = useCallback(async () => {
        if (allSprites.length === 0) {
            alert("Sprite data is not loaded yet. Please wait a moment and try again.");
            return;
        }
        setIsLoading(true);
        setAiExplanation(null);
        setGeneratedTrainer(null);

        const options: NPCTrainerOptions = {
            teamSize: teamSizeOverride === '' ? undefined : teamSizeOverride,
            allowLegendaries,
        };

        if (generationMode === 'ai') {
            try {
                const response = await suggestNPC(aiPrompt, allPokemon, rank, options);
                const teamPokemon = response.team
                    .map(name => allPokemon.find(p => p.Name === name))
                    .filter((p): p is Pokedex => p !== undefined);

                if (teamPokemon.length > 0) {
                    const finalOptions: NPCTrainerOptions = {
                        ...options,
                        teamSize: teamPokemon.length,
                    };
                    const trainer = generateNPCTrainer(rank, allPokemon, allMoves, allSprites, unitSettings, finalOptions, response.name, teamPokemon);
                    setGeneratedTrainer(trainer);
                    setAiExplanation(response.explanation);
                } else {
                    alert("AI suggestion failed to return valid Pokémon for the team. Please try again.");
                }
            } catch (error) {
                console.error("Error fetching AI suggestion:", error);
                alert("Failed to get AI suggestion. Please check the console for more details.");
            }
        } else {
            const trainer = generateNPCTrainer(rank, allPokemon, allMoves, allSprites, unitSettings, options);
            setGeneratedTrainer(trainer);
        }

        setIsLoading(false);
    }, [rank, allPokemon, allMoves, allSprites, unitSettings, teamSizeOverride, allowLegendaries, generationMode, aiPrompt]);

    return (
        <div className="p-4 bg-gray-900 rounded-lg text-white font-sans">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-poke-yellow tracking-wide">NPC Trainer Generator</h2>
                <p className="text-gray-400">Create unique and challenging opponents for your players.</p>
            </div>

            {/* Controls */}
            <div className="bg-slate-800/60 p-4 rounded-xl mb-6 shadow-lg sticky top-2 z-10 backdrop-blur-sm">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-end gap-4">
                        {/* Generation Mode */}
                        <div className="flex-grow sm:flex-grow-0">
                            <label className="block text-sm font-bold text-gray-300 mb-2">Mode</label>
                            <div className="flex w-full sm:w-auto bg-slate-700 rounded-lg p-1">
                                <button onClick={() => setGenerationMode('random')} className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold rounded-md transition-all ${generationMode === 'random' ? 'bg-poke-yellow text-slate-900' : 'bg-transparent text-gray-300'}`}>
                                    <DiceIcon className="w-5 h-5" /> Random
                                </button>
                                <button onClick={() => setGenerationMode('ai')} className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold rounded-md transition-all ${generationMode === 'ai' ? 'bg-poke-yellow text-slate-900' : 'bg-transparent text-gray-300'}`}>
                                    <SparklesIcon className="w-5 h-5" /> AI
                                </button>
                            </div>
                        </div>

                        {/* Trainer Rank */}
                        <div className="flex-grow sm:flex-grow-0">
                            <label htmlFor="rank" className="block text-sm font-bold text-gray-300 mb-1">Rank</label>
                            <select id="rank" value={rank} onChange={e => setRank(e.target.value as Rank)} className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:ring-poke-yellow focus:border-poke-yellow h-10">
                                {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>

                        {/* Team Size */}
                        <div className="flex-grow sm:flex-grow-0 sm:w-32">
                            <label htmlFor="team-size" className="block text-sm font-bold text-gray-300 mb-1">Team Size</label>
                            <input id="team-size" type="number" min="1" max="6" value={teamSizeOverride} onChange={e => {
                                const val = e.target.value;
                                if (val === '') { setTeamSizeOverride(''); }
                                else { const num = parseInt(val, 10); if (!isNaN(num) && num >= 1 && num <= 6) { setTeamSizeOverride(num); } }
                            }} placeholder="Auto" className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:ring-poke-yellow focus:border-poke-yellow h-10" />
                        </div>

                        {/* Allow Legendaries */}
                        <div className="flex items-center h-10">
                            <input id="allow-legendaries" type="checkbox" checked={allowLegendaries} onChange={e => setAllowLegendaries(e.target.checked)} className="h-5 w-5 rounded bg-slate-700 border-gray-600 text-poke-yellow focus:ring-poke-yellow" />
                            <label htmlFor="allow-legendaries" className="ml-2 text-sm font-bold text-gray-300">Allow Legendaries</label>
                        </div>

                        {/* Generate Button */}
                        <div className="flex-grow">
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading || (generationMode === 'ai' && !aiPrompt.trim())}
                                className="w-full bg-poke-yellow text-slate-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-300 transition-colors text-lg shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-10"
                            >
                                {isLoading ? 'Generating...' : 'Generate'}
                            </button>
                        </div>
                    </div>

                    {/* AI Prompt Textarea */}
                    {generationMode === 'ai' && (
                        <div className="animate-fade-in">
                            <label htmlFor="ai-prompt" className="block text-sm font-bold text-gray-300 mb-1">Trainer Theme/Prompt</label>
                            <textarea id="ai-prompt" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="e.g., 'A veteran dragon tamer' or 'A cheerful chef with food-themed Pokémon'" className="w-full p-2 bg-slate-700 rounded h-20 resize-none border border-slate-600 focus:ring-poke-yellow focus:border-poke-yellow" />
                        </div>
                    )}
                </div>
            </div>

            {/* Display Area */}
            <div className="min-h-[500px] bg-slate-800/50 p-4 rounded-lg shadow-inner">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center text-gray-500">
                        <PokeballIcon className="w-24 h-24 text-slate-700/50 mb-4 animate-spin" />
                        <h3 className="text-2xl font-semibold">Generating with AI...</h3>
                        <p>Please wait a moment.</p>
                    </div>
                ) : generatedTrainer ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                        {/* Left Column: Trainer Info */}
                        <div className="lg:col-span-1 bg-slate-900/40 p-4 rounded-lg flex flex-col items-center text-center">
                            <div className="relative">
                                <img src={generatedTrainer.spriteUrl} alt="Trainer Sprite" className="w-40 h-40 object-contain bg-slate-700/50 rounded-full p-1 mb-4 border-2 border-slate-600" />
                                <span className="absolute bottom-4 -right-2 bg-slate-800 text-poke-yellow font-bold px-2 py-0.5 rounded-md text-sm border border-slate-600">{generatedTrainer.rank}</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <h3 className="text-3xl font-bold text-white">{generatedTrainer.name}</h3>
                                <button onClick={handleReloadStats} title="Reload Stats" className="text-gray-400 hover:text-poke-yellow transition-colors duration-200 p-1 rounded-full hover:bg-slate-700">
                                    <DiceIcon className="w-6 h-6" />
                                </button>
                            </div>
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
                            {aiExplanation && <AIExplanation explanation={aiExplanation} />}
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