import { create } from 'zustand';
import { Pokedex, PokemonData } from '../types/index.js';

type UnitSettings = { height: 'imperial' | 'metric'; weight: 'imperial' | 'metric' };
type SelectedPokemon = { dexID: string; instanceID?: string };

type EvolutionStep = 'CHOICE' | 'OVERRANK' | 'REDISTRIBUTE' | 'MOVESET' | 'LOYALTY_CHECK';

type EvolutionState = {
    isOpen: true;
    teamMemberInstanceId: string;
    step: EvolutionStep;
    bonusPoints?: { attributes: number; social: number; skills: number };
    newPokedexData?: Pokedex;
    tempSheetData?: PokemonData;
} | { isOpen: false };

interface UIState {
    isSidebarOpen: boolean;
    isSettingsOpen: boolean;
    isSuggestModalOpen: boolean;
    selectedPokemonId: SelectedPokemon | null;
    unitSettings: UnitSettings;
    evolutionState: EvolutionState;
    setIsSidebarOpen: (isOpen: boolean) => void;
    setIsSettingsOpen: (isOpen: boolean) => void;
    setIsSuggestModalOpen: (isOpen: boolean) => void;
    selectPokemon: (dexID: string, instanceID?: string) => void;
    clearSelection: () => void;
    setUnitSettings: (settings: UnitSettings) => void;
    openEvolutionModal: (instanceId: string) => void;
    setEvolutionStep: (step: EvolutionStep, data?: object) => void;
    closeEvolutionModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    isSidebarOpen: false,
    isSettingsOpen: false,
    isSuggestModalOpen: false,
    selectedPokemonId: null,
    evolutionState: { isOpen: false },
    unitSettings: (() => {
        try {
            const saved = localStorage.getItem('pokerole-unit-settings');
            return saved ? JSON.parse(saved) : { height: 'imperial', weight: 'imperial' };
        } catch (e) {
            console.error("Failed to parse unit settings from localStorage", e);
            return { height: 'imperial', weight: 'imperial' };
        }
    })(),
    setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
    setIsSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
    setIsSuggestModalOpen: (isOpen) => set({ isSuggestModalOpen: isOpen }),
    selectPokemon: (dexID, instanceID) => {
        set({ selectedPokemonId: { dexID, instanceID }, isSidebarOpen: false });
    },
    clearSelection: () => {
        set({ selectedPokemonId: null });
    },
    setUnitSettings: (settings) => {
        try {
            localStorage.setItem('pokerole-unit-settings', JSON.stringify(settings));
            set({ unitSettings: settings });
        } catch (e) {
            console.error("Failed to save unit settings to localStorage", e);
        }
    },
    openEvolutionModal: (instanceId) => set({
        evolutionState: {
            isOpen: true,
            teamMemberInstanceId: instanceId,
            step: 'CHOICE'
        }
    }),
    setEvolutionStep: (step, data = {}) => set(state => {
        if (state.evolutionState.isOpen) {
            return {
                evolutionState: {
                    ...state.evolutionState,
                    step,
                    ...data,
                },
            };
        }
        return state;
    }),
    closeEvolutionModal: () => set({ evolutionState: { isOpen: false } }),
}));