import React, { useMemo, useState } from 'react';
import { Nature } from '../src/types/index.js';
import { CloseIcon, PokeballIcon } from './Icons.js';

import { GlobalTooltip } from '../components/shared/GlobalTooltip.js';
import PokemonDetailHeader from './PokemonDetail/PokemonDetailHeader.js';
import LeftColumn from './PokemonDetail/LeftColumn.js';
import MiddleColumn from './PokemonDetail/MiddleColumn.js';
import RightColumn from './PokemonDetail/RightColumn.js';
import MovesSection from './PokemonDetail/MovesSection.js';
import MoveModal from './PokemonDetail/MoveModal.js';
import AbilityModal from './PokemonDetail/AbilityModal.js';
import NatureModal from '../components/shared/NatureModal.js';
import ConfirmationModal from '../components/shared/ConfirmationModal.js';
import { usePokemonSheet } from '../src/hooks/usePokemonSheet.js';
import { useNatureModal } from '../src/hooks/useNatureModal.js';
import { useGameDataStore } from '../src/store/useGameDataStore.js';
import { useUIStore } from '../src/store/useUIStore.js';
import { useSessionStore } from '../src/store/useSessionStore.js';
import { useEvolution } from '../src/hooks/useEvolution.js';
import { EvolutionModal } from './PokemonDetail/EvolutionModal.js';

const PokemonDetail: React.FC = () => {
    const { allMoves, allAbilities, ribbonsData, allPokemon } = useGameDataStore();
    const { unitSettings, clearSelection, selectedPokemonId, evolutionState, openEvolutionModal } = useUIStore();
    const { team, trainerData, addToTeam, removeFromTeam, updateSheetData, isPokemonInTeam } = useSessionStore();

    const teamMember = useMemo(() => {
        if (!selectedPokemonId?.instanceID) return null;
        return team.find(m => m.instanceID === selectedPokemonId.instanceID) || null;
    }, [selectedPokemonId, team]);

    const activeForm = useMemo(() => {
        if (teamMember?.currentFormName && teamMember.forms?.[teamMember.currentFormName]) {
            return teamMember.forms[teamMember.currentFormName];
        }
        return null;
    }, [teamMember]);

    const pokemon = useMemo(() => {
        if (activeForm) return activeForm.pokedexData;
        if (teamMember) return teamMember.pokedexData;
        if (selectedPokemonId) {
            return allPokemon.find(p => p.DexID === selectedPokemonId.dexID) || null;
        }
        return null;
    }, [teamMember, activeForm, selectedPokemonId, allPokemon]);
    const { availableEvolutions } = useEvolution(teamMember);

    const [isAbilityModalOpen, setIsAbilityModalOpen] = useState(false);
    
    type TooltipData = {
        content: { name: string; description: string };
        rect: DOMRect;
    } | null;
    const [tooltipData, setTooltipData] = useState<TooltipData>(null);

    if (!pokemon) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                <PokeballIcon className="w-24 h-24 mb-4 text-gray-600" />
                <h2 className="text-2xl font-bold">Select a Pokémon</h2>
                <p>Choose a Pokémon from the list to see its details.</p>
            </div>
        );
    }
    
    const isInTeam = isPokemonInTeam(pokemon.DexID);
    const allAbilitiesArray = useMemo(() => Object.values(allAbilities), [allAbilities]);

    const {
        pokemonData,
        setPokemonData,
        handleDataChange,
        isMoveModalOpen, openMoveModal, closeMoveModal,
        handleSelectMove, moveSearchTerm, setMoveSearchTerm,
        learnableMoves, handleClearMove, expandedMoves, handleToggleMoveExpand,
        availableAbilities, showTutorMoves, setShowTutorMoves,
        isConfirmationModalOpen, confirmOverRankMove, cancelOverRankMove, selectedMove,
        points, isAttributePoolExhausted, isSocialAttributePoolExhausted, isSkillPoolExhausted,
        skillLimit
    } = usePokemonSheet(
        pokemon,
        activeForm ? activeForm.sheetData : teamMember?.sheetData,
        unitSettings,
        trainerData.trainerRank,
        isInTeam,
        updateSheetData,
        allMoves,
        teamMember?.instanceID
    );
 
    const {
        isNatureModalOpen, closeNatureModal, openNatureModal,
        natureSearchTerm, setNatureSearchTerm, filteredNatures,
    } = useNatureModal();

    const handleSelectNature = (nature: Nature) => {
        setPokemonData(prev => ({
            ...prev,
            pokemonNature: nature.name,
            confidence: String(nature.confidence),
        }));
        closeNatureModal();
    };

    const handleShowTooltip = (e: React.MouseEvent<HTMLElement>, content: { name: string; description: string } | null) => {
        if (!content) return;
        setTooltipData({ content, rect: e.currentTarget.getBoundingClientRect() });
    };

    const handleHideTooltip = () => {
        setTooltipData(null);
    };

    const selectedAbility = useMemo(() => {
        return allAbilitiesArray.find(a => a.Name === pokemonData.ability);
    }, [allAbilitiesArray, pokemonData.ability]);

    return (
        <div className="relative w-full max-w-7xl mx-auto p-4 rounded-xl font-primary animate-fade-in-scale" style={{ backgroundColor: '#E46243' }}>
            <GlobalTooltip tooltipData={tooltipData} />
            {evolutionState.isOpen && teamMember?.instanceID === evolutionState.teamMemberInstanceId && (
                <EvolutionModal pokemonData={pokemonData} />
            )}
            <AbilityModal
                isOpen={isAbilityModalOpen}
                onClose={() => setIsAbilityModalOpen(false)}
                pokemonAbilities={availableAbilities}
                allAbilities={allAbilitiesArray}
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

            <button onClick={clearSelection} className="absolute top-2 right-2 z-20 p-2 rounded-full bg-[#B2483D] text-white hover:bg-poke-red transition-transform transform hover:scale-110" aria-label="Close sheet">
                <CloseIcon className="w-5 h-5" />
            </button>

            <PokemonDetailHeader
                teamMember={teamMember}
                pokemonData={pokemonData}
                updateField={handleDataChange}
                isInTeam={isInTeam}
                teamIsFull={team.length >= 6}
                onAddToTeam={() => addToTeam(pokemon, pokemonData)}
                onRemoveFromTeam={() => removeFromTeam(teamMember!.instanceID)}
                onEvolveClick={() => openEvolutionModal(teamMember!.instanceID)}
                isEvolveEligible={availableEvolutions.some(e => e.isEligible)}
                isInTemporaryForm={!!teamMember?.currentFormName}
                pokemon={pokemon}
                availableAbilities={availableAbilities}
                onAbilityClick={() => setIsAbilityModalOpen(true)}
                onShowTooltip={handleShowTooltip}
                onHideTooltip={handleHideTooltip}
                selectedAbility={selectedAbility}
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
                <RightColumn pokemonData={pokemonData} updateField={handleDataChange} pokemon={pokemon} trainerRank={trainerData.trainerRank} />
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