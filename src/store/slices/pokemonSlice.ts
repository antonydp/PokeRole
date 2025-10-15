import { StateCreator } from 'zustand';
import { Pokedex, TeamMember, PokemonData, TrainerData } from '../../types';
import { useUIStore } from '../useUIStore';
import useNotificationStore from '../useNotificationStore';
import { createInitialSheetData } from '../../logic/initializers';
import { SessionState } from '../useSessionStore';

export interface PokemonSlice {
    team: TeamMember[];
    pokemonPC: TeamMember[];
    addToTeam: (pokemon: Pokedex, sheetData: PokemonData) => TeamMember | null;
    addToPC: (pokemon: Pokedex, sheetData: PokemonData) => TeamMember;
    removeFromTeam: (instanceID: string) => void;
    removeFromPC: (instanceID: string) => void;
    moveFromPCToTeam: (instanceID: string) => void;
    moveFromTeamToPC: (instanceID: string) => void;
    updateSheetData: (instanceID: string, updater: PokemonData | ((prev: PokemonData) => PokemonData)) => void;
    addSuggestionToTeam: (pokemon: Pokedex) => void;
}

export const createPokemonSlice: StateCreator<
    SessionState,
    [],
    [],
    PokemonSlice
> = (set, get) => ({
    team: [],
    pokemonPC: [],
    addToTeam: (pokemon, sheetData) => {
        const { team } = get();
        if (team.length >= 6) {
            useNotificationStore.getState().addNotification({
                message: "Your team is full! Can't add.",
                type: 'warning',
            });
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
});