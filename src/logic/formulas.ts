/**
 * @file This file contains various formula-based utility functions for the game.
 * It includes calculations for type weaknesses, team coverage, and parsing game data.
 */

import { TYPE_CHART, RANKS } from '../constants/gameConstants.js';
import type { TeamMember, TeamTypeCoverageData, Rank, PokemonData } from '../types/index.js';

/**
 * Calculates the damage multiplier for an attacking type against a defending type.
 * @param attackingType The type of the incoming attack.
 * @param defendingType The type of the defending Pokémon.
 * @returns A multiplier (0 for immunity, 0.5 for resistance, 2 for weakness, 1 otherwise).
 */
const getMultiplier = (attackingType: string, defendingType: string): number => {
    const defenseData = TYPE_CHART[defendingType];
    if (!defenseData) return 1;
    if (defenseData.immunities.includes(attackingType)) return 0;
    if (defenseData.resistances.includes(attackingType)) return 0.5;
    if (defenseData.weaknesses.includes(attackingType)) return 2;
    return 1;
};

/**
 * Calculates and formats the weaknesses of a Pokémon based on its type(s).
 * @param type1 The primary type of the Pokémon.
 * @param type2 The optional secondary type of the Pokémon.
 * @returns A formatted string detailing the Pokémon's weaknesses.
 */
export const calculateWeaknesses = (type1: string, type2?: string): string => {
    const allTypes = Object.keys(TYPE_CHART);
    const weaknesses: string[] = [];
    const doubleWeaknesses: string[] = [];

    for (const attackingType of allTypes) {
        const multi1 = getMultiplier(attackingType, type1);
        const multi2 = type2 && type1 !== type2 ? getMultiplier(attackingType, type2) : 1;
        const totalMultiplier = multi1 * multi2;

        if (totalMultiplier >= 4) {
            doubleWeaknesses.push(attackingType);
        } else if (totalMultiplier >= 2) {
            weaknesses.push(attackingType);
        }
    }

    const resultParts: string[] = [];
    if (weaknesses.length > 0) {
        resultParts.push(`${weaknesses.sort().join(', ')}`);
    }
    if (doubleWeaknesses.length > 0) {
        resultParts.push(`Double Weakness: ${doubleWeaknesses.sort().join(', ')}`);
    }
    
    if (resultParts.length === 0) {
        return 'No weaknesses.';
    }

    return resultParts.join('. ');
};

/**
 * Analyzes a Pokémon team to determine its collective type weaknesses, resistances, and immunities.
 * @param team An array of TeamMember objects.
 * @returns A TeamTypeCoverageData object summarizing the team's coverage.
 */
export const calculateTeamTypeCoverage = (team: TeamMember[]): TeamTypeCoverageData => {
    const allTypes = Object.keys(TYPE_CHART);
    const coverage: TeamTypeCoverageData = {
        weaknesses: {},
        resistances: {},
        immunities: {},
    };

    allTypes.forEach(type => {
        coverage.weaknesses[type] = 0;
        coverage.resistances[type] = 0;
        coverage.immunities[type] = 0;
    });

    if (team.length === 0) {
        return coverage;
    }

    for (const member of team) {
        const { Type1, Type2 } = member.pokedexData;
        for (const attackingType of allTypes) {
            const multi1 = getMultiplier(attackingType, Type1);
            const multi2 = Type2 && Type1 !== Type2 ? getMultiplier(attackingType, Type2) : 1;
            const totalMultiplier = multi1 * multi2;

            if (totalMultiplier > 1) {
                coverage.weaknesses[attackingType]++;
            } else if (totalMultiplier < 1 && totalMultiplier > 0) {
                coverage.resistances[attackingType]++;
            } else if (totalMultiplier === 0) {
                coverage.immunities[attackingType]++;
            }
        }
    }

    return coverage;
};

/**
 * Parses a move's learn string to extract the required rank.
 * Handles formats like "Rank: Starter" and "Starter".
 * @param learnString The string describing how a move is learned.
 * @returns The extracted Rank, or null if no valid rank is found.
 */
export const parseMoveRank = (learnString: string): Rank | null => {
    const rankStr = learnString.replace('Rank: ', '').trim();
    if ((RANKS as readonly string[]).includes(rankStr)) {
        return rankStr as Rank;
    }
    return null;
};
/**
 * Calculates the final value of a move's accuracy or damage based on Pokémon stats.
 * @param valueString The string from the move data (e.g., "Strength + 2", "Dexterity", "--").
 * @param stats The Pokémon's sheet data containing its stats.
 * @returns A formatted string like "Strength + 2 (4 + 2 = 6)" or "--".
 */
export const calculateMoveValue = (valueString: string, stats: PokemonData): string => {
    if (!valueString || valueString === '--') {
        return '--';
    }

    const parts = valueString.split('+').map(part => part.trim());
    let total = 0;
    const calculationParts: string[] = [];

    parts.forEach(part => {
        const statName = part.match(/[a-zA-Z]+/);
        const numericValue = parseInt(part.match(/\d+/)?.toString() || '0', 10);

        if (statName) {
            const statKey = statName[0].toLowerCase();
            const statsAsAny = stats as any;
            const statValue = typeof statsAsAny[statKey] === 'number' ? (statsAsAny[statKey] as number) : 0;
            total += statValue;
            calculationParts.push(statValue.toString());
        }
        
        if (!isNaN(numericValue) && numericValue > 0) {
            total += numericValue;
            if (!statName) {
                calculationParts.push(numericValue.toString());
            }
        }
    });

    if (calculationParts.length > 1) {
        return `${valueString} (${calculationParts.join(' + ')} = ${total})`;
    }
    
    if (calculationParts.length === 1 && valueString.includes('+')) {
         return `${valueString} (${calculationParts[0]} + ${valueString.split('+')[1].trim()} = ${total})`;
    }

    if (calculationParts.length === 1) {
        const statName = parts[0].match(/[a-zA-Z]+/);
        if (statName) {
            return `${parts[0]} (${total})`
        }
    }

    return valueString;
};