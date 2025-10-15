import React from 'react';
import { StateCreator } from 'zustand';
import pako from 'pako';
import { Pokedex, TeamMember, PokemonData, TrainerData, ItemInstance } from '../../types';
import { useUIStore } from '../useUIStore';
import { useGameDataStore } from '../useGameDataStore';
import useNotificationStore from '../useNotificationStore';
import { createInitialTrainerData } from '../../logic/initializers';
import { calculateWeaknesses } from '../../logic/formulas';
import { SessionState } from '../useSessionStore';

export interface ImportExportSlice {
    exportTeam: () => void;
    loadTeam: (event: React.ChangeEvent<HTMLInputElement>) => void;
    quickImport: (importString: string) => void;
    quickExport: (teamMember: TeamMember) => void;
}

export const createImportExportSlice: StateCreator<
    SessionState,
    [],
    [],
    ImportExportSlice
> = (set, get) => ({
    exportTeam: () => {
        const { team, trainerData, pokemonPC } = get();
        const { unitSettings } = useUIStore.getState();
        const { savedEncounters, savedNPCs } = useGameDataStore.getState();
        if (team.length === 0 && !trainerData.name) {
            useNotificationStore.getState().addNotification({
                message: "Your team and trainer sheet are empty!",
                type: 'warning',
            });
            return;
        }
        try {
            const dataStr = JSON.stringify({ team, pokemonPC, trainer: trainerData, unitSettings, savedEncounters, savedNPCs }, null, 2);
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
                message: `Export failed: ${(err as Error).message}`,
                type: 'error',
            });
        }
    },
    loadTeam: (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        useUIStore.getState().setIsLoading(true);
    
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
                const loadedEncounters = loadedData.savedEncounters || [];
                const loadedNPCs = loadedData.savedNPCs || [];
    
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
    
                useGameDataStore.setState({ savedEncounters: loadedEncounters, savedNPCs: loadedNPCs });
                set({ team: teamWithUpdatedWeaknesses.slice(0, 6), pokemonPC: pcWithUpdatedWeaknesses });
                useUIStore.getState().clearSelection();
                useNotificationStore.getState().addNotification({
                    message: 'Session data loaded successfully!',
                    type: 'success',
                });
            } catch (err) {
                console.error("Failed to load data:", err);
                useNotificationStore.getState().addNotification({
                    message: `Failed to load data: ${(err as Error).message}`,
                    type: 'error',
                });
            } finally {
                useUIStore.getState().setIsLoading(false);
            }
        };
        reader.onerror = () => {
            console.error("Failed to read the selected file.");
            useUIStore.getState().setIsLoading(false);
        }
        reader.readAsText(file);
        event.target.value = '';
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
                message: `Quick export failed: ${(err as Error).message}`,
                type: 'error',
            });
        }
    },
});