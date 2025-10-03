import { create } from 'zustand';
import React from 'react';
import { Pokedex, TeamMember, PokemonData, TrainerData, ItemInstance, Rank } from '../types/index.js';
import { createInitialTrainerData, createInitialSheetData } from '../logic/initializers.js';
import { calculateWeaknesses } from '../logic/formulas.js';
import pako from 'pako';
import { useUIStore } from './useUIStore.js';
import { useGameDataStore } from './useGameDataStore.js';
import { RANK_ATTRIBUTE_POINTS, RANK_SOCIAL_ATTRIBUTE_POINTS, RANK_SKILL_POINTS } from '../logic/core.js';
import { POKEMON_SKILL_FIELDS } from '../constants/gameConstants.js'; // You'll need to export this

// Helper function to calculate points spent on a sheet
function calculateSpentPoints(sheetData: PokemonData, pokedexData: Pokedex) {
    const spentAttributes =
        ((sheetData.strength ?? pokedexData.Strength) - pokedexData.Strength) +
        ((sheetData.dexterity ?? pokedexData.Dexterity) - pokedexData.Dexterity) +
        ((sheetData.vitality ?? pokedexData.Vitality) - pokedexData.Vitality) +
        ((sheetData.special ?? pokedexData.Special) - pokedexData.Special) +
        ((sheetData.insight ?? pokedexData.Insight) - pokedexData.Insight);

    const spentSocial =
        ((sheetData.tough ?? 1) - 1) + ((sheetData.cool ?? 1) - 1) +
        ((sheetData.beauty ?? 1) - 1) + ((sheetData.cute ?? 1) - 1) +
        ((sheetData.clever ?? 1) - 1);

    const spentSkills = POKEMON_SKILL_FIELDS.reduce((acc, field) => acc + (sheetData[field] as number || 0), 0);

    return { attributes: spentAttributes, social: spentSocial, skills: spentSkills };
}

// Helper function to remove one instance of an item from a pocket
const removeItemFromPockets = (pockets: { smallPocket: ItemInstance[], mainPocket: ItemInstance[] }, itemName: string) => {
    const newPockets = { ...pockets };
    let itemFoundAndRemoved = false;

    for (const pocketName of ['smallPocket', 'mainPocket'] as const) {
        const pocket = newPockets[pocketName];
        const itemIndex = pocket.findIndex(i => i.name.toLowerCase() === itemName.toLowerCase());

        if (itemIndex > -1) {
            if (pocket[itemIndex].quantity > 1) {
                pocket[itemIndex] = { ...pocket[itemIndex], quantity: pocket[itemIndex].quantity - 1 };
            } else {
                newPockets[pocketName] = pocket.filter((_, i) => i !== itemIndex);
            }
            itemFoundAndRemoved = true;
            break; // Exit after removing one item
        }
    }
    return newPockets;
};


interface SessionState {
    team: TeamMember[];
    trainerData: TrainerData;
    addToTeam: (pokemon: Pokedex, sheetData: PokemonData) => void;
    removeFromTeam: (instanceID: string) => void;
    updateSheetData: (instanceID: string, newSheetData: PokemonData) => void;
    updateTrainerData: (updater: ((prev: TrainerData) => TrainerData) | TrainerData) => void;
    exportTeam: () => void;
    loadTeam: (event: React.ChangeEvent<HTMLInputElement>) => void;
    addSuggestionToTeam: (pokemon: Pokedex) => void;
    quickImport: (importString: string) => void;
    quickExport: (teamMember: TeamMember) => void;
    isPokemonInTeam: (dexId: string) => boolean;
    selectedTeamMember: () => TeamMember | null;
    // ... existing state
    initiatePermanentEvolution: (instanceID: string, targetPokedex: Pokedex) => void;
    finalizePermanentEvolution: (instanceID: string, finalSheetData: PokemonData) => void;
    applyOverrank: (instanceID: string, moveId: string) => void;
    applyTemporaryForm: (instanceID: string, formPokedex: Pokedex) => void;
    revertTemporaryForm: (instanceID: string) => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
    team: [],
    trainerData: createInitialTrainerData(),
    isPokemonInTeam: (dexId: string) => {
        const { team } = get();
        return team.some(member => member.pokedexData.DexID === dexId);
    },
    selectedTeamMember: () => {
        const selectedPokemonId = useUIStore.getState().selectedPokemonId;
        const { team } = get();
        if (!selectedPokemonId?.instanceID) return null;
        return team.find(m => m.instanceID === selectedPokemonId.instanceID) || null;
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
            team: state.team.filter(member => member.instanceID !== instanceID)
        }));
        const selectedPokemonId = useUIStore.getState().selectedPokemonId;
        if (selectedPokemonId?.instanceID === instanceID) {
            useUIStore.getState().clearSelection();
        }
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
        const { team, trainerData } = get();
        const { unitSettings } = useUIStore.getState();
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
                const loadedSettings: { height: 'imperial' | 'metric'; weight: 'imperial' | 'metric' } | undefined = loadedData.unitSettings;
                const loadedTrainer: TrainerData | undefined = loadedData.trainer;

                if (!Array.isArray(loadedTeam) || loadedTeam.some(m => !m.pokedexData || !m.sheetData)) {
                    throw new Error("Invalid team data format.");
                }

                if (loadedSettings) useUIStore.getState().setUnitSettings(loadedSettings);

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

                set({ team: teamWithUpdatedWeaknesses.slice(0, 6) });
                useUIStore.getState().clearSelection();
            } catch (err) {
                console.error("Failed to load data:", err);
            }
        };
        reader.onerror = () => console.error("Failed to read the selected file.");
        reader.readAsText(file);
        event.target.value = '';
    },
    addSuggestionToTeam: (pokemon) => {
        const { team, trainerData } = get();
        const { unitSettings } = useUIStore.getState();
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
        const { allPokemon } = useGameDataStore.getState();
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
            console.error('Export error:', err);
        }
    },
    initiatePermanentEvolution: (instanceID, targetPokedex) => {
        const member = get().team.find(m => m.instanceID === instanceID);
        if (!member) return;

        const spentPoints = calculateSpentPoints(member.sheetData, member.pokedexData);
        
        useUIStore.getState().setEvolutionStep('REDISTRIBUTE', {
            bonusPoints: spentPoints,
            newPokedexData: targetPokedex,
        });
    },

    finalizePermanentEvolution: (instanceID, finalSheetData) => {
        const { evolutionState } = useUIStore.getState();
        const { trainerData } = get();
        if (!evolutionState.isOpen || !evolutionState.newPokedexData || !evolutionState.selectedEvolution) return;

        let newTrainerData = { ...trainerData };
        const evolutionMethod = evolutionState.selectedEvolution;

        // Consume the item if it's a stone evolution
        if (evolutionMethod.Kind === 'Stone' && evolutionMethod.Item) {
            const { smallPocket, mainPocket } = removeItemFromPockets(
                { smallPocket: trainerData.smallPocket, mainPocket: trainerData.mainPocket },
                evolutionMethod.Item
            );
            newTrainerData.smallPocket = smallPocket;
            newTrainerData.mainPocket = mainPocket;
        }

        set(state => ({
            trainerData: newTrainerData, // Update trainer data with removed item
            team: state.team.map(m =>
                m.instanceID === instanceID
                    ? {
                        ...m,
                        pokedexData: evolutionState.newPokedexData!,
                        sheetData: {
                            ...finalSheetData,
                            victories: '0'
                        }
                      }
                    : m
            )
        }));

        useUIStore.getState().setEvolutionStep('MOVESET');
    },

    applyOverrank: (instanceID, moveId) => {
        set(state => ({
            team: state.team.map(m => {
                if (m.instanceID !== instanceID) return m;

                const newSheet = { ...m.sheetData, victories: '0' };
                // Add move to the first available slot
                const emptySlotIndex = newSheet.moves.indexOf(null);
                if (emptySlotIndex !== -1) {
                    newSheet.moves[emptySlotIndex] = moveId;
                } else { // Or replace the last move if full
                    newSheet.moves[newSheet.moves.length - 1] = moveId;
                }
                return { ...m, sheetData: newSheet };
            })
        }));
        useUIStore.getState().closeEvolutionModal();
    },

    applyTemporaryForm: (instanceID, formPokedex) => {
        // This handles Mega Evolution
        set(state => ({
            team: state.team.map(m =>
                m.instanceID === instanceID ? { ...m, temporaryForm: formPokedex } : m
            )
        }));
        
        // In a real game, you wouldn't close the modal, but for this app it makes sense.
        // The UI will now re-render with the new stats.
        useUIStore.getState().closeEvolutionModal();
    },

    revertTemporaryForm: (instanceID) => {
        set(state => ({
            team: state.team.map(m => {
                if (m.instanceID === instanceID) {
                    const { temporaryForm, ...rest } = m; // Destructure to remove the temporary form
                    return rest;
                }
                return m;
            })
        }));
    },
}));