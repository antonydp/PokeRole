import type { Pokedex, TeamMember, TrainerData, ItemsData, PokemonData, Move, Nature, Rank, Ribbon, Badge } from '../src/types/index.js';

export interface DashboardProps {
    team: TeamMember[];
    onSelectPokemon: (pokemon: Pokedex) => void;
    onRemoveFromTeam: (pokemon: Pokedex) => void;
    onAddPokemonClick: () => void;
    trainerData: TrainerData;
    onTrainerDataChange: ((updaterOrData: ((prev: TrainerData) => TrainerData) | TrainerData) => void);
    allItems: ItemsData | null;
    onOpenSuggestModal: () => void;
    allBadges: Badge[];
}

export interface PokemonCardProps {
    pokemon: Pokedex;
    onSelect: (pokemon: Pokedex) => void;
}

export interface PokemonDetailProps {
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
    ribbonsData: Ribbon[];
}

export interface PokemonListProps {
    allPokemon: Pokedex[];
    onSelectPokemon: (pokemon: Pokedex) => void;
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

export interface TeamBuilderProps {
    team: TeamMember[];
    onSelectPokemon: (pokemon: Pokedex) => void;
    onRemoveFromTeam: (pokemon: Pokedex) => void;
    onAddPokemonClick: () => void;
    onOpenSuggestModal: () => void;
}
export interface TeamSlotProps {
    teamMember?: TeamMember;
    onSelect: (p: Pokedex) => void;
    onRemove: (p: Pokedex) => void;
    onAddPokemonClick: () => void;
    onMouseEnter: (teamMember: TeamMember, element: HTMLElement) => void;
    onMouseLeave: () => void;
}


export interface TooltipData {
    content: TeamMember;
    rect: DOMRect;
}

export interface TrainerSheetProps {
    trainerData: TrainerData;
    onDataChange: (updaterOrData: ((prev: TrainerData) => TrainerData) | TrainerData) => void;
    allItems: ItemsData | null;
    allBadges: Badge[];
}

export interface TypeBadgeProps {
    type: string;
}