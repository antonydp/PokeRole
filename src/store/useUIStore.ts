import { create } from 'zustand';
import { Pokedex } from '../types/index.js';
import { AvailableEvolution } from '../hooks/useEvolution.js';

export type UnitSettings = { height: 'imperial' | 'metric'; weight: 'imperial' | 'metric' };
type SelectedPokemon = { dexID: string; instanceID?: string };

type EvolutionStep = 'CHOICE' | 'OVERRANK_CHOICE' | 'OVERRANK_MOVESET' | 'REDISTRIBUTE' | 'MOVESET';

type EvolutionState = {
    isOpen: true;
    teamMemberInstanceId: string;
    step: EvolutionStep;
    selectedEvolution?: AvailableEvolution; // The chosen evolution path
    bonusPoints?: { attributes: number; social: number; skills: number }; // Points to be redistributed
    newPokedexData?: Pokedex; // Data for the evolved form
    oldMoves?: (string | null)[]; // The moveset before evolution
} | { isOpen: false };

// Define new types for clarity
type ActiveDashboardView = 'trainer' | 'team' | 'pc';
type MainView = 'dashboard' | 'gm';

interface UIState {
    isLoading: boolean;
    isPokemonListModalOpen: boolean;
    addPokemonTarget: 'team' | 'pc';
    isSettingsOpen: boolean;
    isSuggestModalOpen: boolean;
    selectedPokemonId: SelectedPokemon | null;
    activeView: ActiveDashboardView; // Changed type
    mainView: MainView; // New state
    pokemonDetailReturnView: 'team' | 'pc';
    unitSettings: UnitSettings;
    evolutionState: EvolutionState;
    setIsLoading: (isLoading: boolean) => void;
    openEvolutionModal: (instanceId: string) => void;
    setEvolutionStep: (step: EvolutionStep, data?: Partial<Omit<EvolutionState, 'isOpen' | 'step'>>) => void;
    closeEvolutionModal: () => void;
    setIsPokemonListModalOpen: (isOpen: boolean, target?: 'team' | 'pc') => void;
    setIsSettingsOpen: (isOpen: boolean) => void;
    setIsSuggestModalOpen: (isOpen: boolean) => void;
    selectPokemon: (dexID: string, instanceID?: string, returnView?: 'team' | 'pc') => void;
    clearSelection: () => void;
    setUnitSettings: (settings: UnitSettings) => void;
    setActiveView: (view: ActiveDashboardView) => void; // Changed type
    setMainView: (view: MainView) => void; // New action
}

export const useUIStore = create<UIState>((set) => ({
    isLoading: false,
    isPokemonListModalOpen: false,
    addPokemonTarget: 'team',
    isSettingsOpen: false,
    isSuggestModalOpen: false,
    selectedPokemonId: null,
    activeView: 'trainer',
    mainView: 'dashboard', // New state initialized
    pokemonDetailReturnView: 'team',
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
    setIsPokemonListModalOpen: (isOpen, target = 'team') => set({ isPokemonListModalOpen: isOpen, addPokemonTarget: target }),
    setIsSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
    setIsSuggestModalOpen: (isOpen) => set({ isSuggestModalOpen: isOpen }),
    selectPokemon: (dexID, instanceID, returnView = 'team') => {
        set({
            selectedPokemonId: { dexID, instanceID },
            isPokemonListModalOpen: false,
            pokemonDetailReturnView: returnView,
            mainView: 'dashboard', // Ensure we are on dashboard view
        });
    },
    clearSelection: () => {
        set(state => ({
            selectedPokemonId: null,
            activeView: state.pokemonDetailReturnView,
            mainView: 'dashboard', // Ensure we return to dashboard view
        }));
    },
    setUnitSettings: (settings) => {
        try {
            localStorage.setItem('pokerole-unit-settings', JSON.stringify(settings));
            set({ unitSettings: settings });
        } catch (e) {
            console.error("Failed to save unit settings to localStorage", e);
        }
    },
    setActiveView: (view) => set({ activeView: view }),
    setMainView: (view) => set(state => ({
        mainView: view,
        // When switching to GM view, close any open Pokémon detail sheet
        selectedPokemonId: view === 'gm' ? null : state.selectedPokemonId,
    })),
    setIsLoading: (isLoading) => set({ isLoading }),
}));