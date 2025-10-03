import { create } from 'zustand';
import React from 'react';
import { Pokedex, Move, Ability, TeamMember, PokemonData, TrainerData, ItemsData, ItemInstance, Ribbon, Badge } from '../types/index.js';
import { fetchAllData } from '../../services/pokedexService.js';
import { createInitialSheetData, createInitialTrainerData } from '../logic/initializers.js';
import { calculateWeaknesses } from '../logic/formulas.js';
import pako from 'pako';

type UnitSettings = { height: 'imperial' | 'metric'; weight: 'imperial' | 'metric' };
type SelectedPokemon = { dexID: string; instanceID?: string };

interface AppState {
    // State
    allPokemon: Pokedex[];
    allMoves: Record<string, Move>;
    allAbilities: Record<string, Ability>;
    allItems: ItemsData | null;
    ribbonsData: Ribbon[];
    allBadges: Badge[];
    team: TeamMember[];
    trainerData: TrainerData;
    selectedPokemonId: SelectedPokemon | null;
    isLoading: boolean;
    error: string | null;
    isSidebarOpen: boolean;
    isSettingsOpen: boolean;
    isSuggestModalOpen: boolean;
    unitSettings: UnitSettings;

    // Computed
    selectedPokemon: () => Pokedex | null;
    selectedTeamMember: () => TeamMember | null;
    isPokemonInTeam: (dexId: string) => boolean;

    // Actions
    loadData: () => Promise<void>;
    selectPokemon: (dexID: string, instanceID?: string) => void;
    clearSelection: () => void;
    addToTeam: (pokemon: Pokedex, sheetData: PokemonData) => void;
    removeFromTeam: (instanceID: string) => void;
    openSidebar: () => void;
    updateSheetData: (instanceID: string, newSheetData: PokemonData) => void;
    updateTrainerData: (updater: ((prev: TrainerData) => TrainerData) | TrainerData) => void;
    exportTeam: () => void;
    loadTeam: (event: React.ChangeEvent<HTMLInputElement>) => void;
    addSuggestionToTeam: (pokemon: Pokedex) => void;
    quickImport: (importString: string) => void;
    quickExport: (teamMember: TeamMember) => void;
    setIsSidebarOpen: (isOpen: boolean) => void;
    setIsSettingsOpen: (isOpen: boolean) => void;
    setIsSuggestModalOpen: (isOpen: boolean) => void;
    setUnitSettings: (settings: UnitSettings) => void;
}

const useStore = create<AppState>((set, get) => ({
    // Initial State
    allPokemon: [],
    allMoves: {},
    allAbilities: {},
    allItems: null,
    ribbonsData: [],
    allBadges: [],
    team: [],
    trainerData: createInitialTrainerData(),
    selectedPokemonId: null,
    isLoading: true,
    error: null,
    isSidebarOpen: false,
    isSettingsOpen: false,
    isSuggestModalOpen: false,
    unitSettings: (() => {
        try {
            const saved = localStorage.getItem('pokerole-unit-settings');
            return saved ? JSON.parse(saved) : { height: 'imperial', weight: 'imperial' };
        } catch (e) {
            console.error("Failed to parse unit settings from localStorage", e);
            return { height: 'imperial', weight: 'imperial' };
        }
    })(),

    // Computed getters
    selectedPokemon: () => {
        const { selectedPokemonId, allPokemon } = get();
        if (!selectedPokemonId) return null;
        return allPokemon.find(p => p.DexID === selectedPokemonId.dexID) || null;
    },
    selectedTeamMember: () => {
        const { selectedPokemonId, team } = get();
        if (!selectedPokemonId?.instanceID) return null;
        return team.find(m => m.instanceID === selectedPokemonId.instanceID) || null;
    },
    isPokemonInTeam: (dexId: string) => {
        const { team } = get();
        return team.some(member => member.pokedexData.DexID === dexId);
    },

    // Actions
    loadData: async () => {
        try {
            set({ isLoading: true, error: null });
            const { pokemonData, movesData, abilitiesData, itemsData, ribbonsData, badgesData } = await fetchAllData();
            
            const movesMap = movesData.reduce((acc, move) => {
                acc[move._id] = move;
                return acc;
            }, {} as Record<string, Move>);

            const abilitiesMap = abilitiesData.reduce((acc, ability) => {
                acc[ability._id] = ability;
                return acc;
            }, {} as Record<string, Ability>);

            set({
                allPokemon: pokemonData,
                allMoves: movesMap,
                allAbilities: abilitiesMap,
                allItems: itemsData,
                ribbonsData: ribbonsData,
                allBadges: badgesData,
                isLoading: false
            });
        } catch (err) {
            set({ error: 'Failed to fetch Pokémon data. Please try again.', isLoading: false });
            console.error(err);
        }
    },
    selectPokemon: (dexID, instanceID) => {
        set({ selectedPokemonId: { dexID, instanceID }, isSidebarOpen: false });
    },
    clearSelection: () => {
        set({ selectedPokemonId: null });
    },
    addToTeam: (pokemon, sheetData) => {
        set(state => {
            if (state.team.length < 6) {
                const newMember: TeamMember = {
                    instanceID: crypto.randomUUID(),
                    pokedexData: pokemon,
                    sheetData: sheetData,
                };
                return { team: [...state.team, newMember] };
            }
            return {};
        });
    },
    removeFromTeam: (instanceID) => {
        set(state => ({
            team: state.team.filter(member => member.instanceID !== instanceID),
            selectedPokemonId: state.selectedPokemonId?.instanceID === instanceID ? null : state.selectedPokemonId
        }));
    },
    openSidebar: () => {
        set({ isSidebarOpen: true });
    },
    updateSheetData: (instanceID, newSheetData) => {
        set(state => ({
            team: state.team.map(member =>
                member.instanceID === instanceID
                    ? { ...member, sheetData: newSheetData }
                    : member
            )
        }));
    },
    updateTrainerData: (updater) => {
        set(state => ({
            trainerData: typeof updater === 'function' ? updater(state.trainerData) : updater
        }));
    },
    exportTeam: () => {
        const { team, trainerData, unitSettings } = get();
        if (team.length === 0 && !trainerData.name) {
            alert("Your team and trainer sheet are empty!");
            return;
        }
        try {
            const dataStr = JSON.stringify({ team, trainer: trainerData, unitSettings }, null, 2);
            const dataBlob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'pokerole-session.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            set({ error: 'Failed to export data. Please try again.' });
            console.error('Export error:', err);
        }
    },
    loadTeam: (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result;
                if (typeof content !== 'string') throw new Error("File content could not be read as text.");
                
                const loadedData = JSON.parse(content);
                const loadedTeam: TeamMember[] = loadedData.team || [];
                const loadedSettings: UnitSettings | undefined = loadedData.unitSettings;
                const loadedTrainer: TrainerData | undefined = loadedData.trainer;

                if (!Array.isArray(loadedTeam) || loadedTeam.some(m => !m.pokedexData || !m.sheetData)) {
                    throw new Error("Invalid team data format.");
                }

                if (loadedSettings) get().setUnitSettings(loadedSettings);

                if (loadedTrainer) {
                    const parsePocketString = (pocketString: string): ItemInstance[] => {
                        if (!pocketString || typeof pocketString !== 'string') return [];
                        const itemMap = new Map<string, number>();
                        pocketString.split('\n').forEach(line => {
                            if (!line.trim()) return;
                            const match = line.match(/^(.*)\s+x(\d+)$/i);
                            let name = line.trim();
                            let quantity = 1;
                            if (match) {
                                name = match[1].trim();
                                quantity = parseInt(match[2], 10);
                            }
                            itemMap.set(name, (itemMap.get(name) || 0) + quantity);
                        });
                        return Array.from(itemMap.entries()).map(([name, quantity], index) => ({
                            id: `${name.replace(/\s+/g, '-')}-${index}`,
                            name,
                            quantity,
                        }));
                    };

                    if (typeof (loadedTrainer.smallPocket as any) === 'string') {
                        loadedTrainer.smallPocket = parsePocketString(loadedTrainer.smallPocket as any);
                    }
                    if (typeof (loadedTrainer.mainPocket as any) === 'string') {
                         loadedTrainer.mainPocket = parsePocketString(loadedTrainer.mainPocket as any);
                    }
                    set({ trainerData: loadedTrainer });
                } else {
                    set({ trainerData: createInitialTrainerData() });
                }

                const teamWithUpdatedWeaknesses = loadedTeam.map(member => ({
                    ...member,
                    instanceID: member.instanceID || crypto.randomUUID(),
                    sheetData: {
                        ...member.sheetData,
                        weakness: calculateWeaknesses(member.pokedexData.Type1, member.pokedexData.Type2),
                    }
                }));

                set({ team: teamWithUpdatedWeaknesses.slice(0, 6), error: null, selectedPokemonId: null });
            } catch (err) {
                console.error("Failed to load data:", err);
                set({ error: "Failed to load data. The file might be corrupted or in an incorrect format." });
            }
        };
        reader.onerror = () => set({ error: "Failed to read the selected file." });
        reader.readAsText(file);
        event.target.value = '';
    },
    addSuggestionToTeam: (pokemon) => {
        const { team, unitSettings, trainerData } = get();
        if (team.length < 6) {
            const sheetData = createInitialSheetData(pokemon, unitSettings, trainerData.trainerRank);
            const newMember: TeamMember = {
                instanceID: crypto.randomUUID(),
                pokedexData: pokemon,
                sheetData: sheetData,
            };
            set(state => ({ team: [...state.team, newMember] }));
        }
    },
    quickImport: (importString) => {
        const { allPokemon } = get();
        try {
            const binaryString = atob(importString);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
            
            const decompressed = pako.inflate(bytes, { to: 'string' });
            const importedMember: Omit<TeamMember, 'instanceID'> = JSON.parse(decompressed);

            if (importedMember.pokedexData && importedMember.sheetData) {
                if (!allPokemon.some(p => p.DexID === importedMember.pokedexData.DexID)) {
                    alert(`Imported Pokémon with DexID ${importedMember.pokedexData.DexID} does not exist.`);
                    return;
                }
                const newMember: TeamMember = { ...importedMember, instanceID: crypto.randomUUID() };
                set(state => {
                    const newTeam = [...state.team];
                    const firstEmptyIndex = newTeam.findIndex(member => !member);
                    if (firstEmptyIndex !== -1) newTeam[firstEmptyIndex] = newMember;
                    else newTeam.push(newMember);
                    return { team: newTeam.slice(0, 6) };
                });
            } else {
                throw new Error("Invalid imported data structure.");
            }
        } catch (e) {
            alert("Invalid import string.");
            console.error("Quick import error:", e);
        }
    },
    quickExport: (teamMember) => {
        try {
            const dataStr = JSON.stringify(teamMember);
            const compressed = pako.deflate(dataStr);
            const base64Str = btoa(String.fromCharCode.apply(null, compressed as unknown as number[]));
            navigator.clipboard.writeText(base64Str);
            alert(`${teamMember.pokedexData.Name} export data copied to clipboard!`);
        } catch (err) {
            set({ error: 'Failed to export Pokémon data.' });
            console.error('Export error:', err);
        }
    },
    setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
    setIsSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
    setIsSuggestModalOpen: (isOpen) => set({ isSuggestModalOpen: isOpen }),
    setUnitSettings: (settings) => {
        try {
            localStorage.setItem('pokerole-unit-settings', JSON.stringify(settings));
            set({ unitSettings: settings });

            // Update team members with new units
            set(state => ({
                team: state.team.map(member => {
                    const { pokedexData } = member;
                    const feet = Math.floor(pokedexData.Height.Feet);
                    const inches = Math.round((pokedexData.Height.Feet % 1) * 12);
                    const newSize = settings.height === 'imperial' ? `${feet}'${inches}"` : `${pokedexData.Height.Meters}m`;
                    const newWeight = settings.weight === 'imperial' ? `${pokedexData.Weight.Pounds} lbs` : `${pokedexData.Weight.Kilograms}kg`;
                    return {
                        ...member,
                        sheetData: { ...member.sheetData, size: newSize, weight: newWeight }
                    };
                })
            }));
        } catch (e) {
            console.error("Failed to save unit settings to localStorage", e);
        }
    },
}));

export default useStore;