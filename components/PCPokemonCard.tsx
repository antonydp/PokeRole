import React from 'react';
import { PokemonCardProps } from './types.js';
import { IMAGE_BASE_URL } from '../src/constants/config.js';

const PCPokemonCard: React.FC<PokemonCardProps> = ({ pokemon, onSelect }) => {
    const imageUrl = `${IMAGE_BASE_URL}${pokemon.Image}`;
    
    return (
        <div
            onClick={() => onSelect(pokemon.DexID)}
            className="group relative flex flex-col items-center justify-center p-2 bg-slate-700/60 rounded-lg cursor-pointer hover:bg-slate-600/80 transition-colors duration-200 shadow-md aspect-square"
        >
            <img 
                src={imageUrl} 
                alt={pokemon.Name}
                className="w-16 h-16 object-contain group-hover:scale-110 transition-transform"
                loading="lazy"
            />
            <h3 className="font-semibold text-xs text-white text-center mt-1 truncate w-full">{pokemon.Name}</h3>
        </div>
    );
};

export default React.memo(PCPokemonCard);