// src/store/useSavedDataStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SavedEncounter, SavedNPC } from '../types';

interface SavedDataState {
  savedEncounters: SavedEncounter[];
  savedNPCs: SavedNPC[];
  saveEncounter: (encounter: Omit<SavedEncounter, 'id'>) => void;
  deleteEncounter: (id: string) => void;
  updateEncounterName: (id: string, name: string) => void;
  saveNPC: (npc: Omit<SavedNPC, 'id'>) => void;
  deleteNPC: (id: string) => void;
  updateNPCName: (id: string, name: string) => void;
}

export const useSavedDataStore = create<SavedDataState>()(
  persist(
    (set) => ({
      savedEncounters: [],
      savedNPCs: [],
      saveEncounter: (encounter) =>
        set((state) => ({
          savedEncounters: [...state.savedEncounters, { ...encounter, id: crypto.randomUUID() }],
        })),
      deleteEncounter: (id) =>
        set((state) => ({
          savedEncounters: state.savedEncounters.filter((e) => e.id !== id),
        })),
      updateEncounterName: (id, name) =>
        set((state) => ({
          savedEncounters: state.savedEncounters.map((e) =>
            e.id === id ? { ...e, name } : e
          ),
        })),
      saveNPC: (npc) =>
        set((state) => ({
          savedNPCs: [...state.savedNPCs, { ...npc, id: crypto.randomUUID() }],
        })),
      deleteNPC: (id) =>
        set((state) => ({
          savedNPCs: state.savedNPCs.filter((n) => n.id !== id),
        })),
      updateNPCName: (id, name) =>
        set((state) => ({
          savedNPCs: state.savedNPCs.map((n) =>
            n.id === id ? { ...n, name } : n
          ),
        })),
    }),
    {
      name: 'pokerole-saved-gm-data',
      storage: createJSONStorage(() => localStorage),
    }
  )
);