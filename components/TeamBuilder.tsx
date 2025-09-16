import React, { useRef } from 'react';
import { Pokedex, TeamMember } from '../types';
import { IMAGE_BASE_URL } from '../constants';
import { PokeballIcon } from './Icons';

interface TeamBuilderProps {
    team: TeamMember[];
    onSelectPokemon: (pokemon: Pokedex) => void;
    onRemoveFromTeam: (pokemon: Pokedex) => void;
    onSuggestTeam: () => void;
    isSuggesting: boolean;
    onAddPokemonClick: () => void;
    onExportTeam: () => void;
    onLoadTeam: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const TeamSlot: React.FC<{ 
    teamMember?: TeamMember; 
    onSelect: (p: Pokedex) => void; 
    onRemove: (p: Pokedex) => void;
    onAddPokemonClick: () => void;
}> = ({ teamMember, onSelect, onRemove, onAddPokemonClick }) => {
    if (!teamMember) {
        return (
            <button
                onClick={onAddPokemonClick}
                className="w-full h-40 bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center group hover:bg-slate-700 hover:border-poke-yellow transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-poke-yellow focus:ring-offset-2 focus:ring-offset-slate-900"
                aria-label="Add Pokémon to team"
            >
                <PokeballIcon className="w-16 h-16 text-slate-600 transition-colors group-hover:text-poke-yellow" />
                <span className="mt-1 font-semibold text-slate-500 transition-colors group-hover:text-poke-yellow">Add Pokémon</span>
            </button>
        );
    }

    const { pokedexData: pokemon } = teamMember;
    const imageUrl = `${IMAGE_BASE_URL}${pokemon.Image}`;
    
    return (
        <div className="relative w-full h-40 bg-slate-700/80 rounded-lg group animate-fade-in overflow-hidden shadow-lg">
            <img src={imageUrl} alt={pokemon.Name} className="w-full h-full object-contain p-2" />
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 className="text-lg font-bold text-white">{pokemon.Name}</h3>
                <button 
                    onClick={() => onSelect(pokemon)}
                    className="mt-2 px-3 py-1 bg-poke-blue text-white rounded hover:bg-blue-600 transition-colors text-sm"
                >
                    View Details
                </button>
                 <button 
                    onClick={(e) => { e.stopPropagation(); onRemove(pokemon); }}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 text-xs"
                    title="Remove from team"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};


const TeamBuilder: React.FC<TeamBuilderProps> = ({ team, onSelectPokemon, onRemoveFromTeam, onSuggestTeam, isSuggesting, onAddPokemonClick, onExportTeam, onLoadTeam }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLoadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col items-center justify-center h-full animate-fade-in-scale">
            <h2 className="text-3xl font-bold text-poke-yellow mb-2">Your Team</h2>
            <p className="text-gray-400 mb-6 text-center">Select Pokémon from the list or manage your team below.</p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                <button
                    onClick={onSuggestTeam}
                    disabled={isSuggesting}
                    className="flex items-center justify-center px-4 py-2 bg-poke-blue text-white font-pixel text-xs rounded-md border-b-4 border-blue-900 hover:bg-blue-600 active:translate-y-0.5 active:border-b-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-poke-yellow disabled:bg-slate-600 disabled:border-slate-700 disabled:cursor-wait disabled:transform-none"
                >
                    {isSuggesting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Generating...</span>
                        </>
                    ) : (
                        <>
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                           </svg>
                           <span>Suggest Team</span>
                        </>
                    )}
                </button>
                <button
                    onClick={onExportTeam}
                    disabled={team.length === 0}
                    className="flex items-center justify-center px-4 py-2 bg-green-600 text-white font-pixel text-xs rounded-md border-b-4 border-green-800 hover:bg-green-500 active:translate-y-0.5 active:border-b-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-poke-yellow disabled:bg-slate-600 disabled:border-slate-700 disabled:cursor-not-allowed disabled:transform-none"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>Export Team</span>
                </button>
                <button
                    onClick={handleLoadClick}
                    className="flex items-center justify-center px-4 py-2 bg-poke-yellow text-slate-900 font-pixel text-xs rounded-md border-b-4 border-yellow-600 hover:bg-yellow-400 active:translate-y-0.5 active:border-b-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-poke-yellow"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <span>Load Team</span>
                </button>
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onLoadTeam}
                    accept="application/json,.json"
                    className="hidden"
                    aria-hidden="true"
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl">
                {Array.from({ length: 6 }).map((_, index) => (
                    <TeamSlot 
                        key={index} 
                        teamMember={team[index]} 
                        onSelect={onSelectPokemon}
                        onRemove={onRemoveFromTeam}
                        onAddPokemonClick={onAddPokemonClick}
                    />
                ))}
            </div>
             {team.length >= 6 && (
                <p className="mt-6 text-lg font-semibold text-poke-red animate-pulse-slow">Your team is full!</p>
            )}
        </div>
    );
};

export default TeamBuilder;