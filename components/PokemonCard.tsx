import React from 'react';
import type { Pokedex } from '../src/types/index.js';
import { IMAGE_BASE_URL } from '../src/constants/config.js';
import TypeBadge from './TypeBadge.js';
import { PokemonCardProps } from './types.js';


/**
 * PokemonCard component displays a summary of a single Pokémon.
 * It shows the Pokémon's image, number, name, types, and a special indicator if it's legendary.
 * The card is clickable to view more details about the Pokémon.
 * @param {PokemonCardProps} props - The props for the PokemonCard component.
 * @returns {React.FC} The rendered PokemonCard component.
 */

const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, onSelect }) => {
    const isTeamMember = 'pokedexData' in pokemon;
    const pokedexData = isTeamMember ? pokemon.pokedexData : pokemon;
    const imageUrl = `${IMAGE_BASE_URL}${pokedexData.Image}`;
    
    return (
        <div
            onClick={() => onSelect(isTeamMember ? pokemon.instanceID : pokedexData.DexID)}
            className={`group relative flex items-center w-full p-2 bg-slate-700/60 rounded-lg cursor-pointer hover:bg-slate-600/80 transition-colors duration-200 shadow-md ${pokedexData.Legendary ? 'border border-poke-yellow/50' : ''}`}
        >
            {pokedexData.Legendary && (
                <div className="absolute top-1 right-1 text-poke-yellow" title="Legendary Pokémon">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </div>
            )}
            <img
                src={imageUrl}
                alt={pokedexData.Name}
                className="w-16 h-16 object-contain group-hover:animate-wobble"
                loading="lazy"
            />
            <div className="ml-3 flex-grow overflow-hidden">
                <div className="flex justify-between items-baseline">
                    <p className="text-xs text-gray-400">#{String(pokedexData.Number).padStart(4, '0')}</p>
                    {pokedexData.RecommendedRank && pokedexData.RecommendedRank !== 'Starter' && (
                        <p className="text-xs text-poke-yellow/80 font-semibold truncate pr-2" title={`Recommended Rank: ${pokedexData.RecommendedRank}`}>
                            Rec: {pokedexData.RecommendedRank}
                        </p>
                    )}
                </div>
                <h3 className="font-bold text-lg text-white -mt-1 truncate">{pokedexData.Name}</h3>
                <div className="flex space-x-2 mt-1">
                    <TypeBadge type={pokedexData.Type1} />
                    {pokedexData.Type2 && <TypeBadge type={pokedexData.Type2} />}
                </div>
            </div>
        </div>
    );
};

export default React.memo(PokemonCard);