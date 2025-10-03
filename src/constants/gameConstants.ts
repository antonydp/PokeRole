/**
 * @file This file contains all the core constants related to the Pokérole game mechanics.
 * It includes data for Pokémon types, ranks, natures, and the type effectiveness chart.
 * Separating these constants ensures a single source of truth and makes them easily reusable
 * across different parts of the application, from UI components to logic modules.
 */

import type { Rank } from '../types/index.js';

/**
 * Defines the color scheme for each Pokémon type.
 * Used for styling UI elements like TypeBadges consistently.
 * @type {{ [key: string]: string }}
 */
export const TYPE_COLORS: { [key: string]: string } = {
    Normal: 'bg-gray-400 text-black',
    Fire: 'bg-orange-500 text-white',
    Water: 'bg-blue-500 text-white',
    Electric: 'bg-yellow-400 text-black',
    Grass: 'bg-green-500 text-white',
    Ice: 'bg-cyan-300 text-black',
    Fighting: 'bg-red-700 text-white',
    Poison: 'bg-purple-600 text-white',
    Ground: 'bg-yellow-600 text-white',
    Flying: 'bg-indigo-400 text-white',
    Psychic: 'bg-pink-500 text-white',
    Bug: 'bg-lime-500 text-white',
    Rock: 'bg-stone-500 text-white',
    Ghost: 'bg-indigo-800 text-white',
    Dragon: 'bg-indigo-600 text-white',
    Dark: 'bg-gray-700 text-white',
    Steel: 'bg-slate-400 text-black',
    Fairy: 'bg-pink-300 text-black',
};

/**
 * An ordered array of all possible Trainer and Pokémon ranks.
 * The order represents the progression from lowest to highest.
 * `as const` ensures that the array is read-only and its values are treated as literal types.
 * @type {readonly string[]}
 */
export const RANKS = ['Starter', 'Beginner', 'Amateur', 'Ace', 'Pro', 'Master', 'Champion'] as const;

/**
 * Defines the social attributes, their names, corresponding data fields, and UI colors.
 * This constant is used to dynamically generate UI elements for social stats in a consistent manner.
 * @type {readonly { name: string; field: 'tough' | 'cool' | 'beauty' | 'cute' | 'clever'; color: string }[]}
 */
export const SOCIAL_ATTRIBUTES = [
    { name: 'TOUGH', field: 'tough', color: 'bg-[#F7F0A0]' },
    { name: 'COOL', field: 'cool', color: 'bg-[#F4A27A]' },
    { name: 'BEAUTY', field: 'beauty', color: 'bg-[#A1C6F4]' },
    { name: 'CUTE', field: 'cute', color: 'bg-[#F6B8D0]' },
    { name: 'CLEVER', field: 'clever', color: 'bg-[#A8D79A]' },
] as const;

/**
 * A comprehensive list of all available Natures for Pokémon and Trainers.
 * Each nature includes a name, descriptive keywords, and a base confidence value.
 * This data is used in character creation and for certain game mechanics.
 * @type {{ name: string; keywords: string; confidence: number }[]}
 */
export const NATURES = [
    { name: 'Adamant', keywords: 'Powerful, Fierce, Relentless', confidence: 4 },
    { name: 'Bashful', keywords: 'Compassionate, Vulnerable, Family Oriented', confidence: 6 },
    { name: 'Bold', keywords: 'Adventurous, Confident, Daring', confidence: 9 },
    { name: 'Brave', keywords: 'Fearless, Level-headed, Protector', confidence: 9 },
    { name: 'Calm', keywords: 'Reasonable, Peaceful, Balanced', confidence: 8 },
    { name: 'Careful', keywords: 'Analytic, Skeptical, Withdrawn', confidence: 5 },
    { name: 'Docile', keywords: 'Kind, Team worker, Service spirit', confidence: 7 },
    { name: 'Gentle', keywords: 'Graceful, Charismatic, Extroverts', confidence: 10 },
    { name: 'Hardy', keywords: 'Dependable, Resilient, Resourceful', confidence: 9 },
    { name: 'Hasty', keywords: 'Eager, Enthusiastic, Hustle', confidence: 7 },
    { name: 'Impish', keywords: 'Mischievous, Witty, Playful', confidence: 7 },
    { name: 'Jolly', keywords: 'Cheerful, Charming, Energetic', confidence: 10 },
    { name: 'Lax', keywords: 'Unconcerned, Indolent, Simple', confidence: 8 },
    { name: 'Lonely', keywords: 'Independent, Introspective, Solitary', confidence: 5 },
    { name: 'Mild', keywords: 'Meek, Serene, Comforting', confidence: 8 },
    { name: 'Modest', keywords: 'Measured, Self-Assured, Hard Worker', confidence: 10 },
    { name: 'Naive', keywords: 'Curious, Lighthearted, Innocent', confidence: 7 },
    { name: 'Naughty', keywords: 'Devious, Rebel, Sly', confidence: 6 },
    { name: 'Quiet', keywords: 'Silent, Reserved, Espectator', confidence: 5 },
    { name: 'Quirky', keywords: 'Unusual, Open-Minded, Original', confidence: 9 },
    { name: 'Rash', keywords: 'Reckless, Unrefined, Daredevil', confidence: 6 },
    { name: 'Relaxed', keywords: 'Carefree, Meditative, Nonchalant', confidence: 8 },
    { name: 'Sassy', keywords: 'Lively, Irreverent, Mouthy', confidence: 7 },
    { name: 'Serious', keywords: 'Steadfast, Rigid, Commited', confidence: 4 },
    { name: 'Timid', keywords: 'Shy, Apprehensive, Sensible', confidence: 4 },
];

/**
 * The master type chart for Pokémon battles.
 * It defines the weaknesses, resistances, and immunities for each Pokémon type.
 * This is a critical data structure for calculating battle damage and type coverage.
 * @type {{ [key: string]: { weaknesses: string[], resistances: string[], immunities: string[] } }}
 */
export const TYPE_CHART: { [key: string]: { weaknesses: string[], resistances: string[], immunities: string[] } } = {
  "Normal": { "weaknesses": ["Fighting"], "resistances": [], "immunities": ["Ghost"] },
  "Fire": { "weaknesses": ["Water", "Ground", "Rock"], "resistances": ["Fire", "Grass", "Ice", "Bug", "Steel", "Fairy"], "immunities": [] },
  "Water": { "weaknesses": ["Grass", "Electric"], "resistances": ["Water", "Fire", "Ice", "Steel"], "immunities": [] },
  "Grass": { "weaknesses": ["Fire", "Ice", "Poison", "Flying", "Bug"], "resistances": ["Water", "Electric", "Grass", "Ground"], "immunities": [] },
  "Electric": { "weaknesses": ["Ground"], "resistances": ["Electric", "Flying", "Steel"], "immunities": [] },
  "Ice": { "weaknesses": ["Fire", "Fighting", "Rock", "Steel"], "resistances": ["Ice"], "immunities": [] },
  "Fighting": { "weaknesses": ["Flying", "Psychic", "Fairy"], "resistances": ["Bug", "Rock", "Dark"], "immunities": [] },
  "Poison": { "weaknesses": ["Ground", "Psychic"], "resistances": ["Fighting", "Poison", "Bug", "Grass", "Fairy"], "immunities": [] },
  "Ground": { "weaknesses": ["Water", "Grass", "Ice"], "resistances": ["Poison", "Rock"], "immunities": ["Electric"] },
  "Flying": { "weaknesses": ["Electric", "Ice", "Rock"], "resistances": ["Fighting", "Bug", "Grass"], "immunities": ["Ground"] },
  "Psychic": { "weaknesses": ["Bug", "Ghost", "Dark"], "resistances": ["Fighting", "Psychic"], "immunities": [] },
  "Bug": { "weaknesses": ["Fire", "Flying", "Rock"], "resistances": ["Fighting", "Grass", "Ground"], "immunities": [] },
  "Rock": { "weaknesses": ["Water", "Grass", "Fighting", "Ground", "Steel"], "resistances": ["Normal", "Fire", "Poison", "Flying"], "immunities": [] },
  "Ghost": { "weaknesses": ["Ghost", "Dark"], "resistances": ["Poison", "Bug"], "immunities": ["Normal", "Fighting"] },
  "Dragon": { "weaknesses": ["Ice", "Dragon", "Fairy"], "resistances": ["Fire", "Water", "Grass", "Electric"], "immunities": [] },
  "Dark": { "weaknesses": ["Fighting", "Bug", "Fairy"], "resistances": ["Ghost", "Dark"], "immunities": ["Psychic"] },
  "Steel": { "weaknesses": ["Fire", "Fighting", "Ground"], "resistances": ["Normal", "Grass", "Ice", "Flying", "Psychic", "Bug", "Rock", "Dragon", "Steel", "Fairy"], "immunities": ["Poison"] },
  "Fairy": { "weaknesses": ["Poison", "Steel"], "resistances": ["Fighting", "Bug", "Dark"], "immunities": ["Dragon"] }
};

/**
 * Defines the skills available to Trainers and Pokémon.
 * This structure is used to dynamically generate UI elements for skill ratings.
 * @type {{ [key: string]: { name: string; field: string }[] }}
 */
export const SKILLS = {
    FIGHT: [
        { name: 'BRAWL', field: 'brawl' },
        { name: 'THROW', field: 'throw' },
        { name: 'EVASION', field: 'evasion' },
        { name: 'WEAPONS', field: 'weapons' },
    ],
    SURVIVAL: [
        { name: 'ALERT', field: 'alert' },
        { name: 'ATHLETIC', field: 'athletic' },
        { name: 'NATURE', field: 'natureSurvival' },
        { name: 'STEALTH', field: 'stealth' },
    ],
    SOCIAL: [
        { name: 'ALLURE', field: 'allure' },
        { name: 'ETIQUETTE', field: 'etiquette' },
        { name: 'INTIMIDATE', field: 'intimidate' },
        { name: 'PERFORM', field: 'perform' },
    ],
    KNOWLEDGE: [
        { name: 'CRAFTS', field: 'crafts' },
        { name: 'LORE', field: 'lore' },
        { name: 'MEDICINE', field: 'medicine' },
        { name: 'SCIENCE', field: 'science' },
    ],
};

/**
 * Defines the core attributes for Trainers.
 */
export const TRAINER_ATTRIBUTES = [
    { name: 'STRENGTH', field: 'strength' },
    { name: 'DEXTERITY', field: 'dexterity' },
    { name: 'VITALITY', field: 'vitality' },
    { name: 'INSIGHT', field: 'insight' },
];

/**
 * Defines the core attributes for Pokémon.
 */
export const POKEMON_ATTRIBUTES = [
    { name: 'STRENGTH', field: 'strength' },
    { name: 'DEXTERITY', field: 'dexterity' },
    { name: 'VITALITY', field: 'vitality' },
    { name: 'SPECIAL', field: 'special' },
    { name: 'INSIGHT', field: 'insight' },
];

export const POKEMON_SKILLS = {
    FIGHT: [
        { name: 'BRAWL', field: 'brawl' },
        { name: 'CHANNEL', field: 'channel' },
        { name: 'CLASH', field: 'clash' },
        { name: 'EVASION', field: 'evasion' },
    ],
    SURVIVAL: [
        { name: 'ALERT', field: 'alert' },
        { name: 'ATHLETIC', field: 'athletic' },
        { name: 'NATURE', field: 'nature' },
        { name: 'STEALTH', field: 'stealth' },
    ],
    SOCIAL: [
        { name: 'ALLURE', field: 'allure' },
        { name: 'ETIQUETTE', field: 'etiquette' },
        { name: 'INTIMIDATE', field: 'intimidate' },
        { name: 'PERFORM', field: 'perform' },
    ],
};

import { PokemonData } from '../types/index.js';

// In `src/constants/gameConstants.ts`, make sure to export `POKEMON_SKILL_FIELDS`
export const POKEMON_SKILL_FIELDS: (keyof PokemonData)[] = ['brawl', 'channel', 'clash', 'evasion', 'alert', 'athletic', 'nature', 'stealth', 'allure', 'etiquette', 'intimidate', 'perform', 'extraSkillValue'];