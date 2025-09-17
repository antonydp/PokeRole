
import React from 'react';
import { Pokedex } from '../types';
import { IMAGE_BASE_URL } from '../constants';
import TypeBadge from './TypeBadge';

interface PokemonCardProps {
    pokemon: Pokedex;
    onSelect: (pokemon: Pokedex) => void;
}

const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, onSelect }) => {
    const imageUrl = `${IMAGE_BASE_URL}${pokemon.Image}`;
    
    return (
        <div 
            onClick={() => onSelect(pokemon)}
            className={`group relative flex items-center p-2 bg-slate-700/60 rounded-lg cursor-pointer hover:bg-slate-600/80 transition-colors duration-200 shadow-md ${pokemon.Legendary ? 'border border-poke-yellow/50' : ''}`}
        >
            {pokemon.Legendary && (
                <div className="absolute top-1 right-1 text-poke-yellow" title="Legendary Pokémon">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </div>
            )}
            <img 
                src={imageUrl} 
                alt={pokemon.Name}
                className="w-16 h-16 object-contain group-hover:animate-wobble"
                loading="lazy"
            />
            <div className="ml-3 flex-grow">
                <p className="text-xs text-gray-400">#{String(pokemon.Number).padStart(4, '0')}</p>
                <h3 className="font-bold text-lg text-white">{pokemon.Name}</h3>
                <div className="flex space-x-2 mt-1">
                    <TypeBadge type={pokemon.Type1} />
                    {pokemon.Type2 && <TypeBadge type={pokemon.Type2} />}
                </div>
            </div>
        </div>
    );
};

export default React.memo(PokemonCard);