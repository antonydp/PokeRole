import React, { useState, useCallback, useMemo } from 'react';
import { Pokedex, TeamMember } from '../src/types/index.js';
import { suggestTeam } from '../services/aiService.js';
import { PokeballIcon, CloseIcon, SparklesIcon, PlusIcon } from './Icons.js';
import TypeBadge from './TypeBadge.js';
import { IMAGE_BASE_URL } from '../src/constants/config.js';


/**
 * SuggestionCard component displays a single Pokémon suggestion within the modal.
 * It shows the Pokémon's image, name, types, and an "Add" button.
 * The "Add" button is disabled if the Pokémon is already in the team or the team is full.
 * @param {SuggestionCardProps} props - The props for the SuggestionCard component.
 * @returns {React.FC} The rendered SuggestionCard component.
 */
import { SuggestionCardProps, SuggestTeamModalProps } from './types.js';

const SuggestionCard: React.FC<SuggestionCardProps> = ({ pokemon, onAdd, isAdded, teamIsFull }) => {
    const imageUrl = `${IMAGE_BASE_URL}${pokemon.Image}`;
    const isDisabled = isAdded || teamIsFull;
    
    return (
        <div className="relative flex items-center p-2 bg-slate-700/60 rounded-lg shadow-md">
            <img 
                src={imageUrl} 
                alt={pokemon.Name}
                className="w-14 h-14 object-contain"
                loading="lazy"
            />
            <div className="ml-3 flex-grow overflow-hidden">
                <h3 className="font-bold text-base text-white truncate">{pokemon.Name}</h3>
                <div className="flex space-x-1 mt-1">
                    <TypeBadge type={pokemon.Type1} />
                    {pokemon.Type2 && <TypeBadge type={pokemon.Type2} />}
                </div>
            </div>
            <button 
                onClick={onAdd}
                disabled={isDisabled}
                className="flex items-center justify-center px-3 py-1.5 bg-green-600 text-white font-primary text-xs rounded-md border-b-2 border-green-800 hover:bg-green-500 active:translate-y-px active:border-b-0 transition-all duration-150 disabled:bg-slate-500 disabled:border-slate-600 disabled:cursor-not-allowed"
            >
                <PlusIcon className="w-4 h-4" />
                <span className="ml-1">{isAdded ? 'Added' : 'Add'}</span>
            </button>
        </div>
    );
};


/**
 * SuggestTeamModal component provides an interface for users to get AI-powered Pokémon team suggestions.
 * Users can input a prompt describing their desired team, and the modal will display suggested Pokémon.
 * @param {SuggestTeamModalProps} props - The props for the SuggestTeamModal component.
 * @returns {React.FC} The rendered SuggestTeamModal component.
 */
const SuggestTeamModal: React.FC<SuggestTeamModalProps> = ({ isOpen, onClose, allPokemon, team, onAddSuggestionToTeam }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<Pokedex[]>([]);

    const pokemonMap = useMemo(() => {
        const map = new Map<string, Pokedex>();
        allPokemon.forEach(p => map.set(p.Name, p));
        return map;
    }, [allPokemon]);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            setError('Please describe the team you want.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setSuggestions([]);
        try {
            const suggestedNames = await suggestTeam(prompt, allPokemon, team);
            const suggestedPokemon = suggestedNames
                .map(name => pokemonMap.get(name))
                .filter((p): p is Pokedex => !!p);
            setSuggestions(suggestedPokemon);
        } catch (e: any) {
            setError(e.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, allPokemon, team, pokemonMap]);
    
    const teamDexIDs = useMemo(() => new Set(team.map(m => m.pokedexData.DexID)), [team]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col font-sans animate-fade-in-scale" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <SparklesIcon className="w-8 h-8 text-purple-400" />
                        <h2 className="text-2xl font-primary text-poke-yellow">AI Team Suggester</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-full bg-slate-700 hover:bg-red-500 transition-colors">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-4 space-y-4 flex-grow overflow-y-auto">
                    <div>
                        <label htmlFor="team-prompt" className="block text-gray-300 font-bold mb-2">Describe your desired team:</label>
                        <textarea
                            id="team-prompt"
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            placeholder="e.g., 'A balanced team for a beginner', 'A fast team of special attackers', 'A team that can counter fairy types'"
                            rows={4}
                            className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-poke-blue"
                            disabled={isLoading}
                        />
                    </div>
                     <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center px-4 py-2 bg-poke-blue text-white font-primary text-base rounded-md border-b-4 border-blue-800 hover:bg-blue-600 active:translate-y-px active:border-b-2 transition-all duration-150 disabled:bg-slate-600 disabled:border-slate-700 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <PokeballIcon className="w-6 h-6 mr-3 text-white animate-spin" />
                                Generating...
                            </>
                        ) : 'Generate Suggestion'}
                    </button>
                    
                    {error && (
                        <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-lg text-center">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}
                    
                    {suggestions.length > 0 && !isLoading && (
                        <div className="pt-4 border-t border-slate-700/50 animate-fade-in">
                            <h3 className="text-xl font-bold text-poke-yellow mb-3 font-primary">Suggested Team:</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {suggestions.map(pokemon => (
                                    <SuggestionCard
                                        key={pokemon.DexID}
                                        pokemon={pokemon}
                                        onAdd={() => onAddSuggestionToTeam(pokemon)}
                                        isAdded={teamDexIDs.has(pokemon.DexID)}
                                        teamIsFull={team.length >= 6}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SuggestTeamModal;
