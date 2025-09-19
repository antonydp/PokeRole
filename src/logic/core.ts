/**
 * @file This file contains all the core logic and calculations based on the Pokérole Corebook.
 * It centralizes rules for character stats, progression, and other game mechanics
 * to ensure consistency and ease of maintenance.
 */

import type { Rank } from '../types/index.js';

// --- RANK CONSTANTS ---

/**
 * Defines the order and numerical value of each rank.
 * This is used for comparisons and calculations where rank progression matters.
 */
export const RANK_ORDER: Record<Rank, number> = {
    Starter: 0,
    Beginner: 1,
    Amateur: 2,
    Ace: 3,
    Pro: 4,
    Master: 5,
    Champion: 6,
};

/**
 * Specifies the maximum value a skill can have at each rank.
 * This prevents players from investing too many points into a single skill early on.
 */
export const RANK_SKILL_LIMITS: Record<Rank, number> = {
    Starter: 1,
    Beginner: 2,
    Amateur: 3,
    Ace: 4,
    Pro: 5,
    Master: 5,
    Champion: 5,
};

/**
 * The number of points that can be allocated to a Pokémon's or Trainer's core attributes at each rank.
 * These points are spent to increase stats like Strength, Dexterity, etc.
 */
export const RANK_ATTRIBUTE_POINTS: Record<Rank, number> = {
    Starter: 0,
    Beginner: 2,
    Amateur: 4,
    Ace: 6,
    Pro: 8,
    Master: 8,
    Champion: 10,
};

/**
 * The number of points that can be allocated to a Pokémon's or Trainer's social attributes at each rank.
 * These points are spent to increase stats like Tough, Cool, etc.
 */
export const RANK_SOCIAL_ATTRIBUTE_POINTS: Record<Rank, number> = {
    Starter: 0,
    Beginner: 2,
    Amateur: 4,
    Ace: 6,
    Pro: 8,
    Master: 9,
    Champion: 9,
};

/**
 * The total number of points available to spend on skills at each rank.
 * This pool is shared across all skills.
 */
export const RANK_SKILL_POINTS: Record<Rank, number> = {
    Starter: 5,
    Beginner: 9,
    Amateur: 12,
    Ace: 14,
    Pro: 15,
    Master: 15,
    Champion: 16,
};


// --- CALCULATION FUNCTIONS ---

/**
 * Calculates the bonus applied to certain stats at Master and Champion ranks.
 * @param rank The current rank of the Pokémon or Trainer.
 * @returns The rank bonus value (2 for Master/Champion, 0 otherwise).
 */
export const getRankBonus = (rank: Rank): number => {
    return RANK_ORDER[rank] >= RANK_ORDER['Master'] ? 2 : 0;
};

/**
 * Calculates a Pokémon's maximum Hit Points (HP).
 * HP is determined by the Pokémon's base HP, its Vitality stat, and any applicable rank bonus.
 * @param baseHp The base HP of the Pokémon species.
 * @param vitality The current Vitality stat of the Pokémon.
 * @param rank The current rank of the Pokémon.
 * @returns The calculated maximum HP.
 */
export const calculatePokemonHP = (baseHp: number, vitality: number, rank: Rank): number => {
    const rankBonus = getRankBonus(rank);
    return baseHp + vitality + rankBonus;
};

/**
 * Calculates a Pokémon's maximum Willpower.
 * Will is determined by the Pokémon's Insight stat and any applicable rank bonus.
 * The base value for Will is Insight + 2.
 * @param insight The current Insight stat of the Pokémon.
 * @param rank The current rank of the Pokémon.
 * @returns The calculated maximum Will.
 */
export const calculatePokemonWill = (insight: number, rank: Rank): number => {
    const rankBonus = getRankBonus(rank);
    return insight + 2 + rankBonus;
};

/**
 * Calculates a Pokémon's Initiative score.
 * Initiative determines the turn order in battle and is based on Dexterity, the Alert skill, and rank bonus.
 * @param dexterity The current Dexterity stat of the Pokémon.
 * @param alert The current value of the Alert skill.
 * @param rank The current rank of the Pokémon.
 * @returns The calculated Initiative score.
 */
export const calculateInitiative = (dexterity: number, alert: number, rank: Rank): number => {
    const rankBonus = getRankBonus(rank);
    return dexterity + alert + rankBonus;
};

/**
 * Calculates a Pokémon's Defense and Special Defense values.
 * @param vitality The current Vitality stat of the Pokémon.
 * @param insight The current Insight stat of the Pokémon.
 * @param rank The current rank of the Pokémon.
 * @returns A string representing "Defense / Special Defense".
 */
export const calculateDefSDef = (vitality: number, insight: number, rank: Rank): string => {
    const rankBonus = getRankBonus(rank);
    return `${vitality + rankBonus} / ${insight + rankBonus}`;
};

/**
 * Calculates a Pokémon's Evasion value.
 * Evasion is used to dodge attacks and is based on Dexterity and the Evasion skill.
 * @param dexterity The current Dexterity stat of the Pokémon.
 * @param evasion The current value of the Evasion skill.
 * @returns The calculated Evasion value.
 */
export const calculateEvasion = (dexterity: number, evasion: number): number => {
    return dexterity + evasion;
};

/**
 * Calculates a Pokémon's Clash values for physical and special attacks.
 * @param strength The current Strength stat of the Pokémon.
 * @param special The current Special stat of the Pokémon.
 * @param clash The current value of the Clash skill.
 * @returns A string representing "Physical Clash / Special Clash".
 */
export const calculateClash = (strength: number, special: number, clash: number): string => {
    if (clash > 0) {
        return `${strength + clash} / ${special + clash}`;
    }
    return `${strength} / ${special}`;
};

/**
 * Determines the maximum number of moves a Pokémon can know.
 * This is based on its Insight stat.
 * @param insight The current Insight stat of the Pokémon.
 * @returns The maximum number of moves.
 */
export const calculateMaxMoves = (insight: number): number => {
    return Math.max(0, insight + 2);
};