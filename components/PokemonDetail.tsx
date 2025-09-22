import React, { useMemo } from 'react';
import type { Pokedex, PokemonData, Move, Nature, Rank } from '../src/types/index.js';
import { CloseIcon } from './Icons.js';

import PokemonDetailHeader from './PokemonDetail/PokemonDetailHeader.js';
import LeftColumn from './PokemonDetail/LeftColumn.js';
import MiddleColumn from './PokemonDetail/MiddleColumn.js';
import RightColumn from './PokemonDetail/RightColumn.js';
import MovesSection from './PokemonDetail/MovesSection.js';
import MoveModal from './PokemonDetail/MoveModal.js';
import NatureModal from '../components/shared/NatureModal.js';
import { RANK_SKILL_LIMITS } from '../src/logic/core.js';
import { usePokemonSheet } from '../src/hooks/usePokemonSheet.js';
import { useNatureModal } from '../src/hooks/useNatureModal.js';
import { usePointCalculations } from '../src/hooks/usePointCalculations.js';

/**
 * @interface PokemonDetailProps
 * @property {Pokedex} pokemon - The base Pokedex data for the Pokémon.
 * @property {Record<string, Move>} allMoves - A map of all available moves.
 * @property {() => void} onClose - Callback to close the detail sheet.
 * @property {(pokemon: Pokedex, sheetData: PokemonData) => void} onAddToTeam - Callback to add the Pokémon to the team.
 * @property {(pokemon: Pokedex) => void} onRemoveFromTeam - Callback to remove the Pokémon from the team.
 * @property {boolean} isInTeam - True if the Pokémon is currently in the team.
 * @property {boolean} teamIsFull - True if the team has reached its maximum capacity.
 * @property {PokemonData} [sheetData] - Optional existing sheet data for the Pokémon if it's already in the team.
 * @property {(pokemonDexID: string, newSheetData: PokemonData) => void} onSheetDataChange - Callback to update the Pokémon's sheet data in the team.
 * @property {{ height: 'imperial' | 'metric', weight: 'imperial' | 'metric' }} unitSettings - User's preferred unit settings.
 * @property {Rank} trainerRank - The current rank of the trainer.
 */

/**
 * The PokemonDetail component displays and allows editing of a Pokémon's full character sheet.
 * It includes sections for attributes, skills, social stats, moves, and derived combat statistics.
 * Users can customize their Pokémon's sheet, add it to their team, or remove it.
 * @param {PokemonDetailProps} props - The props for the PokemonDetail component.
 * @returns {React.FC} The rendered PokemonDetail component.
 */
interface PokemonDetailProps {
    pokemon: Pokedex;
    allMoves: Record<string, Move>;
    onClose: () => void;
    onAddToTeam: (pokemon: Pokedex, sheetData: PokemonData) => void;
    onRemoveFromTeam: (pokemon: Pokedex) => void;
    isInTeam: boolean;
    teamIsFull: boolean;
    sheetData?: PokemonData;
    onSheetDataChange: (pokemonDexID: string, newSheetData: PokemonData) => void;
    unitSettings: { height: 'imperial' | 'metric', weight: 'imperial' | 'metric' };
    trainerRank: Rank;
}
const PokemonDetail: React.FC<PokemonDetailProps> = ({ pokemon, allMoves, onClose, onAddToTeam, onRemoveFromTeam, isInTeam, teamIsFull, sheetData, onSheetDataChange, unitSettings, trainerRank }) => {

    const {
        pokemonData,
        setPokemonData,
        handleDataChange,
        isMoveModalOpen,
        openMoveModal,
        closeMoveModal,
        handleSelectMove,
        moveSearchTerm,
        setMoveSearchTerm,
        learnableMoves,
        handleClearMove,
        expandedMoves,
        handleToggleMoveExpand,
        availableAbilities
    } = usePokemonSheet(pokemon, sheetData, unitSettings, trainerRank, isInTeam, onSheetDataChange, allMoves);

    const {
        isNatureModalOpen,
        closeNatureModal,
        openNatureModal,
        natureSearchTerm,
        setNatureSearchTerm,
        filteredNatures,
    } = useNatureModal();

    const {
        points,
        isAttributePoolExhausted,
        isSocialAttributePoolExhausted,
        isSkillPoolExhausted
    } = usePointCalculations(pokemonData, pokemon);

    const handleSelectNature = (nature: Nature) => {
        setPokemonData(prev => ({
            ...prev,
            pokemonNature: nature.name,
            confidence: String(nature.confidence),
        }));
        closeNatureModal();
    };
    
    const skillLimit = useMemo(() => RANK_SKILL_LIMITS[pokemonData.rank as Rank], [pokemonData.rank]);

    return (
        <div className="relative w-full max-w-7xl mx-auto p-4 rounded-xl font-pixel animate-fade-in-scale" style={{ backgroundColor: '#E46243' }}>
            <MoveModal
                isOpen={isMoveModalOpen}
                onClose={closeMoveModal}
                learnableMoves={learnableMoves}
                onSelectMove={handleSelectMove}
                searchTerm={moveSearchTerm}
                onSearchTermChange={setMoveSearchTerm}
            />
            <NatureModal
                isOpen={isNatureModalOpen}
                onClose={closeNatureModal}
                natures={filteredNatures}
                onSelectNature={handleSelectNature}
                searchTerm={natureSearchTerm}
                onSearchTermChange={setNatureSearchTerm}
            />

            <button onClick={onClose} className="absolute top-2 right-2 z-20 p-2 rounded-full bg-[#B2483D] text-white hover:bg-poke-red transition-transform transform hover:scale-110" aria-label="Close sheet">
                <CloseIcon className="w-5 h-5" />
            </button>

            <PokemonDetailHeader
                pokemonData={pokemonData}
                updateField={handleDataChange}
                isInTeam={isInTeam}
                teamIsFull={teamIsFull}
                onAddToTeam={() => onAddToTeam(pokemon, pokemonData)}
                onRemoveFromTeam={() => onRemoveFromTeam(pokemon)}
                pokemon={pokemon}
                availableAbilities={availableAbilities}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-4 gap-y-3">
                <LeftColumn 
                    pokemon={pokemon}
                    pokemonData={pokemonData} 
                    onDataChange={handleDataChange} 
                    skillLimit={skillLimit} 
                    points={points}
                    isAttributePoolExhausted={isAttributePoolExhausted}
                    isSkillPoolExhausted={isSkillPoolExhausted}
                />
                <MiddleColumn 
                    pokemonData={pokemonData} 
                    onDataChange={handleDataChange} 
                    onOpenNatureModal={openNatureModal}
                    points={points}
                    isSocialAttributePoolExhausted={isSocialAttributePoolExhausted}
                />
                <RightColumn pokemonData={pokemonData} updateField={handleDataChange} pokemon={pokemon} trainerRank={trainerRank} />
            </div>

            <MovesSection 
                pokemonData={pokemonData} 
                allMoves={allMoves}
                openMoveModal={openMoveModal} 
                handleClearMove={handleClearMove}
                expandedMoves={expandedMoves}
                onToggleMoveExpand={handleToggleMoveExpand}
            />
        </div>
    );
};

export default PokemonDetail;