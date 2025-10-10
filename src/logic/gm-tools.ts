// src/logic/gm-tools.ts

import { Pokedex, PokemonData, Rank, Move } from '../types/index.js';
import {
    RANK_ATTRIBUTE_POINTS,
    RANK_SOCIAL_ATTRIBUTE_POINTS,
    RANK_SKILL_POINTS,
    RANK_SKILL_LIMITS,
    calculateMaxMoves,
    RANK_ORDER
} from './core.js';
import { POKEMON_ATTRIBUTES, SOCIAL_ATTRIBUTES, POKEMON_SKILL_FIELDS } from '../constants/gameConstants.js';
import { parseMoveRank } from './formulas.js'; // We need this to read move ranks

/**
 * Applies rank-based bonus points randomly to a Pokémon's sheet data.
 * This function respects attribute maximums and skill limits for the given rank.
 * @param basePokedex The base Pokedex data for the Pokémon.
 * @param initialSheet The initial, unmodified sheet data.
 * @param rank The target rank to apply points for.
 * @returns A new PokemonData object with bonus points applied.
 */
export function applyRandomBonusPoints(basePokedex: Pokedex, initialSheet: PokemonData, rank: Rank): PokemonData {
    const finalSheet = { ...initialSheet };

    // 1. Apply Attribute Points
    let attrPointsToSpend = RANK_ATTRIBUTE_POINTS[rank];
    let availableAttributes = POKEMON_ATTRIBUTES.map(a => a.field as keyof PokemonData);

    while (attrPointsToSpend > 0 && availableAttributes.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableAttributes.length);
        const randomAttr = availableAttributes[randomIndex];

        const maxStatKey = `Max${randomAttr.charAt(0).toUpperCase() + randomAttr.slice(1)}` as keyof Pokedex;
        const maxStatValue = (basePokedex[maxStatKey] as number) || 99;

        const currentValue = finalSheet[randomAttr];
        if (typeof currentValue === 'number' && currentValue < maxStatValue) {
            (finalSheet as any)[randomAttr] = currentValue + 1;
            attrPointsToSpend--;
        } else {
            // This attribute is maxed out, remove it from the pool
            availableAttributes.splice(randomIndex, 1);
        }
    }

    // 2. Apply Social Attribute Points
    let socialPointsToSpend = RANK_SOCIAL_ATTRIBUTE_POINTS[rank];
    let availableSocial = SOCIAL_ATTRIBUTES.map(a => a.field);

    while (socialPointsToSpend > 0 && availableSocial.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableSocial.length);
        const randomSocial = availableSocial[randomIndex];

        const currentValue = finalSheet[randomSocial];
        if (typeof currentValue === 'number' && currentValue < 5) { // Max for social is always 5
            (finalSheet as any)[randomSocial] = currentValue + 1;
            socialPointsToSpend--;
        } else {
            availableSocial.splice(randomIndex, 1);
        }
    }

    // 3. Apply Skill Points
    const skillLimit = RANK_SKILL_LIMITS[rank];
    let skillPointsToSpend = RANK_SKILL_POINTS[rank];
    let availableSkills = [...POKEMON_SKILL_FIELDS];

    while (skillPointsToSpend > 0 && availableSkills.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableSkills.length);
        const randomSkill = availableSkills[randomIndex];

        // Ensure we don't apply points to the extra skill name
        if (randomSkill === 'extraSkillName') continue;

        const currentValue = finalSheet[randomSkill];
        if (typeof currentValue === 'number' && currentValue < skillLimit) {
            (finalSheet as any)[randomSkill] = currentValue + 1;
            skillPointsToSpend--;
        } else {
            availableSkills.splice(randomIndex, 1);
        }
    }

    return finalSheet;
}


/**
 * Selects a random, rank-appropriate moveset for a Pokémon.
 * @param pokedexData The base Pokedex data for the Pokémon's learnset.
 * @param finalSheetData The final, rank-adjusted sheet data to determine rank and max moves.
 * @param allMoves A map of all moves in the game to look up details.
 * @returns An array of move IDs (_id) or nulls, ready to be placed in the moves array.
 */
export function selectRandomMoves(
    pokedexData: Pokedex,
    finalSheetData: PokemonData,
    allMoves: Record<string, Move>
): (string | null)[] {
    const currentRank = finalSheetData.rank as Rank;
    const currentRankOrder = RANK_ORDER[currentRank];
    const maxMoves = calculateMaxMoves(finalSheetData.insight as number);

    // 1. Filter the Pokémon's entire learnset to find valid moves for its current rank.
    const candidateMoveNames = pokedexData.Moves
        .filter(learnsetMove => {
            const moveRank = parseMoveRank(learnsetMove.Learned);
            if (!moveRank) return false; // Skip moves with unparseable ranks
            const moveRankOrder = RANK_ORDER[moveRank];
            return moveRankOrder <= currentRankOrder;
        })
        .map(m => m.Name);
    
    // Create a mutable copy for selection
    const availableMoveNames = [...new Set(candidateMoveNames)];
    const selectedMoveIds: (string | null)[] = [];

    // 2. Randomly select moves up to the maximum allowed.
    for (let i = 0; i < maxMoves; i++) {
        if (availableMoveNames.length === 0) {
            selectedMoveIds.push(null); // Pad with null if we run out of moves
            continue;
        }

        const randomIndex = Math.floor(Math.random() * availableMoveNames.length);
        const selectedName = availableMoveNames[randomIndex];
        
        // Find the full move object to get its ID
        const moveObject = Object.values(allMoves).find(m => m.Name === selectedName);
        if (moveObject) {
            selectedMoveIds.push(moveObject._id);
        } else {
            selectedMoveIds.push(null); // Push null if somehow the move isn't found
        }
        
        // Remove the selected move to prevent duplicates
        availableMoveNames.splice(randomIndex, 1);
    }
    
    return selectedMoveIds;
}