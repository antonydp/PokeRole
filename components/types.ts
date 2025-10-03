import type { Pokedex, TeamMember, TrainerData, ItemsData, PokemonData, Move, Nature, Rank, Ribbon, Badge, Ability } from '../src/types/index.js';


export interface PokemonCardProps {
    pokemon: Pokedex;
    onSelect: (dexID: string) => void;
}


export interface PokemonListProps {
    allPokemon: Pokedex[];
    onSelectPokemon: (dexID: string) => void;
}

export interface SuggestTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    allPokemon: Pokedex[];
    team: TeamMember[];
    onAddSuggestionToTeam: (pokemon: Pokedex) => void;
}

export interface SuggestionCardProps {
    pokemon: Pokedex;
    onAdd: () => void;
    isAdded: boolean;
    teamIsFull: boolean;
}

export interface TeamSlotProps {
    teamMember?: TeamMember;
    onSelect: (dexID: string, instanceID?: string) => void;
    onRemove: (instanceId: string) => void;
    onAddPokemonClick: () => void;
    onMouseEnter: (teamMember: TeamMember, element: HTMLElement) => void;
    onMouseLeave: () => void;
    onQuickImport: () => void;
    onQuickExport: (teamMember: TeamMember) => void;
}


export interface TooltipData {
    content: TeamMember;
    rect: DOMRect;
}


export interface TypeBadgeProps {
    type: string;
}