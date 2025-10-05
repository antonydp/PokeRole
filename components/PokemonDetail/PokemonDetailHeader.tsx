
import React from 'react';
import { Pokedex, PokemonData, Ability } from '../../src/types/index.js';
import { MinusIcon, PlusIcon } from '../Icons.js';
import { useSessionStore } from '../../src/store/useSessionStore.js';
import { IMAGE_BASE_URL } from '../../src/constants/config.js';
import { usePokemonSheetContext } from '../../src/context/PokemonSheetContext.js';

const PokemonDetailHeader: React.FC = () => {
    const {
        teamMember,
        pokemonData,
        handleDataChange: updateField,
        isInTeam,
        teamIsFull,
        onAddToTeam,
        onRemoveFromTeam,
        onEvolveClick,
        isEvolveEligible,
        evolutionReason,
        isInTemporaryForm,
        onAbilityClick,
        onShowTooltip,
        onHideTooltip,
        selectedAbility,
        pokemon,
    } = usePokemonSheetContext();
    const { changeForm } = useSessionStore();

    if (isInTemporaryForm && !teamMember) return null; // If in temp form, must be a team member

    return (
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4 font-primary">
            <div className="flex items-center">
                <img src={`${IMAGE_BASE_URL}${pokemon.Image}`} alt={pokemon.Name} className="w-24 h-24 mr-4" />
                <div className="flex-grow min-w-[250px]">
                    <input
                        id="pokemonName"
                    type="text"
                    value={pokemonData.pokemonName}
                    onChange={e => updateField('pokemonName', e.target.value)}
                    className="w-full bg-transparent p-0 text-4xl font-primary text-white border-none focus:ring-0 focus:outline-none placeholder:text-white/50"
                    placeholder="Pokémon Name"
                    aria-label="Pokémon Name"
                />
                    <p className="mt-1 font-primary text-sm text-white/80 tracking-wider">
                        POKÉDEX #: {pokemonData.pokemonNumber}
                    </p>
                </div>
            </div>
            {/* Right side: Ability and Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch flex-shrink-0 w-full sm:w-auto">
                <button
                    onClick={onAbilityClick}
                    onMouseEnter={(e) => onShowTooltip(e, selectedAbility ? { name: selectedAbility.Name, description: selectedAbility.Description } : null)}
                    onMouseLeave={onHideTooltip}
                    className="relative w-full sm:w-48 bg-[#B2483D] rounded-xl px-2 pt-1 pb-1.5 border-2 border-[#3A3A3A] flex flex-col justify-center text-left hover:bg-red-800 transition-colors"
                >
                    <label className="font-primary text-[10px] tracking-wider uppercase text-white/90 font-bold">
                        ABILITY
                    </label>
                    <div className="w-full bg-transparent text-white font-sans text-sm focus:outline-none p-0 truncate">
                        {pokemonData.ability || 'Select Ability'}
                    </div>
                </button>

                <div className="flex-grow flex gap-2">
                     {/* ADD THIS CONDITIONAL BUTTON */}
                     {isInTemporaryForm && (
                        <button
                           onClick={() => changeForm(teamMember!.instanceID, null, pokemonData)}
                           className="h-full flex items-center justify-center px-4 py-2 bg-cyan-500 text-white hover:bg-cyan-600 rounded-lg font-bold transition-colors text-sm w-full"
                       >
                            REVERT FORM
                        </button>
                    )}
                    {isInTeam && !isInTemporaryForm ? ( // Hide remove/add when in temp form
                        <button onClick={onRemoveFromTeam} className="h-full flex items-center justify-center px-4 py-2 bg-poke-red hover:bg-red-700 rounded-lg font-bold text-white transition-colors text-sm w-full">
                            <MinusIcon className="w-5 h-5 mr-2" /> REMOVE
                        </button>
                    ) : !isInTemporaryForm && (
                        <button onClick={onAddToTeam} disabled={teamIsFull} className="h-full flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-white transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed text-sm w-full">
                            <PlusIcon className="w-5 h-5 mr-2" /> ADD TO TEAM
                        </button>
                    )}
                    <div className="w-full"
                        onMouseEnter={(e) => {
                            if (!isEvolveEligible && evolutionReason) {
                                onShowTooltip(e, { name: 'Evolution Blocked', description: evolutionReason });
                            }
                        }}
                        onMouseLeave={onHideTooltip}
                    >
                        <button
                            onClick={onEvolveClick}
                            disabled={!isEvolveEligible || isInTemporaryForm}
                            className="h-full flex items-center justify-center px-4 py-2 bg-poke-yellow text-slate-900 hover:bg-yellow-300 rounded-lg font-bold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed text-sm w-full"
                        >
                            EVOLVE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PokemonDetailHeader;
