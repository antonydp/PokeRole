
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Pokedex, Move, Ability } from './types';
import { fetchAllData } from './services/pokedexService';
import PokemonList from './components/PokemonList';
import PokemonDetail from './components/PokemonDetail';
import TeamBuilder from './components/TeamBuilder';
import { LoadingSpinner, PokeballIcon } from './components/Icons';
import { GoogleGenAI, Type } from "@google/genai";

const App: React.FC = () => {
    const [allPokemon, setAllPokemon] = useState<Pokedex[]>([]);
    const [allMoves, setAllMoves] = useState<Record<string, Move>>({});
    const [allAbilities, setAllAbilities] = useState<Record<string, Ability>>({});
    const [team, setTeam] = useState<Pokedex[]>([]);
    const [selectedPokemon, setSelectedPokemon] = useState<Pokedex | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isSuggestingTeam, setIsSuggestingTeam] = useState<boolean>(false);

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const { pokemonData, movesData, abilitiesData } = await fetchAllData();
            
            const movesMap = movesData.reduce((acc, move) => {
                acc[move._id] = move;
                return acc;
            }, {} as Record<string, Move>);

            const abilitiesMap = abilitiesData.reduce((acc, ability) => {
                acc[ability._id] = ability;
                return acc;
            }, {} as Record<string, Ability>);

            setAllPokemon(pokemonData);
            setAllMoves(movesMap);
            setAllAbilities(abilitiesMap);
        } catch (err) {
            setError('Failed to fetch Pokémon data. The servers might be down or your connection is unstable. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    const handleSelectPokemon = useCallback((pokemon: Pokedex) => {
        setSelectedPokemon(pokemon);
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedPokemon(null);
    }, []);

    const handleAddToTeam = useCallback((pokemon: Pokedex) => {
        if (team.length < 6 && !team.some(p => p.DexID === pokemon.DexID)) {
            setTeam(prevTeam => [...prevTeam, pokemon]);
        }
    }, [team]);

    const handleRemoveFromTeam = useCallback((pokemon: Pokedex) => {
        setTeam(prevTeam => prevTeam.filter(p => p.DexID !== pokemon.DexID));
    }, []);
    
    const handleSuggestTeam = useCallback(async () => {
        if (isSuggestingTeam) return;

        setIsSuggestingTeam(true);
        setError(null);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const pokemonNames = allPokemon.map(p => p.Name).join(', ');

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `You are a Pokémon team building expert for the Pokérole system. From the provided list of Pokémon, create a balanced and powerful team of 6. A balanced team has good type coverage and a mix of offensive and defensive Pokémon. Return only the names of the 6 Pokémon you have chosen. Available Pokémon: ${pokemonNames}`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            team: {
                                type: Type.ARRAY,
                                description: "An array of 6 Pokémon names for a balanced team.",
                                items: {
                                    type: Type.STRING
                                }
                            }
                        }
                    },
                },
            });

            const jsonResponse = JSON.parse(response.text);
            const suggestedNames: string[] = jsonResponse.team;

            if (suggestedNames && suggestedNames.length > 0) {
                const newTeam = suggestedNames.map(name => {
                    return allPokemon.find(p => p.Name.toLowerCase() === name.toLowerCase());
                }).filter((p): p is Pokedex => p !== undefined);
                
                setTeam(newTeam.slice(0, 6));
            } else {
                throw new Error("AI did not suggest a valid team.");
            }

        } catch (err) {
            setError('Failed to get team suggestion from AI. Please try again.');
            console.error(err);
        } finally {
            setIsSuggestingTeam(false);
        }
    }, [allPokemon, isSuggestingTeam]);


    const isPokemonInTeam = useMemo(() => {
        if (!selectedPokemon) return false;
        return team.some(p => p.DexID === selectedPokemon.DexID);
    }, [selectedPokemon, team]);
    
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
                <LoadingSpinner />
                <p className="mt-4 text-xl">Loading Pokédex...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-center p-4">
                <PokeballIcon className="w-24 h-24 mb-4 text-poke-red opacity-70 animate-pulse-slow" />
                <h1 className="text-3xl font-bold text-poke-yellow">Oops! Something went wrong.</h1>
                <p className="mt-2 max-w-md text-gray-300">{error}</p>
                <button 
                    onClick={loadData}
                    className="mt-6 px-6 py-2 bg-poke-blue text-white font-bold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-poke-yellow"
                >
                    Try Again
                </button>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-slate-900 p-4 font-sans flex flex-col">
            <header className="w-full text-center mb-4 flex items-center justify-center">
                <PokeballIcon className="w-10 h-10 mr-3 text-poke-red" />
                <h1 className="text-4xl font-bold text-poke-yellow tracking-wider">Pokérole Team Builder</h1>
            </header>
            <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                <div className="lg:col-span-1 bg-slate-800/50 rounded-lg p-2 overflow-y-auto h-[calc(100vh-100px)]">
                    <PokemonList allPokemon={allPokemon} onSelectPokemon={handleSelectPokemon} />
                </div>
                <div className="lg:col-span-2 bg-slate-800/50 rounded-lg p-4 h-[calc(100vh-100px)] overflow-y-auto">
                    {selectedPokemon ? (
                        <PokemonDetail 
                            pokemon={selectedPokemon}
                            allMoves={allMoves}
                            onClose={handleClearSelection}
                            onAddToTeam={handleAddToTeam}
                            onRemoveFromTeam={handleRemoveFromTeam}
                            isInTeam={isPokemonInTeam}
                            teamIsFull={team.length >= 6}
                        />
                    ) : (
                        <TeamBuilder 
                            team={team} 
                            onSelectPokemon={handleSelectPokemon} 
                            onRemoveFromTeam={handleRemoveFromTeam}
                            onSuggestTeam={handleSuggestTeam}
                            isSuggesting={isSuggestingTeam}
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;
