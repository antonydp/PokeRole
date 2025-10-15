import { StateCreator } from 'zustand';
import { Pokedex, PokemonData, Rank, TeamMember } from '../../types';
import { useUIStore } from '../useUIStore';
import useNotificationStore from '../useNotificationStore';
import { RANK_ATTRIBUTE_POINTS, RANK_SOCIAL_ATTRIBUTE_POINTS, RANK_SKILL_POINTS } from '../../logic/core';
import { createInitialSheetData } from '../../logic/initializers';
import { SessionState } from '../useSessionStore';

export interface EvolutionSlice {
    initiatePermanentEvolution: (instanceID: string, targetPokedex: Pokedex) => void;
    finalizePermanentEvolution: (instanceID: string, finalSheetData: PokemonData) => void;
    applyOverrank: (instanceID: string, moveId: string) => void;
    changeForm: (instanceID: string, formPokedex: Pokedex | null, currentSheetData?: PokemonData) => void;
}

export const createEvolutionSlice: StateCreator<
    SessionState,
    [],
    [],
    EvolutionSlice
> = (set, get) => ({
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
            oldMoves: member.sheetData.moves,
        });
    },
    finalizePermanentEvolution: (instanceID, finalSheetData) => {
        const { evolutionState } = useUIStore.getState();
        if (!evolutionState.isOpen || !evolutionState.newPokedexData || !evolutionState.selectedEvolution) return;

        const evolutionMethod = evolutionState.selectedEvolution;

        if (evolutionMethod.Kind === 'Stone' && evolutionMethod.Item) {
            const itemRemoved = get().removeItemByName(evolutionMethod.Item);
            if (itemRemoved) {
                useNotificationStore.getState().addNotification({
                    message: `${evolutionMethod.Item} was used.`,
                    type: 'success',
                });
            }
        }

        set(state => ({
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
                const emptySlotIndex = newSheet.moves.indexOf(null);
                if (emptySlotIndex !== -1) {
                    newSheet.moves[emptySlotIndex] = moveId;
                } else {
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

                if (updatedMember.currentFormName && currentSheetData) {
                    const formToSaveName = updatedMember.currentFormName;
                    if (updatedMember.forms?.[formToSaveName]) {
                        updatedMember.forms[formToSaveName].sheetData = currentSheetData;
                    }
                }

                if (formPokedex === null) {
                    updatedMember.currentFormName = null;
                    return updatedMember;
                }

                const formName = formPokedex.Name;
                const existingForms = updatedMember.forms || {};
                let formExists = !!existingForms[formName];

                const newForms = { ...existingForms };
                if (!formExists) {
                    const newSheetData = createInitialSheetData(formPokedex, unitSettings, trainerData.trainerRank);
                    newForms[formName] = {
                        pokedexData: formPokedex,
                        sheetData: newSheetData,
                    };
                }

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
});