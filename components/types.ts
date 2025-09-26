import type { Pokedex, TeamMember, TrainerData, ItemsData, PokemonData, Move, Nature, Rank, Ribbon, Badge } from '../src/types/index.js';

export interface DashboardProps {
    team: TeamMember[];
    onSelectPokemon: (dexID: string, instanceID?: string) => void;
    onRemoveFromTeam: (instanceId: string) => void;
    onAddPokemonClick: () => void;
    trainerData: TrainerData;
    onTrainerDataChange: ((updaterOrData: ((prev: TrainerData) => TrainerData) | TrainerData) => void);
    allItems: ItemsData | null;
    onOpenSuggestModal: () => void;
    allBadges: Badge[];
    onQuickImport: (importString: string, slotIndex: number) => void;
    onQuickExport: (teamMember: TeamMember) => void;
}

export interface PokemonCardProps {
    pokemon: Pokedex;
    onSelect: (dexID: string) => void;
}

export interface PokemonDetailProps {
    pokemon: Pokedex;
    teamMember: TeamMember | null;
    allMoves: Record<string, Move>;
    onClose: () => void;
    onAddToTeam: (pokemon: Pokedex, sheetData: PokemonData) => void;
    onRemoveFromTeam: (instanceId: string) => void;
    isInTeam: boolean;
    teamIsFull: boolean;
    onSheetDataChange: (instanceId: string, newSheetData: PokemonData) => void;
    unitSettings: { height: 'imperial' | 'metric', weight: 'imperial' | 'metric' };
    trainerRank: Rank;
    ribbonsData: Ribbon[];
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

export interface TeamBuilderProps {
    team: TeamMember[];
    onSelectPokemon: (dexID: string, instanceID?: string) => void;
    onRemoveFromTeam: (instanceId: string) => void;
    onAddPokemonClick: () => void;
    onOpenSuggestModal: () => void;
    onQuickImport: (importString: string, slotIndex: number) => void;
    onQuickExport: (teamMember: TeamMember) => void;
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

export interface TrainerSheetProps {
    trainerData: TrainerData;
    onDataChange: (updaterOrData: ((prev: TrainerData) => TrainerData) | TrainerData) => void;
    allItems: ItemsData | null;
    allBadges: Badge[];
}

export interface TypeBadgeProps {
    type: string;
}