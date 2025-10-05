import React, { useMemo, useState } from 'react';
import { Nature } from '../src/types/index.js';
import { CloseIcon, PokeballIcon } from './Icons.js';

import { GlobalTooltip } from '../components/shared/GlobalTooltip.js';
import PokemonDetailHeader from './PokemonDetail/PokemonDetailHeader.js';
import LeftColumn from './PokemonDetail/LeftColumn.js';
import MiddleColumn from './PokemonDetail/MiddleColumn.js';
import RightColumn from './PokemonDetail/RightColumn.js';
import MovesSection from './PokemonDetail/MovesSection.js';
import { PokemonSheetProvider } from '../src/context/PokemonSheetContext.js';
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
import { useActivePokemon } from '../src/hooks/useActivePokemon.js';
import { EvolutionModal } from './PokemonDetail/EvolutionModal.js';
 
const PokemonDetail: React.FC = () => {
    const { allMoves, allAbilities, ribbonsData } = useGameDataStore();
    const { unitSettings, clearSelection, evolutionState, openEvolutionModal } = useUIStore();
    const { team, trainerData, addToTeam, removeFromTeam, updateSheetData, isPokemonInTeam } = useSessionStore();
    const { teamMember, pokedexData: pokemon, sheetData, activeForm } = useActivePokemon();

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

    const pokemonSheet = usePokemonSheet(
        pokemon,
        sheetData,
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
        pokemonSheet.setPokemonData(prev => ({
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
        return allAbilitiesArray.find(a => a.Name === pokemonSheet.pokemonData.ability);
    }, [allAbilitiesArray, pokemonSheet.pokemonData.ability]);

    const isEvolveEligible = availableEvolutions.some(e => e.isEligible);
    const evolutionReason = useMemo(() => {
        if (isEvolveEligible) {
            return '';
        }
        if (availableEvolutions.length === 0) {
            return 'This Pokémon does not evolve.';
        }
        return availableEvolutions
            .filter(e => !e.isEligible)
            .map(e => `${e.To}: ${e.reason}`)
            .join('\n');
    }, [availableEvolutions, isEvolveEligible]);

    const contextValue = {
        pokemon,
        teamMember,
        ...pokemonSheet,
        allMoves,
        trainerRank: trainerData.trainerRank,
        ribbonsData,
        isInTeam,
        teamIsFull: team.length >= 6,
        onAddToTeam: () => addToTeam(pokemon, pokemonSheet.pokemonData),
        onRemoveFromTeam: () => removeFromTeam(teamMember!.instanceID),
        onEvolveClick: () => openEvolutionModal(teamMember!.instanceID),
        isEvolveEligible,
        evolutionReason,
        isInTemporaryForm: !!teamMember?.currentFormName,
        onAbilityClick: () => setIsAbilityModalOpen(true),
        onShowTooltip: handleShowTooltip,
        onHideTooltip: handleHideTooltip,
        selectedAbility,
        onOpenNatureModal: openNatureModal,
    };

    return (
        <PokemonSheetProvider value={contextValue}>
            <div className="relative w-full max-w-7xl mx-auto p-4 rounded-xl font-primary animate-fade-in-scale" style={{ backgroundColor: '#E46243' }}>
                <GlobalTooltip tooltipData={tooltipData} />
                {evolutionState.isOpen && teamMember?.instanceID === evolutionState.teamMemberInstanceId && (
                    <EvolutionModal pokemonData={pokemonSheet.pokemonData} />
                )}
                <AbilityModal
                    isOpen={isAbilityModalOpen}
                    onClose={() => setIsAbilityModalOpen(false)}
                    pokemonAbilities={pokemonSheet.availableAbilities}
                    allAbilities={allAbilitiesArray}
                    onSelectAbility={(ability) => pokemonSheet.handleDataChange('ability', ability)}
                />
                <MoveModal
                    isOpen={pokemonSheet.isMoveModalOpen}
                    onClose={pokemonSheet.closeMoveModal}
                    learnableMoves={pokemonSheet.learnableMoves}
                    onSelectMove={pokemonSheet.handleSelectMove}
                    searchTerm={pokemonSheet.moveSearchTerm}
                    onSearchTermChange={pokemonSheet.setMoveSearchTerm}
                    showTutorMoves={pokemonSheet.showTutorMoves}
                    onShowTutorMovesChange={pokemonSheet.setShowTutorMoves}
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
                    isOpen={pokemonSheet.isConfirmationModalOpen}
                    onClose={pokemonSheet.cancelOverRankMove}
                    onConfirm={pokemonSheet.confirmOverRankMove}
                    title="Over-Rank Move"
                >
                    <p>
                        Are you sure you want to learn <span className="font-bold">{pokemonSheet.selectedMove?.Name}</span>?
                        This move is above the Pokémon's current rank and may have consequences.
                    </p>
                </ConfirmationModal>

                <button onClick={clearSelection} className="absolute top-2 right-2 z-20 p-2 rounded-full bg-[#B2483D] text-white hover:bg-poke-red transition-transform transform hover:scale-110" aria-label="Close sheet">
                    <CloseIcon className="w-5 h-5" />
                </button>

                <PokemonDetailHeader />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-4 gap-y-3">
                    <LeftColumn />
                    <MiddleColumn />
                    <RightColumn />
                </div>

                <MovesSection />
            </div>
        </PokemonSheetProvider>
    );
};

export default PokemonDetail;