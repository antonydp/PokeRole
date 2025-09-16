
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
            className="group flex items-center p-2 bg-slate-700/60 rounded-lg cursor-pointer hover:bg-slate-600/80 transition-colors duration-200 shadow-md"
        >
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