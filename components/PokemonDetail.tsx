import React, { useMemo } from 'react';
import type { Pokedex, PokemonData, Move, Nature, Rank, Ability } from '../src/types/index.js';
import { CloseIcon } from './Icons.js';

import PokemonDetailHeader from './PokemonDetail/PokemonDetailHeader.js';
import LeftColumn from './PokemonDetail/LeftColumn.js';
import MiddleColumn from './PokemonDetail/MiddleColumn.js';
import RightColumn from './PokemonDetail/RightColumn.js';
import MovesSection from './PokemonDetail/MovesSection.js';
import MoveModal from './PokemonDetail/MoveModal.js';
import AbilityModal from './PokemonDetail/AbilityModal.js';
import NatureModal from '../components/shared/NatureModal.js';
import ConfirmationModal from '../components/shared/ConfirmationModal.js';
import { RANK_SKILL_LIMITS } from '../src/logic/core.js';
import { usePokemonSheet } from '../src/hooks/usePokemonSheet.js';
import { useNatureModal } from '../src/hooks/useNatureModal.js';
import { usePointCalculations } from '../src/hooks/usePointCalculations.js';

import { PokemonDetailProps } from './types.js';


/**
 * The PokemonDetail component displays and allows editing of a Pokémon's full character sheet.
 * It includes sections for attributes, skills, social stats, moves, and derived combat statistics.
 * Users can customize their Pokémon's sheet, add it to their team, or remove it.
 * @param {PokemonDetailProps} props - The props for the PokemonDetail component.
 * @returns {React.FC} The rendered PokemonDetail component.
 */
const PokemonDetail: React.FC<PokemonDetailProps> = ({ pokemon, teamMember, allMoves, allAbilities, onClose, onAddToTeam, onRemoveFromTeam, isInTeam, teamIsFull, onSheetDataChange, unitSettings, trainerRank, ribbonsData }) => {

    const [isAbilityModalOpen, setIsAbilityModalOpen] = React.useState(false);

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
        availableAbilities,
        showTutorMoves,
        setShowTutorMoves,
        isConfirmationModalOpen,
        confirmOverRankMove,
        cancelOverRankMove,
        selectedMove
    } = usePokemonSheet(pokemon, teamMember?.sheetData, unitSettings, trainerRank, isInTeam, onSheetDataChange, allMoves, teamMember?.instanceID);
 
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
        <div className="relative w-full max-w-7xl mx-auto p-4 rounded-xl font-primary animate-fade-in-scale" style={{ backgroundColor: '#E46243' }}>
            <AbilityModal
                isOpen={isAbilityModalOpen}
                onClose={() => setIsAbilityModalOpen(false)}
                pokemonAbilities={availableAbilities}
                allAbilities={allAbilities}
                onSelectAbility={(ability) => handleDataChange('ability', ability)}
            />
            <MoveModal
                isOpen={isMoveModalOpen}
                onClose={closeMoveModal}
                learnableMoves={learnableMoves}
                onSelectMove={handleSelectMove}
                searchTerm={moveSearchTerm}
                onSearchTermChange={setMoveSearchTerm}
                showTutorMoves={showTutorMoves}
                onShowTutorMovesChange={setShowTutorMoves}
            />
            <NatureModal
                isOpen={isNatureModalOpen}
                onClose={closeNatureModal}
                natures={filteredNatures}
                onSelectNature={handleSelectNature}
                searchTerm={natureSearchTerm}
                onSearchTermChange={setNatureSearchTerm}
            />
            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={cancelOverRankMove}
                onConfirm={confirmOverRankMove}
                title="Over-Rank Move"
            >
                <p>
                    Are you sure you want to learn <span className="font-bold">{selectedMove?.Name}</span>?
                    This move is above the Pokémon's current rank and may have consequences.
                </p>
            </ConfirmationModal>

            <button onClick={onClose} className="absolute top-2 right-2 z-20 p-2 rounded-full bg-[#B2483D] text-white hover:bg-poke-red transition-transform transform hover:scale-110" aria-label="Close sheet">
                <CloseIcon className="w-5 h-5" />
            </button>

            <PokemonDetailHeader
                pokemonData={pokemonData}
                updateField={handleDataChange}
                isInTeam={isInTeam}
                teamIsFull={teamIsFull}
                onAddToTeam={() => onAddToTeam(pokemon, pokemonData)}
                onRemoveFromTeam={() => {
                    if (teamMember) {
                        onRemoveFromTeam(teamMember.instanceID);
                    }
                }}
                pokemon={pokemon}
                availableAbilities={availableAbilities}
                onAbilityClick={() => setIsAbilityModalOpen(true)}
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
                    ribbonsData={ribbonsData}
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