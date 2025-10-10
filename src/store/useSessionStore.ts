import { create } from 'zustand';
import React from 'react';
import { Pokedex, TeamMember, PokemonData, TrainerData, ItemInstance, Rank } from '../types/index.ts';
import { createInitialTrainerData, createInitialSheetData } from '../logic/initializers.ts';
import { calculateWeaknesses } from '../logic/formulas.ts';
import pako from 'pako';
import { useUIStore } from './useUIStore.ts';
import { useGameDataStore } from './useGameDataStore.ts';
import { RANK_ATTRIBUTE_POINTS, RANK_SOCIAL_ATTRIBUTE_POINTS, RANK_SKILL_POINTS } from '../logic/core.ts';
import { POKEMON_SKILL_FIELDS } from '../constants/gameConstants.js'; // You'll need to export this
import useNotificationStore from './useNotificationStore.js';


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
    pokemonPC: TeamMember[];
    trainerData: TrainerData;
    addToTeam: (pokemon: Pokedex, sheetData: PokemonData) => TeamMember | null;
    addToPC: (pokemon: Pokedex, sheetData: PokemonData) => TeamMember;
    removeFromTeam: (instanceID: string) => void;
    removeFromPC: (instanceID: string) => void;
    moveFromPCToTeam: (instanceID: string) => void;
    moveFromTeamToPC: (instanceID: string) => void;
    updateSheetData: (instanceID: string, updater: PokemonData | ((prev: PokemonData) => PokemonData)) => void;
    updateTrainerData: (updater: ((prev: TrainerData) => TrainerData) | TrainerData) => void;
    exportTeam: () => void;
    loadTeam: (event: React.ChangeEvent<HTMLInputElement>) => void;
    addSuggestionToTeam: (pokemon: Pokedex) => void;
    quickImport: (importString: string) => void;
    quickExport: (teamMember: TeamMember) => void;
    initiatePermanentEvolution: (instanceID: string, targetPokedex: Pokedex) => void;
    finalizePermanentEvolution: (instanceID: string, finalSheetData: PokemonData) => void;
    applyOverrank: (instanceID: string, moveId: string) => void;
    changeForm: (instanceID: string, formPokedex: Pokedex | null, currentSheetData?: PokemonData) => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
    team: [],
    pokemonPC: [],
    trainerData: createInitialTrainerData(),
    addToTeam: (pokemon, sheetData) => {
        const { team } = get();
        if (team.length >= 6) {
            return null;
        }
        const newMember: TeamMember = {
            instanceID: crypto.randomUUID(),
            pokedexData: pokemon,
            sheetData: sheetData,
            forms: {},
            currentFormName: null,
        };
        set({ team: [...team, newMember] });
        useNotificationStore.getState().addNotification({
            message: `${pokemon.Name} has been added to the team!`,
            type: 'success',
        });
        return newMember;
    },
    addToPC: (pokemon, sheetData) => {
        const newMember: TeamMember = {
            instanceID: crypto.randomUUID(),
            pokedexData: pokemon,
            sheetData: sheetData,
            forms: {},
            currentFormName: null,
        };
        set(state => ({ pokemonPC: [...state.pokemonPC, newMember] }));
        useNotificationStore.getState().addNotification({
            message: `${pokemon.Name} has been sent to the PC.`,
            type: 'success',
        });
        return newMember;
    },
    removeFromTeam: (instanceID) => {
        const memberToRemove = get().team.find(member => member.instanceID === instanceID);
        set(state => ({
            team: state.team.filter(member => member.instanceID !== instanceID)
        }));
        if (memberToRemove) {
            useNotificationStore.getState().addNotification({
                message: `${memberToRemove.pokedexData.Name} has been removed from the team.`,
                type: 'success',
            });
        }
        const selectedPokemonId = useUIStore.getState().selectedPokemonId;
        if (selectedPokemonId?.instanceID === instanceID) {
            useUIStore.getState().clearSelection();
        }
    },
    removeFromPC: (instanceID) => {
        const memberToRemove = get().pokemonPC.find(member => member.instanceID === instanceID);
        set(state => ({
            pokemonPC: state.pokemonPC.filter(member => member.instanceID !== instanceID)
        }));
        if (memberToRemove) {
            useNotificationStore.getState().addNotification({
                message: `${memberToRemove.pokedexData.Name} has been removed from the PC.`,
                type: 'success',
            });
        }
    },
    moveFromPCToTeam: (instanceID) => {
        set(state => {
            if (state.team.length >= 6) {
                useNotificationStore.getState().addNotification({
                    message: "Your team is full!",
                    type: 'warning',
                });
                return state;
            }
            const memberToMove = state.pokemonPC.find(member => member.instanceID === instanceID);
            if (memberToMove) {
                useNotificationStore.getState().addNotification({
                    message: `${memberToMove.pokedexData.Name} moved to the team.`,
                    type: 'success',
                });
                return {
                    team: [...state.team, memberToMove],
                    pokemonPC: state.pokemonPC.filter(member => member.instanceID !== instanceID),
                };
            }
            return state;
        });
    },
    moveFromTeamToPC: (instanceID) => {
        set(state => {
            const memberToMove = state.team.find(member => member.instanceID === instanceID);
            if (memberToMove) {
                useNotificationStore.getState().addNotification({
                    message: `${memberToMove.pokedexData.Name} moved to the PC.`,
                    type: 'success',
                });
                return {
                    team: state.team.filter(member => member.instanceID !== instanceID),
                    pokemonPC: [...state.pokemonPC, memberToMove],
                };
            }
            return state;
        });
    },
    updateSheetData: (instanceID, updater) => {
        set(state => {
            const updateMember = (member: TeamMember) => {
                if (member.instanceID !== instanceID) return member;

                // If a form is active, update that form's sheetData
                if (member.currentFormName && member.forms?.[member.currentFormName]) {
                    const formName = member.currentFormName;
                    const currentSheet = member.forms[formName].sheetData;
                    const newSheetData = typeof updater === 'function' ? updater(currentSheet) : updater;
                    const updatedForms = {
                        ...member.forms,
                        [formName]: {
                            ...member.forms[formName],
                            sheetData: newSheetData,
                        },
                    };
                    return { ...member, forms: updatedForms };
                }
                // Otherwise, update the base sheetData
                const currentSheet = member.sheetData;
                const newSheetData = typeof updater === 'function' ? updater(currentSheet) : updater;
                return { ...member, sheetData: newSheetData };
            };

            return {
                team: state.team.map(updateMember),
                pokemonPC: state.pokemonPC.map(updateMember),
            };
        });
    },
    updateTrainerData: (updater) => {
        set(state => ({
            trainerData: typeof updater === 'function' ? updater(state.trainerData) : updater
        }));
    },
    exportTeam: () => {
        const { team, trainerData, pokemonPC } = get();
        const { unitSettings } = useUIStore.getState();
        if (team.length === 0 && !trainerData.name) {
            useNotificationStore.getState().addNotification({
                message: "Your team and trainer sheet are empty!",
                type: 'warning',
            });
            return;
        }
        try {
            const dataStr = JSON.stringify({ team, pokemonPC, trainer: trainerData, unitSettings }, null, 2);
            const dataBlob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'pokerole-session.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            useNotificationStore.getState().addNotification({
                message: 'Session data exported successfully!',
                type: 'success',
            });
        } catch (err) {
            console.error('Export error:', err);
            useNotificationStore.getState().addNotification({
                message: `Export failed: ${err.message}`,
                type: 'error',
            });
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
                const loadedPC: TeamMember[] = loadedData.pokemonPC || [];
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

                const processLoadedMembers = (members: TeamMember[]): TeamMember[] => members.map(member => ({
                    ...member,
                    instanceID: member.instanceID || crypto.randomUUID(),
                    sheetData: {
                        ...member.sheetData,
                        weakness: calculateWeaknesses(member.pokedexData.Type1, member.pokedexData.Type2),
                    }
                }));

                const teamWithUpdatedWeaknesses = processLoadedMembers(loadedTeam);
                const pcWithUpdatedWeaknesses = processLoadedMembers(loadedPC);


                set({ team: teamWithUpdatedWeaknesses.slice(0, 6), pokemonPC: pcWithUpdatedWeaknesses });
                useUIStore.getState().clearSelection();
                useNotificationStore.getState().addNotification({
                    message: 'Session data loaded successfully!',
                    type: 'success',
                });
            } catch (err) {
                console.error("Failed to load data:", err);
                useNotificationStore.getState().addNotification({
                    message: `Failed to load data: ${err.message}`,
                    type: 'error',
                });
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
                forms: {},
                currentFormName: null,
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
                useNotificationStore.getState().addNotification({
                    message: `${newMember.pokedexData.Name} imported successfully!`,
                    type: 'success',
                });
            } else {
                throw new Error("Invalid imported data structure.");
            }
        } catch (e) {
            useNotificationStore.getState().addNotification({
                message: 'Invalid import string.',
                type: 'error',
            });
            console.error("Quick import error:", e);
        }
    },
    quickExport: (teamMember) => {
        try {
            const dataStr = JSON.stringify(teamMember);
            const compressed = pako.deflate(dataStr);
            const base64Str = btoa(String.fromCharCode.apply(null, compressed as unknown as number[]));
            navigator.clipboard.writeText(base64Str);
            useNotificationStore.getState().addNotification({
                message: `${teamMember.pokedexData.Name} export data copied to clipboard!`,
                type: 'success',
            });
        } catch (err) {
            console.error('Export error:', err);
            useNotificationStore.getState().addNotification({
                message: `Quick export failed: ${err.message}`,
                type: 'error',
            });
        }
    },
    initiatePermanentEvolution: (instanceID, targetPokedex) => {
        const member = get().team.find(m => m.instanceID === instanceID);
        if (!member) return;
        const currentRank = member.sheetData.rank as Rank;

        const totalPointsFromRank = {
            attributes: RANK_ATTRIBUTE_POINTS[currentRank],
            social: RANK_SOCIAL_ATTRIBUTE_POINTS[currentRank],
            skills: RANK_SKILL_POINTS[currentRank]
        };
        
        useUIStore.getState().setEvolutionStep('REDISTRIBUTE', {
            bonusPoints: totalPointsFromRank,
            newPokedexData: targetPokedex,
            oldMoves: member.sheetData.moves, // Pass current moves
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
                            victories: '0',
                            moves: finalSheetData.moves.map((_, i) => evolutionState.oldMoves?.[i] || null),
                        }
                      }
                    : m
            )
        }));

        useNotificationStore.getState().addNotification({
            message: `The Pokémon evolved into ${evolutionState.newPokedexData.Name}!`,
            type: 'success',
        });
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

    changeForm: (instanceID, formPokedex: Pokedex | null, currentSheetData?: PokemonData) => {
        const { trainerData } = get();
        const { unitSettings } = useUIStore.getState();

        set(state => {
            const team = state.team.map(member => {
                if (member.instanceID !== instanceID) return member;

                const updatedMember = { ...member };

                // If there's a current form and sheet data is provided, save it before switching
                if (updatedMember.currentFormName && currentSheetData) {
                    const formToSaveName = updatedMember.currentFormName;
                    if (updatedMember.forms?.[formToSaveName]) {
                        updatedMember.forms[formToSaveName].sheetData = currentSheetData;
                    }
                }

                // Reverting to base form
                if (formPokedex === null) {
                    updatedMember.currentFormName = null;
                    return updatedMember;
                }

                const formName = formPokedex.Name;
                const existingForms = updatedMember.forms || {};
                let formExists = !!existingForms[formName];

                // Create form if it doesn't exist
                const newForms = { ...existingForms };
                if (!formExists) {
                    const newSheetData = createInitialSheetData(formPokedex, unitSettings, trainerData.trainerRank);
                    newForms[formName] = {
                        pokedexData: formPokedex,
                        sheetData: newSheetData,
                    };
                }

                // Open moveset modal only if the form is brand new, otherwise close the evolution modal
                if (!formExists) {
                    useUIStore.getState().setEvolutionStep('MOVESET');
                } else {
                    useUIStore.getState().closeEvolutionModal();
                }

                useNotificationStore.getState().addNotification({
                    message: `Form changed to ${formName}.`,
                    type: 'success',
                });

                return {
                    ...updatedMember,
                    forms: newForms,
                    currentFormName: formName,
                };
            });
            return { team };
        });
    },
}));