
import React from 'react';
import { Pokedex, PokemonData, Ability } from '../../src/types/index.js';
import { CloseIcon, MinusIcon, PlusIcon } from '../Icons.js';
import { useSessionStore } from '../../src/store/useSessionStore.js';
import { IMAGE_BASE_URL } from '../../src/constants/config.js';
import { usePokemonSheetContext } from '../../src/context/PokemonSheetContext.js';

const PokemonDetailHeader: React.FC = () => {
    const {
        teamMember,
        pokemonData,
        handleDataChange: updateField,
        isInTeam,
        isInPC,
        teamIsFull,
        onAddToTeam,
        onRemoveFromTeam,
        onRemoveFromPC,
        onEvolveClick,
        isEvolveEligible,
        evolutionReason,
        isInTemporaryForm,
        onAbilityClick,
        onShowTooltip,
        onHideTooltip,
        selectedAbility,
        pokemon,
        onClose,
    } = usePokemonSheetContext();
    const { changeForm } = useSessionStore();

    if (isInTemporaryForm && !teamMember) return null; // If in temp form, must be a team member

    return (
        <>
            <div className="flex justify-between items-start mb-3 flex-wrap gap-3 font-primary">
                <div className="flex items-center">
                    <img src={`${IMAGE_BASE_URL}${pokemon.Image}`} alt={pokemon.Name} className="w-20 h-20 mr-3" />
                    <div className="flex-grow min-w-[200px]">
                        <input
                            id="pokemonName"
                            type="text"
                            value={pokemonData.pokemonName}
                            onChange={e => updateField('pokemonName', e.target.value)}
                            className="w-full bg-transparent p-0 text-3xl font-primary text-white border-none focus:ring-0 focus:outline-none placeholder:text-white/50"
                            placeholder="Pokémon Name"
                            aria-label="Pokémon Name"
                        />
                        <p className="mt-0.5 font-primary text-xs text-white/80 tracking-wider">
                            POKÉDEX #: {pokemonData.pokemonNumber}
                        </p>
                    </div>
                </div>
                {/* Right side: Ability and Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch flex-shrink-0 w-full sm:w-auto pt-2">
                    <button
                        onClick={onAbilityClick}
                        onMouseEnter={(e) => onShowTooltip(e, selectedAbility ? { name: selectedAbility.Name, description: selectedAbility.Description } : null)}
                        onMouseLeave={onHideTooltip}
                        className="relative w-full sm:w-40 bg-[#B2483D] rounded-lg px-1.5 pt-0.5 pb-1 border-2 border-[#3A3A3A] flex flex-col justify-center text-left hover:bg-red-800 transition-colors"
                    >
                        <label className="font-primary text-[9px] tracking-wider uppercase text-white/90 font-bold">
                            ABILITY
                        </label>
                        <div className="w-full bg-transparent text-white font-sans text-xs focus:outline-none p-0 truncate">
                            {pokemonData.ability || 'Select Ability'}
                        </div>
                    </button>

                    <div className="flex-grow flex gap-1.5">
                        {/* ADD THIS CONDITIONAL BUTTON */}
                        {isInTemporaryForm && (
                            <button
                                onClick={() => changeForm(teamMember!.instanceID, null, pokemonData)}
                                className="h-full flex items-center justify-center px-3 py-1.5 bg-cyan-500 text-white hover:bg-cyan-600 rounded-md font-bold transition-colors text-xs w-full"
                            >
                                REVERT FORM
                            </button>
                        )}
                        {isInTeam && !isInPC && !isInTemporaryForm ? (
                            <button onClick={onRemoveFromTeam} className="h-full flex items-center justify-center px-3 py-1.5 bg-poke-red hover:bg-red-700 rounded-md font-bold text-white transition-colors text-xs w-full">
                                <MinusIcon className="w-4 h-4 mr-1.5" /> REMOVE FROM TEAM
                            </button>
                        ) : isInPC && !isInTemporaryForm ? (
                            <button onClick={onRemoveFromPC} className="h-full flex items-center justify-center px-3 py-1.5 bg-poke-red hover:bg-red-700 rounded-md font-bold text-white transition-colors text-xs w-full">
                                <MinusIcon className="w-4 h-4 mr-1.5" /> REMOVE FROM PC
                            </button>
                        ) : !isInTemporaryForm && (
                            <button onClick={onAddToTeam} disabled={teamIsFull} className="h-full flex items-center justify-center px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-md font-bold text-white transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed text-xs w-full">
                                <PlusIcon className="w-4 h-4 mr-1.5" /> ADD TO TEAM
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
                                className="h-full flex items-center justify-center px-3 py-1.5 bg-poke-yellow text-slate-900 hover:bg-yellow-300 rounded-md font-bold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed text-xs w-full"
                            >
                                EVOLVE
                            </button>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 p-2 rounded-full bg-[#B2483D] text-white hover:bg-poke-red transition-transform transform hover:scale-110 flex items-center justify-center" aria-label="Close sheet">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <p className="font-sans text-xs text-white/90 tracking-wider text-justify mb-3">
                {pokemon.DexDescription}
            </p>
        </>
    );
};

export default PokemonDetailHeader;
