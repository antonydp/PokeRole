import React from 'react';
import { PokemonCardProps } from './types.js';
import { IMAGE_BASE_URL } from '../src/constants/config.js';

const PCPokemonCard: React.FC<PokemonCardProps> = ({ pokemon, onSelect }) => {
    const isTeamMember = 'instanceID' in pokemon;
    const pokedexData = isTeamMember ? pokemon.pokedexData : pokemon;
    const sheetData = isTeamMember ? pokemon.sheetData : undefined;

    const imageUrl = `${IMAGE_BASE_URL}${pokedexData.Image}`;
    const displayName = sheetData?.pokemonName || pokedexData.Name;
    
    return (
        <div
            onClick={() => onSelect(pokedexData.DexID)}
            className="group relative flex flex-col items-center justify-center p-2 bg-slate-700/60 rounded-lg cursor-pointer hover:bg-slate-600/80 transition-colors duration-200 shadow-md aspect-square"
        >
            <img
                src={imageUrl}
                alt={pokedexData.Name}
                className="w-16 h-16 object-contain group-hover:scale-110 transition-transform"
                loading="lazy"
            />
            <h3 className="font-semibold text-xs text-white text-center mt-1 truncate w-full">{displayName}</h3>
        </div>
    );
};

export default React.memo(PCPokemonCard);