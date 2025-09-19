/**
 * @file This file contains functions for creating initial data structures for the application.
 * These are used to generate fresh character sheets for Pokémon and Trainers.
 */

import { Pokedex, PokemonData, TrainerData, Rank } from '../types/index.js';
import { calculateClash, calculateDefSDef, calculateEvasion, calculateInitiative, calculateMaxMoves, calculatePokemonHP, calculatePokemonWill } from './core.js';
import { calculateWeaknesses } from './formulas.js';

/**
 * Defines the unit settings for height and weight measurements.
 */
type UnitSettings = {
    height: 'imperial' | 'metric';
    weight: 'imperial' | 'metric';
};

/**
 * Creates a default, empty character sheet for a given Pokémon.
 * It populates the sheet with base stats, calculates derived values, and sets default values.
 * @param pokemon The Pokedex data for the Pokémon.
 * @param unitSettings The current user settings for measurement units.
 * @param trainerRank The rank of the trainer, which can affect the Pokémon's initial stats.
 * @returns A complete PokemonData object.
 */
export const createInitialSheetData = (pokemon: Pokedex, unitSettings: UnitSettings, trainerRank: Rank): PokemonData => {
    const emptyMoves = Array(calculateMaxMoves(pokemon.Insight)).fill(null);
    
    const availableAbilities = [
        pokemon.Ability1,
        pokemon.Ability2,
        pokemon.HiddenAbility,
        ...(pokemon.EventAbilities?.split(',').map(a => a.trim()) || [])
    ].filter((a): a is string => !!a && a.trim() !== '');

    const feet = Math.floor(pokemon.Height.Feet);
    const inches = Math.round((pokemon.Height.Feet % 1) * 12);
    const sizeString = unitSettings.height === 'imperial' 
        ? `${feet}'${inches}"` 
        : `${pokemon.Height.Meters}m`;
        
    const weightString = unitSettings.weight === 'imperial'
        ? `${pokemon.Weight.Pounds} lbs`
        : `${pokemon.Weight.Kilograms}kg`;
        
    const weaknessString = calculateWeaknesses(pokemon.Type1, pokemon.Type2);

    return {
        pokemonNumber: String(pokemon.Number).padStart(4, '0'),
        pokemonName: pokemon.Name,
        ability: availableAbilities[0] || '',
        strength: pokemon.Strength,
        dexterity: pokemon.Dexterity,
        vitality: pokemon.Vitality,
        special: pokemon.Special,
        insight: pokemon.Insight,
        brawl: 0, channel: 0, clash: 0, evasion: 0,
        alert: 0, athletic: 0, nature: 0, stealth: 0,
        allure: 0, etiquette: 0, intimidate: 0, perform: 0,
        extraSkillName: '', extraSkillValue: 0,
        tough: 1, cool: 1, beauty: 1, cute: 1, clever: 1,
        pokemonNature: '',
        confidence: '',
        happiness: 2,
        loyalty: 2,
        numberOfBattles: '0',
        victories: '0',
        accessory: '',
        type: [pokemon.Type1, pokemon.Type2].filter(Boolean).join(' / '),
        weakness: weaknessString,
        hp: String(calculatePokemonHP(pokemon.BaseHP, pokemon.Vitality, trainerRank)),
        will: String(calculatePokemonWill(pokemon.Insight, trainerRank)),
        item: '',
        status: 'Healthy',
        initiative: String(calculateInitiative(pokemon.Dexterity, 0, trainerRank)),
        accuracy: '',
        damage: '',
        evasionValue: String(calculateEvasion(pokemon.Dexterity, 0)),
        clashValue: calculateClash(pokemon.Strength, pokemon.Special, 0),
        defSDef: calculateDefSDef(pokemon.Vitality, pokemon.Insight, trainerRank),
        rank: trainerRank,
        size: sizeString,
        weight: weightString,
        moves: emptyMoves,
    };
};

/**
 * Creates a default character sheet for a new Trainer.
 * It provides placeholder data and a basic inventory to get the user started.
 * @returns A complete TrainerData object.
 */
export const createInitialTrainerData = (): TrainerData => {
    const now = Date.now();
    return {
        // Trainer Card
        name: 'Ash Ketchum',
        age: '10',
        hometown: 'Pallet Town',
        trainerRank: 'Starter',
        playerName: 'Player 1',
        concept: 'Ambitious Battler',
        nature: 'Brave',
        confidence: '9',
        money: '1500',

        // Core Attributes (start at 1)
        strength: 1,
        dexterity: 1,
        vitality: 1,
        insight: 1,

        // Skills - Fight
        brawl: 0,
        throw: 0,
        evasion: 0,
        weapons: 0,
        
        // Skills - Survival
        alert: 0, athletic: 0, 
        natureSkill: 0, stealth: 0,
        
        // Skills - Social
        allure: 0, etiquette: 0, intimidate: 0, perform: 0,

        // Skills - Knowledge
        crafts: 0, lore: 0, medicine: 0, science: 0,
        
        // Extra Skills
        extraSkills: [
            { name: '', value: 0 },
            { name: '', value: 0 },
            { name: '', value: 0 },
            { name: '', value: 0 },
        ],
        
        // Social Attributes (start at 1)
        tough: 1,
        cool: 1,
        beauty: 1,
        clever: 1,
        cute: 1,

        // Progression & Records
        achievements: [
            { text: 'Goal: Win a gym badge.', completed: false },
            { text: '', completed: false },
            { text: '', completed: false },
            { text: '', completed: false },
            { text: '', completed: false },
        ],
        pokedexCaught: '0',
        pokedexSeen: '1',

        // Backpack
        potions: [
            { id: `potion-${now}-1`, type: 'potion', maxUnits: 2, currentUnits: 2 },
            { id: `potion-${now}-2`, type: 'potion', maxUnits: 2, currentUnits: 2 },
            { id: `potion-${now}-3`, type: 'potion', maxUnits: 2, currentUnits: 2 },
        ],
        smallPocket: [],
        mainPocket: [],
        badges: '', // Empty to start
    };
};