// components/GMTools/RandomEncounterGenerator.tsx

import React, { useState, useCallback } from 'react';
import { TeamMember, Rank, Pokedex } from '../../src/types/index.js';
import { useGameDataStore } from '../../src/store/useGameDataStore.js';
import { useUIStore } from '../../src/store/useUIStore.js';
import { createInitialSheetData } from '../../src/logic/initializers.js';
import { applyRandomBonusPoints, selectRandomMoves } from '../../src/logic/gm-tools.js';
import { RANKS, TYPE_COLORS } from '../../src/constants/gameConstants.js';
import EncounterPokemonCard from './EncounterPokemonCard.js';
import TypeBadge from '../TypeBadge.js';
import { SparklesIcon, DiceIcon, SaveIcon } from '../Icons.js';
import { suggestEncounter } from '../../services/aiService.js';
import AIExplanation from '../shared/AIExplanation.js';

type GenerationMode = 'random' | 'ai';

const RandomEncounterGenerator: React.FC = () => {
    const [numPokemon, setNumPokemon] = useState(1);
    const [rank, setRank] = useState<Rank | undefined>(undefined);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [isTypePopoverOpen, setIsTypePopoverOpen] = useState(false);
    const [generatedPokemon, setGeneratedPokemon] = useState<TeamMember[]>([]);
    const [generationMode, setGenerationMode] = useState<GenerationMode>('random');
    const [aiPrompt, setAiPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [aiExplanation, setAiExplanation] = useState<string | null>(null);
    const [excludeForms, setExcludeForms] = useState<boolean>(false);

    const { allPokemon, allMoves } = useGameDataStore();
    const { unitSettings } = useUIStore();


    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setAiExplanation(null);
        setGeneratedPokemon([]);

        // If no rank is selected, pick a random one.
        const generationRank = rank || RANKS[Math.floor(Math.random() * RANKS.length)];

        const createTeamMemberWithRank = (pokemonData: Pokedex): TeamMember => {
            const baseSheet = createInitialSheetData(pokemonData, unitSettings, generationRank);
            const sheetWithBonuses = applyRandomBonusPoints(pokemonData, baseSheet, generationRank);
            const selectedMoves = selectRandomMoves(pokemonData, sheetWithBonuses, allMoves);
            return {
                instanceID: crypto.randomUUID(),
                pokedexData: pokemonData,
                sheetData: {
                    ...sheetWithBonuses,
                    moves: selectedMoves,
                },
                forms: {},
                currentFormName: null,
            };
        };

        const formFilter = (p: Pokedex) => !p.Name.includes('Form)') || !excludeForms;

        if (generationMode === 'ai') {
            try {
                const pokemonCandidates = allPokemon.filter(p => !p.Legendary);
                const response = await suggestEncounter(aiPrompt, pokemonCandidates, generationRank, numPokemon, selectedType, excludeForms);
                const pokemonData = response.team.map(name => allPokemon.find(p => p.Name === name)).filter(Boolean) as Pokedex[];
                
                if (pokemonData.length > 0) {
                    const encounters = pokemonData.map(createTeamMemberWithRank);
                    setGeneratedPokemon(encounters);
                    setAiExplanation(response.explanation);
                } else {
                    alert("AI suggestion failed to return valid Pokémon. Please try again.");
                }
            } catch (error) {
                console.error("Error fetching AI suggestion:", error);
                alert("Failed to get AI suggestion. Please check the console for more details.");
            }
        } else {
            let candidates = allPokemon.filter(formFilter);
            if (selectedType) {
                candidates = candidates.filter(p => p.Type1 === selectedType || p.Type2 === selectedType);
            }
            // Always filter by the determined rank for random mode
            candidates = candidates.filter(p => p.RecommendedRank === generationRank);

            if (candidates.length === 0) {
                alert(`No Pokémon found for the selected parameters (Rank: ${generationRank}). Try different parameters.`);
                setIsLoading(false);
                return;
            }

            const encounters: TeamMember[] = [];
            for (let i = 0; i < numPokemon; i++) {
                const randomIndex = Math.floor(Math.random() * candidates.length);
                const pokemonData = candidates[randomIndex];
                encounters.push(createTeamMemberWithRank(pokemonData));
            }
            setGeneratedPokemon(encounters);
        }
        setIsLoading(false);
    }, [allPokemon, allMoves, numPokemon, rank, selectedType, unitSettings, generationMode, aiPrompt, excludeForms]);

    const handleUpdatePokemon = useCallback((updatedMember: TeamMember) => {
        setGeneratedPokemon(prev =>
            prev.map(member =>
                member.instanceID === updatedMember.instanceID ? updatedMember : member
            )
        );
    }, []);

    const handleSaveEncounter = () => {
        if (generatedPokemon.length === 0) {
            alert("No Pokémon have been generated to save.");
            return;
        }
        const name = prompt("Enter a name for this encounter:", "My Awesome Encounter");
        if (name) {
            const newEncounter = { name, pokemon: generatedPokemon, id: crypto.randomUUID() };
            useGameDataStore.setState(state => ({
                savedEncounters: [...state.savedEncounters, newEncounter]
            }));
            alert(`Encounter "${name}" saved!`);
        }
    };

    const handleTypeClick = (type: string) => {
        setSelectedType(prevType => {
            const newType = prevType === type ? null : type;
            setIsTypePopoverOpen(false);
            return newType;
        });
    };

    return (
        <div className="p-4 bg-gray-800 rounded-lg text-white">
            <h2 className="text-2xl font-bold mb-4 text-center md:text-left">Encounter Generator</h2>
            <div className="flex flex-col md:flex-row gap-6">
                {/* Control Panel */}
                <div className="bg-slate-800/50 p-4 rounded-lg md:w-80 flex flex-col gap-4 self-start">
                    <h3 className="text-xl font-semibold border-b border-gray-600 pb-2 mb-2">Controls</h3>

                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">Generation Mode</label>
                        <div className="flex w-full bg-slate-700 rounded-lg p-1">
                            <button
                                onClick={() => setGenerationMode('random')}
                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold rounded-md transition-all ${generationMode === 'random' ? 'bg-poke-yellow text-slate-900' : 'bg-transparent text-gray-300'}`}
                            >
                                <DiceIcon className="w-5 h-5" />
                                Random
                            </button>
                            <button
                                onClick={() => setGenerationMode('ai')}
                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold rounded-md transition-all ${generationMode === 'ai' ? 'bg-poke-yellow text-slate-900' : 'bg-transparent text-gray-300'}`}
                            >
                                <SparklesIcon className="w-5 h-5" />
                                AI-Powered
                            </button>
                        </div>
                    </div>

                    {generationMode === 'ai' && (
                        <div className="animate-fade-in">
                            <label htmlFor="ai-prompt" className="block text-sm font-bold text-gray-300 mb-1">
                                Encounter Theme/Prompt
                            </label>
                            <textarea
                                id="ai-prompt"
                                value={aiPrompt}
                                onChange={e => setAiPrompt(e.target.value)}
                                placeholder="e.g., 'A spooky encounter in a graveyard' or 'A team of fire-types guarding a volcano'"
                                className="w-full p-2 bg-slate-700 rounded h-24 resize-none"
                            />
                        </div>
                    )}
                    
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
                            value={rank || 'Any'}
                            onChange={e => setRank(e.target.value === 'Any' ? undefined : e.target.value as Rank)}
                            className="w-full p-2 bg-slate-700 rounded"
                        >
                            <option value="Any">Any Rank</option>
                            {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    <div>
                        <div className="flex items-center">
                            <input id="exclude-forms-encounter" type="checkbox" checked={excludeForms} onChange={e => setExcludeForms(e.target.checked)} className="h-4 w-4 rounded bg-slate-700 border-gray-600 text-poke-yellow focus:ring-poke-yellow" />
                            <label htmlFor="exclude-forms-encounter" className="ml-2 text-sm font-bold text-gray-300">Exclude Forms</label>
                        </div>
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-bold text-gray-300 mb-1">Type (Optional)</label>
                        <button
                            onClick={() => setIsTypePopoverOpen(!isTypePopoverOpen)}
                            className="w-full p-2 bg-slate-700 rounded text-left flex justify-between items-center"
                        >
                            {selectedType ? <TypeBadge type={selectedType} /> : <span>Any Type</span>}
                            <span className={`transform transition-transform ${isTypePopoverOpen ? 'rotate-180' : ''}`}>▼</span>
                        </button>
                        {isTypePopoverOpen && (
                            <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg p-2">
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedType(null);
                                            setIsTypePopoverOpen(false);
                                        }}
                                        className={`px-3 py-1 text-sm font-semibold rounded-full shadow-md transition-all duration-200 whitespace-nowrap ${!selectedType ? 'bg-poke-yellow text-slate-900 scale-110' : 'bg-slate-600 text-white opacity-70'}`}
                                    >
                                        Any
                                    </button>
                                    {Object.keys(TYPE_COLORS).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => handleTypeClick(type)}
                                            className={`rounded-full transition-all duration-200 ${selectedType === type ? 'ring-2 ring-poke-yellow scale-110' : 'ring-0 opacity-70 hover:opacity-100'}`}
                                        >
                                            <TypeBadge type={type} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || (generationMode === 'ai' && !aiPrompt.trim())}
                        className="w-full bg-poke-yellow text-slate-900 font-bold py-3 px-4 rounded-lg hover:bg-yellow-300 transition-colors text-lg mt-4 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Generating...' : 'Generate Encounter'}
                    </button>
                </div>

                {/* Encounter Display */}
                <div className="flex-1">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full bg-slate-800/50 rounded-lg min-h-[300px]">
                            <div className="text-center text-gray-400">
                                <p className="text-lg">Generating with AI...</p>
                                <p>Please wait a moment.</p>
                            </div>
                        </div>
                    ) : generatedPokemon.length > 0 ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold text-white">Generated Encounter</h3>
                                <button
                                    onClick={handleSaveEncounter}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                                    disabled={generatedPokemon.length === 0}
                                >
                                    <SaveIcon className="w-5 h-5" />
                                    Save Encounter
                                </button>
                            </div>
                            {aiExplanation && <AIExplanation explanation={aiExplanation} />}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4">
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