import { create } from 'zustand';

type UnitSettings = { height: 'imperial' | 'metric'; weight: 'imperial' | 'metric' };
type SelectedPokemon = { dexID: string; instanceID?: string };

interface UIState {
    isSidebarOpen: boolean;
    isSettingsOpen: boolean;
    isSuggestModalOpen: boolean;
    selectedPokemonId: SelectedPokemon | null;
    unitSettings: UnitSettings;
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
}));