import { create } from 'zustand';
import { Pokedex } from '../types/index.js';
import { AvailableEvolution } from '../hooks/useEvolution.js';

type UnitSettings = { height: 'imperial' | 'metric'; weight: 'imperial' | 'metric' };
type SelectedPokemon = { dexID: string; instanceID?: string };

type EvolutionStep = 'CHOICE' | 'OVERRANK_CHOICE' | 'OVERRANK_MOVESET' | 'REDISTRIBUTE' | 'MOVESET' | 'LOYALTY_CHECK';

type EvolutionState = {
    isOpen: true;
    teamMemberInstanceId: string;
    step: EvolutionStep;
    selectedEvolution?: AvailableEvolution; // The chosen evolution path
    bonusPoints?: { attributes: number; social: number; skills: number }; // Points to be redistributed
    newPokedexData?: Pokedex; // Data for the evolved form
} | { isOpen: false };

interface UIState {
    isSidebarOpen: boolean;
    isSettingsOpen: boolean;
    isSuggestModalOpen: boolean;
    selectedPokemonId: SelectedPokemon | null;
    unitSettings: UnitSettings;
    evolutionState: EvolutionState;
    openEvolutionModal: (instanceId: string) => void;
    setEvolutionStep: (step: EvolutionStep, data?: Partial<Omit<EvolutionState, 'isOpen' | 'step'>>) => void;
    closeEvolutionModal: () => void;
    setIsSidebarOpen: (isOpen: boolean) => void;
    setIsSettingsOpen: (isOpen: boolean) => void;
    setIsSuggestModalOpen: (isOpen: boolean) => void;
    selectPokemon: (dexID: string, instanceID?: string) => void;
    clearSelection: () => void;
    setUnitSettings: (settings: UnitSettings) => void;
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
}));