/**
 * @file This custom hook manages the global application state and logic.
 * It encapsulates the state for Pokémon data, team, trainer, and settings,
 * providing a clean interface for the main App component.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Pokedex, Move, Ability, TeamMember, PokemonData, TrainerData, ItemsData, ItemInstance, Ribbon, Badge } from '../types/index.js';
import { fetchAllData } from '../../services/pokedexService.js';
import { createInitialSheetData, createInitialTrainerData } from '../logic/initializers.js';
import { calculateWeaknesses } from '../logic/formulas.js';
import pako from 'pako';

type UnitSettings = { height: 'imperial' | 'metric'; weight: 'imperial' | 'metric' };
type SelectedPokemon = { dexID: string; instanceID?: string };

export const useAppContext = () => {
    const [allPokemon, setAllPokemon] = useState<Pokedex[]>([]);
    const [allMoves, setAllMoves] = useState<Record<string, Move>>({});
    const [allAbilities, setAllAbilities] = useState<Record<string, Ability>>({});
    const [allItems, setAllItems] = useState<ItemsData | null>(null);
    const [ribbonsData, setRibbonsData] = useState<Ribbon[]>([]);
    const [allBadges, setAllBadges] = useState<Badge[]>([]);
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [trainerData, setTrainerData] = useState<TrainerData>(createInitialTrainerData());
    const [selectedPokemonId, setSelectedPokemonId] = useState<SelectedPokemon | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [unitSettings, setUnitSettings] = useState<UnitSettings>(() => {
        try {
            const saved = localStorage.getItem('pokerole-unit-settings');
            return saved ? JSON.parse(saved) : { height: 'imperial', weight: 'imperial' };
        } catch (e) {
            console.error("Failed to parse unit settings from localStorage", e);
            return { height: 'imperial', weight: 'imperial' };
        }
    });

    const selectedPokemon = useMemo(() => {
        if (!selectedPokemonId) return null;
        return allPokemon.find(p => p.DexID === selectedPokemonId.dexID) || null;
    }, [selectedPokemonId, allPokemon]);

    const selectedTeamMember = useMemo(() => {
        if (!selectedPokemonId?.instanceID) return null;
        return team.find(m => m.instanceID === selectedPokemonId.instanceID) || null;
    }, [selectedPokemonId, team]);

    useEffect(() => {
        try {
            localStorage.setItem('pokerole-unit-settings', JSON.stringify(unitSettings));
        } catch (e) {
            console.error("Failed to save unit settings to localStorage", e);
        }
    }, [unitSettings]);
    
    useEffect(() => {
        setTeam(prevTeam =>
            prevTeam.map(member => {
                const { pokedexData } = member;
                const feet = Math.floor(pokedexData.Height.Feet);
                const inches = Math.round((pokedexData.Height.Feet % 1) * 12);
                
                const newSize = unitSettings.height === 'imperial'
                    ? `${feet}'${inches}"`
                    : `${pokedexData.Height.Meters}m`;
                
                const newWeight = unitSettings.weight === 'imperial'
                    ? `${pokedexData.Weight.Pounds} lbs`
                    : `${pokedexData.Weight.Kilograms}kg`;
                
                return {
                    ...member,
                    sheetData: {
                        ...member.sheetData,
                        size: newSize,
                        weight: newWeight,
                    }
                };
            })
        );
    }, [unitSettings]);


    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const { pokemonData, movesData, abilitiesData, itemsData, ribbonsData, badgesData } = await fetchAllData();
            
            const movesMap = movesData.reduce((acc, move) => {
                acc[move._id] = move;
                return acc;
            }, {} as Record<string, Move>);

            const abilitiesMap = abilitiesData.reduce((acc, ability) => {
                acc[ability._id] = ability;
                return acc;
            }, {} as Record<string, Ability>);

            setAllPokemon(pokemonData);
            setAllMoves(movesMap);
            setAllAbilities(abilitiesMap);
            setAllItems(itemsData);
            setRibbonsData(ribbonsData);
            setAllBadges(badgesData);
        } catch (err) {
            setError('Failed to fetch Pokémon data. The servers might be down or your connection is unstable. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    const handleSelectPokemon = useCallback((dexID: string, instanceID?: string) => {
        setSelectedPokemonId({ dexID, instanceID });
        setIsSidebarOpen(false);
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedPokemonId(null);
    }, []);

    const handleAddToTeam = useCallback((pokemon: Pokedex, sheetData: PokemonData) => {
        if (team.length < 6) {
            const newMember: TeamMember = {
                instanceID: crypto.randomUUID(),
                pokedexData: pokemon,
                sheetData: sheetData,
            };
            setTeam(prevTeam => [...prevTeam, newMember]);
        }
    }, [team.length]);

    const handleRemoveFromTeam = useCallback((instanceID: string) => {
        setTeam(prevTeam => prevTeam.filter(member => member.instanceID !== instanceID));
        setSelectedPokemonId(null);
    }, []);
    
    const handleAddPokemonClick = useCallback(() => {
        setIsSidebarOpen(true);
    }, []);
    
    const handleSheetDataChange = useCallback((instanceID: string, newSheetData: PokemonData) => {
        setTeam(prevTeam =>
            prevTeam.map(member =>
                member.instanceID === instanceID
                    ? { ...member, sheetData: newSheetData }
                    : member
            )
        );
    }, []);

    const handleTrainerDataChange = useCallback((data: TrainerData) => {
        setTrainerData(data);
    }, []);

    const handleExportTeam = useCallback(() => {
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
            setError('Failed to export data. Please try again.');
            console.error('Export error:', err);
        }
    }, [team, trainerData, unitSettings]);
    
    const handleLoadClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleLoadTeam = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result;
                if (typeof content !== 'string') {
                    throw new Error("File content could not be read as text.");
                }
                const loadedData = JSON.parse(content);
                const loadedTeam: TeamMember[] = loadedData.team || []; 
                const loadedSettings: UnitSettings | undefined = loadedData.unitSettings;
                const loadedTrainer: TrainerData | undefined = loadedData.trainer;

                if (!Array.isArray(loadedTeam)) {
                     throw new Error("Invalid team data format.");
                }

                if (loadedTeam.some(m => !m.pokedexData || !m.sheetData)) {
                     throw new Error("Invalid Pokémon data within the team file.");
                }
                
                if (loadedSettings) {
                    setUnitSettings(loadedSettings);
                }

                if (loadedTrainer) {
                    // Backwards compatibility migration for pockets
                    const parsePocketString = (pocketString: string): ItemInstance[] => {
                        if (!pocketString || typeof pocketString !== 'string') return [];
                        const itemMap = new Map<string, number>();
                        const itemLines = pocketString.split('\n');
                        
                        itemLines.forEach(line => {
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
                    setTrainerData(loadedTrainer);
                } else {
                    setTrainerData(createInitialTrainerData());
                }

                const teamWithUpdatedWeaknesses = loadedTeam.map(member => {
                    if (!member.pokedexData) return member;
                    const weakness = calculateWeaknesses(member.pokedexData.Type1, member.pokedexData.Type2);
                    // Add instanceID to loaded team members if they don't have one
                    if (!member.instanceID) {
                        member.instanceID = crypto.randomUUID();
                    }
                    return {
                        ...member,
                        sheetData: {
                            ...member.sheetData,
                            weakness,
                        }
                    };
                });


                setTeam(teamWithUpdatedWeaknesses.slice(0, 6)); 
                setError(null);
                setSelectedPokemonId(null);
            } catch (err) {
                console.error("Failed to load data:", err);
                setError("Failed to load data. The file might be corrupted or in an incorrect format.");
            }
        };
        reader.onerror = () => {
             setError("Failed to read the selected file.");
        };
        reader.readAsText(file);
        
        event.target.value = '';
    }, []);

    const isPokemonInTeam = useMemo(() => {
        if (!selectedPokemon) return false;
        return team.some(member => member.pokedexData.DexID === selectedPokemon.DexID);
    }, [selectedPokemon, team]);
    
     const handleAddSuggestionToTeam = useCallback((pokemon: Pokedex) => {
        if (team.length < 6) {
            const sheetData = createInitialSheetData(pokemon, unitSettings, trainerData.trainerRank);
            const newMember: TeamMember = {
                instanceID: crypto.randomUUID(),
                pokedexData: pokemon,
                sheetData: sheetData,
            };
            setTeam(prevTeam => [...prevTeam, newMember]);
        }
    }, [team.length, unitSettings, trainerData.trainerRank]);

    const handleQuickImport = useCallback((importString: string, slotIndex: number) => {
        try {
            const binaryString = atob(importString);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const decompressed = pako.inflate(bytes, { to: 'string' });
            const importedMember: Omit<TeamMember, 'instanceID'> = JSON.parse(decompressed);

            if (importedMember.pokedexData && importedMember.sheetData) {
                const pokemonExists = allPokemon.some(p => p.DexID === importedMember.pokedexData.DexID);
                if (!pokemonExists) {
                    alert(`Imported Pokémon with DexID ${importedMember.pokedexData.DexID} does not exist in the Pokédex.`);
                    return;
                }

                const newMember: TeamMember = {
                    ...importedMember,
                    instanceID: crypto.randomUUID(),
                };

                setTeam(prevTeam => {
                    const newTeam = [...prevTeam];
                    newTeam[slotIndex] = newMember;
                    return newTeam.slice(0, 6);
                });
            } else {
                throw new Error("Invalid imported data structure.");
            }
        } catch (e) {
            alert("Invalid import string. It might be corrupted or from an incompatible version.");
            console.error("Quick import error:", e);
        }
    }, [allPokemon]);

    const handleQuickExport = useCallback((teamMember: TeamMember) => {
        try {
            const dataStr = JSON.stringify(teamMember);
            const compressed = pako.deflate(dataStr);
            const base64Str = btoa(String.fromCharCode.apply(null, compressed as unknown as number[]));
            
            navigator.clipboard.writeText(base64Str);
            alert(`${teamMember.pokedexData.Name} export data copied to clipboard!`);
        } catch (err) {
            setError('Failed to export Pokémon data. Please try again.');
            console.error('Export error:', err);
        }
    }, []);

    return {
        allPokemon,
        allMoves,
        allAbilities,
        allItems,
        ribbonsData,
        allBadges,
        team,
        trainerData,
        selectedPokemon,
        selectedTeamMember,
        isLoading,
        error,
        isSidebarOpen,
        isSettingsOpen,
        isSuggestModalOpen,
        fileInputRef,
        unitSettings,
        loadData,
        setIsSidebarOpen,
        setIsSettingsOpen,
        setUnitSettings,
        setIsSuggestModalOpen,
        handleSelectPokemon,
        handleClearSelection,
        handleAddToTeam,
        handleRemoveFromTeam,
        handleAddPokemonClick,
        handleSheetDataChange,
        handleTrainerDataChange,
        handleExportTeam,
        handleLoadClick,
        handleLoadTeam,
        isPokemonInTeam,
        handleAddSuggestionToTeam,
        handleQuickImport,
        handleQuickExport,
    };
};