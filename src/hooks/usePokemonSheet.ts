import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Pokedex, PokemonData, Move, Rank, LearnableMove } from '../types/index.js';
import { createInitialSheetData } from '../logic/initializers.js';
import { parseMoveRank } from '../logic/formulas.js';
import {
    calculatePokemonHP,
    calculatePokemonWill,
    calculateInitiative,
    calculateDefSDef,
    calculateEvasion,
    calculateClash,
    calculateMaxMoves,
    RANK_ORDER,
    RANK_SKILL_LIMITS
} from '../logic/core.js';
import { usePointCalculations } from './usePointCalculations.js';

import { useSessionStore } from '../store/useSessionStore.js';

export function usePokemonSheet(
    pokemon: Pokedex,
    sheetData: PokemonData | undefined,
    unitSettings: { height: 'imperial' | 'metric', weight: 'imperial' | 'metric' },
    trainerRank: Rank,
    isInTeam: boolean,
    onSheetDataChange: (instanceID: string, newSheetData: PokemonData) => void,
    allMoves: Record<string, Move>,
    instanceID: string | undefined
) {
    const activePokemon = pokemon;

    const [pokemonData, setPokemonData] = useState<PokemonData>(() => sheetData || createInitialSheetData(activePokemon, unitSettings, trainerRank));
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [moveSlotIndex, setMoveSlotIndex] = useState<number | null>(null);
    const [moveSearchTerm, setMoveSearchTerm] = useState('');
    const [expandedMoves, setExpandedMoves] = useState<Set<number>>(new Set());
    const [showTutorMoves, setShowTutorMoves] = useState(false);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [selectedMove, setSelectedMove] = useState<Move | null>(null);
    const hasInitialized = useRef(false);

    // Update the local sheet data if the active Pokémon form changes (e.g., Mega Evolution)
    useEffect(() => {
        hasInitialized.current = false; // Flag that a reset is happening
        setPokemonData(sheetData || createInitialSheetData(activePokemon, unitSettings, trainerRank));
        setExpandedMoves(new Set());
    }, [activePokemon.DexID, instanceID, sheetData]);

    const {
        points,
        isAttributePoolExhausted,
        isSocialAttributePoolExhausted,
        isSkillPoolExhausted
    } = usePointCalculations(pokemonData, activePokemon);

    const skillLimit = useMemo(() => RANK_SKILL_LIMITS[pokemonData.rank as Rank], [pokemonData.rank]);

    useEffect(() => {
        // If the sheet has not been "initialized" for the current pokemon, don't save.
        // This prevents the reset effect from overwriting persisted data.
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            return;
        }
        if (isInTeam && instanceID) {
            onSheetDataChange(instanceID, pokemonData);
        }
    }, [pokemonData, onSheetDataChange, isInTeam, instanceID]);

    const handleDataChange = useCallback((field: keyof PokemonData, value: any) => {
        setPokemonData(prev => {
            const newData = { ...prev, [field]: value };
            const numericValue = Number(value) || 0;
            
            if (field === 'rank') {
                const newRank = value as Rank;
                const newHP = calculatePokemonHP(activePokemon.BaseHP, newData.vitality, newRank);
                newData.hp = String(newHP);
                newData.currentHP = Math.min(prev.currentHP ?? newHP, newHP);
                const newWill = calculatePokemonWill(newData.insight, newRank);
                newData.will = String(newWill);
                newData.currentWill = Math.min(prev.currentWill ?? newWill, newWill);
                newData.initiative = String(calculateInitiative(newData.dexterity, newData.alert, newRank));
                newData.defSDef = calculateDefSDef(newData.vitality, newData.insight, newRank);
            } else {
                const currentRank = newData.rank as Rank;
                switch (field) {
                    case 'vitality':
                        const newHP = calculatePokemonHP(activePokemon.BaseHP, numericValue, currentRank);
                        newData.hp = String(newHP);
                        newData.currentHP = Math.min(prev.currentHP ?? newHP, newHP);
                        newData.defSDef = calculateDefSDef(numericValue, newData.insight, currentRank);
                        break;
                    case 'insight':
                        const newWill = calculatePokemonWill(numericValue, currentRank);
                        newData.will = String(newWill);
                        newData.currentWill = Math.min(prev.currentWill ?? newWill, newWill);
                        const maxMoves = calculateMaxMoves(numericValue);
                        if (prev.moves.length !== maxMoves) {
                            newData.moves = Array.from({ length: maxMoves }, (_, i) => prev.moves[i] || null);
                        }
                        newData.defSDef = calculateDefSDef(newData.vitality, numericValue, currentRank);
                        break;
                    case 'dexterity':
                        newData.initiative = String(calculateInitiative(numericValue, newData.alert, currentRank));
                        newData.evasionValue = String(calculateEvasion(numericValue, newData.evasion));
                        break;
                    case 'strength':
                    case 'special':
                    case 'clash':
                        newData.clashValue = calculateClash(newData.strength, newData.special, newData.clash);
                        break;
                    case 'alert':
                        newData.initiative = String(calculateInitiative(newData.dexterity, numericValue, currentRank));
                        break;
                    case 'evasion':
                        newData.evasionValue = String(calculateEvasion(newData.dexterity, numericValue));
                        break;
                }
            }
            
            return newData;
        });
    }, [activePokemon]);

    const openMoveModal = useCallback((index: number) => {
        setMoveSlotIndex(index);
        setMoveSearchTerm('');
        setShowTutorMoves(false);
        setIsMoveModalOpen(true);
    }, []);

    const closeMoveModal = () => {
        setIsMoveModalOpen(false);
        setMoveSlotIndex(null);
    };

    const handleSelectMove = (move: Move) => {
        const pokemonRankOrder = RANK_ORDER[pokemonData.rank as Rank];
        const learnset = activePokemon.Moves.find(m => m.Name.toLowerCase() === move.Name.toLowerCase());
        const requiredRank = learnset ? parseMoveRank(learnset.Learned) : null;
        const moveRankOrder = requiredRank ? RANK_ORDER[requiredRank] : Infinity;
        const isOverRanked = requiredRank ? moveRankOrder > pokemonRankOrder : false;

        if (isOverRanked) {
            setSelectedMove(move);
            setIsConfirmationModalOpen(true);
        } else {
            addMoveToSheet(move);
        }
    };

    const addMoveToSheet = (move: Move) => {
        if (moveSlotIndex === null) return;

        setPokemonData(prev => {
            const newMoves = [...prev.moves];
            newMoves[moveSlotIndex] = move._id;
            return { ...prev, moves: newMoves };
        });

        closeMoveModal();
        setIsConfirmationModalOpen(false);
        setSelectedMove(null);
    };

    const confirmOverRankMove = () => {
        if (selectedMove) {
            addMoveToSheet(selectedMove);
        }
    };

    const cancelOverRankMove = () => {
        setIsConfirmationModalOpen(false);
        setSelectedMove(null);
    };

    const handleClearMove = useCallback((index: number) => {
        setPokemonData(prev => {
            const newMoves = [...prev.moves];
            newMoves[index] = null;
            return { ...prev, moves: newMoves };
        });
    }, []);

    const handleToggleMoveExpand = useCallback((index: number) => {
        setExpandedMoves(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    }, []);

    const learnableMoves = useMemo((): LearnableMove[] => {
        const pokemonRankOrder = RANK_ORDER[pokemonData.rank as Rank];
        const pokemonLearnedMoveNames = new Set(activePokemon.Moves.map(m => m.Name.toLowerCase()));

        const allLearnableMoves = Object.values(allMoves).map(move => {
            const learnset = activePokemon.Moves.find(m => m.Name.toLowerCase() === move.Name.toLowerCase());
            const requiredRank = learnset ? parseMoveRank(learnset.Learned) : null;
            const moveRankOrder = requiredRank ? RANK_ORDER[requiredRank] : Infinity;
            
            const isNaturallyLearned = pokemonLearnedMoveNames.has(move.Name.toLowerCase());
            const isAvailable = isNaturallyLearned && requiredRank ? moveRankOrder <= pokemonRankOrder : true;
            const isOverRanked = requiredRank ? moveRankOrder > pokemonRankOrder : false;

            return {
                move,
                isAvailable,
                requiredRank,
                isOverRanked,
                isTutorMove: !isNaturallyLearned
            };
        });

        return allLearnableMoves
            .filter(item => {
                const searchTermMatch = item.move.Name.toLowerCase().includes(moveSearchTerm.toLowerCase());
                const isTutorMoveShown = showTutorMoves || !item.isTutorMove;
                return searchTermMatch && isTutorMoveShown;
            })
            .sort((a, b) => {
                if (a.isAvailable && !b.isAvailable) return -1;
                if (!a.isAvailable && b.isAvailable) return 1;
                if (a.isTutorMove && !b.isTutorMove) return 1;
                if (!a.isTutorMove && b.isTutorMove) return -1;
                return a.move.Name.localeCompare(b.move.Name);
            });
    }, [activePokemon.Moves, allMoves, moveSearchTerm, pokemonData.rank, showTutorMoves]);

    const availableAbilities = useMemo(() => {
        return [
            activePokemon.Ability1,
            activePokemon.Ability2,
            activePokemon.HiddenAbility,
            ...(activePokemon.EventAbilities?.split(',').map(a => a.trim()) || [])
        ].filter((a): a is string => !!a && a.trim() !== '');
    }, [activePokemon]);

    return {
        pokemonData,
        setPokemonData,
        handleDataChange,
        isMoveModalOpen,
        openMoveModal,
        closeMoveModal,
        handleSelectMove,
        moveSearchTerm,
        setMoveSearchTerm,
        learnableMoves,
        handleClearMove,
        expandedMoves,
        handleToggleMoveExpand,
        availableAbilities,
        showTutorMoves,
        setShowTutorMoves,
        isConfirmationModalOpen,
        confirmOverRankMove,
        cancelOverRankMove,
        selectedMove,
        points,
        isAttributePoolExhausted,
        isSocialAttributePoolExhausted,
        isSkillPoolExhausted,
        skillLimit
    };
}