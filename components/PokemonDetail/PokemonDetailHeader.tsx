
import React from 'react';
import { Pokedex, PokemonData } from '../../types';
import { MinusIcon, PlusIcon } from '../Icons';

interface PokemonDetailHeaderProps {
    pokemonData: PokemonData;
    updateField: (field: keyof PokemonData, value: any) => void;
    isInTeam: boolean;
    teamIsFull: boolean;
    onAddToTeam: () => void;
    onRemoveFromTeam: () => void;
    pokemon: Pokedex;
    availableAbilities: string[];
}

const PokemonDetailHeader: React.FC<PokemonDetailHeaderProps> = ({
    pokemonData,
    updateField,
    isInTeam,
    teamIsFull,
    onAddToTeam,
    onRemoveFromTeam,
    availableAbilities,
}) => {
    return (
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4 font-pixel">
            {/* Left side: Name and Pokedex # */}
            <div className="flex-grow min-w-[250px]">
                <input 
                    id="pokemonName"
                    type="text"
                    value={pokemonData.pokemonName}
                    onChange={e => updateField('pokemonName', e.target.value)}
                    className="w-full bg-transparent p-0 text-4xl font-pixel text-white border-none focus:ring-0 focus:outline-none placeholder:text-white/50"
                    placeholder="Pokémon Name"
                    aria-label="Pokémon Name"
                />
                <p className="mt-1 font-pixel text-sm text-white/80 tracking-wider">
                    POKÉDEX #: {pokemonData.pokemonNumber}
                </p>
            </div>

            {/* Right side: Ability and Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch flex-shrink-0 w-full sm:w-auto">
                <div className="relative w-full sm:w-48 bg-[#B2483D] rounded-xl px-2 pt-1 pb-1.5 border-2 border-[#3A3A3A] flex flex-col justify-center">
                    <label htmlFor="ability" className="font-pixel text-[10px] tracking-wider uppercase text-white/90 font-bold">
                        ABILITY
                    </label>
                    <select
                        id="ability"
                        value={pokemonData.ability}
                        onChange={(e) => updateField('ability', e.target.value)}
                        className="w-full bg-transparent text-white font-sans text-sm focus:outline-none p-0 appearance-none pr-6"
                        disabled={availableAbilities.length <= 1}
                    >
                        {availableAbilities.map(ab => <option key={ab} value={ab} className="text-black">{ab}</option>)}
                        {availableAbilities.length === 0 && <option value="" className="text-black">N/A</option>}
                    </select>
                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/90">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>

                <div className="flex-grow">
                    {isInTeam ? (
                        <button onClick={onRemoveFromTeam} className="h-full flex items-center justify-center px-4 py-2 bg-poke-red hover:bg-red-700 rounded-lg font-bold text-white transition-colors text-sm w-full">
                            <MinusIcon className="w-5 h-5 mr-2" /> REMOVE
                        </button>
                    ) : (
                        <button onClick={onAddToTeam} disabled={teamIsFull} className="h-full flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-white transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed text-sm w-full">
                            <PlusIcon className="w-5 h-5 mr-2" /> ADD TO TEAM
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PokemonDetailHeader;
