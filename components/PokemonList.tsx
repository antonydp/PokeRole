
import React, { useState, useMemo } from 'react';
import { Pokedex } from '../types';
import PokemonCard from './PokemonCard';
import { TYPE_COLORS } from '../constants';

interface PokemonListProps {
    allPokemon: Pokedex[];
    onSelectPokemon: (pokemon: Pokedex) => void;
}

const PokemonList: React.FC<PokemonListProps> = ({ allPokemon, onSelectPokemon }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string | null>(null);

    const pokemonTypes = useMemo(() => {
        return Object.keys(TYPE_COLORS);
    }, []);
    
    const filteredPokemon = useMemo(() => {
        return allPokemon.filter(pokemon => {
            const nameMatch = pokemon.Name.toLowerCase().includes(searchTerm.toLowerCase());
            const typeMatch = !typeFilter || pokemon.Type1 === typeFilter || pokemon.Type2 === typeFilter;
            return nameMatch && typeMatch;
        });
    }, [allPokemon, searchTerm, typeFilter]);

    return (
        <div className="flex flex-col h-full">
            <div className="p-2 sticky top-0 bg-slate-800 z-10">
                <input
                    type="text"
                    placeholder="Search Pokémon..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-poke-blue"
                />
                <div className="flex flex-wrap gap-1 mt-2 justify-center">
                    <button 
                        onClick={() => setTypeFilter(null)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${!typeFilter ? 'bg-poke-blue text-white ring-2 ring-poke-yellow' : 'bg-slate-600 text-gray-300 hover:bg-slate-500'}`}
                    >
                        All
                    </button>
                    {pokemonTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => setTypeFilter(type)}
                            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${typeFilter === type ? 'ring-2 ring-poke-yellow' : 'hover:opacity-80' } ${TYPE_COLORS[type]}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-grow overflow-y-auto p-2 space-y-2">
                {filteredPokemon.length > 0 ? (
                    filteredPokemon.map(pokemon => (
                        <PokemonCard key={pokemon.DexID} pokemon={pokemon} onSelect={onSelectPokemon} />
                    ))
                ) : (
                    <p className="text-center text-gray-400 mt-8">No Pokémon found.</p>
                )}
            </div>
        </div>
    );
};

export default PokemonList;
