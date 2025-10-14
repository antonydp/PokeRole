import React, { createContext, useContext, ReactNode } from 'react';
import { Pokedex, PokemonData, Move, Rank, Ribbon, Ability, LearnableMove } from '../types/index.js';
import { TeamMember } from '../types/index.js';
import { usePokemonSheet } from '../hooks/usePokemonSheet.js';

// This defines the full shape of the context value, combining the return type of usePokemonSheet
// with other data passed down from PokemonDetail
export interface PokemonSheetContextType {
    // From usePokemonSheet
    pokemonData: PokemonData;
    setPokemonData: React.Dispatch<React.SetStateAction<PokemonData>>;
    handleDataChange: (field: keyof PokemonData, value: any) => void;
    isMoveModalOpen: boolean;
    openMoveModal: (index: number) => void;
    closeMoveModal: () => void;
    handleSelectMove: (move: Move) => void;
    moveSearchTerm: string;
    setMoveSearchTerm: React.Dispatch<React.SetStateAction<string>>;
    learnableMoves: LearnableMove[];
    handleClearMove: (index: number) => void;
    expandedMoves: Set<number>;
    handleToggleMoveExpand: (index: number) => void;
    availableAbilities: string[];
    showTutorMoves: boolean;
    setShowTutorMoves: React.Dispatch<React.SetStateAction<boolean>>;
    isConfirmationModalOpen: boolean;
    confirmOverRankMove: () => void;
    cancelOverRankMove: () => void;
    selectedMove: Move | null;
    points: ReturnType<typeof usePokemonSheet>['points']; // Keep this dynamic for complex types
    isAttributePoolExhausted: boolean;
    isSocialAttributePoolExhausted: boolean;
    isSkillPoolExhausted: boolean;
    skillLimit: number;

    // From PokemonDetail component
    pokemon: Pokedex;
    teamMember: TeamMember | null;
    allMoves: Record<string, Move>;
    trainerRank: Rank;
    ribbonsData: Ribbon[];
    isInTeam: boolean;
    isInPC: boolean;
    teamIsFull: boolean;
    onAddToTeam: () => void;
    onRemoveFromTeam: () => void;
    onRemoveFromPC: () => void;
    onEvolveClick: () => void;
    isEvolveEligible: boolean;
    evolutionReason: string;
    isInTemporaryForm: boolean;
    onAbilityClick: () => void;
    onShowTooltip: (e: React.MouseEvent<HTMLElement>, content: { name: string; description: string } | null) => void;
    onHideTooltip: () => void;
    selectedAbility: Ability | undefined;
    onOpenNatureModal: () => void;
    onClose: () => void;
}

const PokemonSheetContext = createContext<PokemonSheetContextType | undefined>(undefined);

export const usePokemonSheetContext = (): PokemonSheetContextType => {
    const context = useContext(PokemonSheetContext);
    if (!context) {
        throw new Error('usePokemonSheetContext must be used within a PokemonSheetProvider');
    }
    return context;
};

interface PokemonSheetProviderProps {
    children: ReactNode;
    value: PokemonSheetContextType;
}

export const PokemonSheetProvider: React.FC<PokemonSheetProviderProps> = ({ children, value }) => {
    return (
        <PokemonSheetContext.Provider value={value}>
            {children}
        </PokemonSheetContext.Provider>
    );
};