/**
 * @file This file defines all the core TypeScript types and interfaces for the application.
 * Centralizing type definitions ensures consistency and improves maintainability.
 */

import { RANKS } from '../constants/gameConstants.js';

/** Represents the possible ranks for a Trainer or Pokémon. */
export type Rank = typeof RANKS[number];

/**
 * Interface for the raw data of a Pokémon as fetched from the Pokédex.
 */
export interface Pokedex {
  Number: number;
  DexID: string;
  Name: string;
  Type1: string;
  Type2?: string;
  BaseHP: number;
  Strength: number;
  MaxStrength: number;
  Dexterity: number;
  MaxDexterity: number;
  Vitality: number;
  MaxVitality: number;
  Special: number;
  MaxSpecial: number;
  Insight: number;
  MaxInsight: number;
  Ability1: string;
  Ability2?: string;
  HiddenAbility?: string;
  EventAbilities?: string;
  RecommendedRank: string;
  GenderType?: string;
  Legendary: boolean;
  GoodStarter: boolean;
  _id: string;
  DexCategory: string;
  Height: { Feet: number; Meters: number };
  Weight: { Kilograms: number; Pounds: number };
  DexDescription: string;
  Evolutions: Evolution[];
  Image: string;
  Moves: Learnset[];
}

/**
 * A simplified version of the Pokedex type, used for specific purposes like AI suggestions.
 */
export interface SimplifiedPokedex {
  Name: string;
  Type1: string;
  Type2?: string;
  BaseHP: number;
  Strength: number;
  Dexterity: number;
  Vitality: number;
  Moves: string[];
}

/** Describes the evolution details for a Pokémon. */
export interface Evolution {
  To?: string;
  From?: string;
  Kind: string;
  Speed?: string;
  Item?: string;
  Stat?: string;
  Value?: string;
  Special?: string;
}

/** Represents a move that a Pokémon can learn. */
export interface Learnset {
  Learned: string;
  Name: string;
}

/** Defines a change in stats caused by a move or ability. */
export interface StatChange {
    Stats: string[];
    Stages: number;
    ChanceDice?: number;
    Affects: 'User' | 'Foe';
}

/** Defines additional effects a move can have. */
export interface AddedEffects {
    StatChanges?: StatChange[];
    TerrainEffect?: string;
    InflictStatus?: {
        Status: string;
        ChanceDice?: number;
        Affects: 'User' | 'Foe';
    }[];
}

/**
 * Interface for a Pokémon move, containing all its battle properties.
 */
export interface Move {
  Name: string;
  Type: string;
  Power: number;
  Damage1: string;
  Damage2: string;
  Accuracy1: string;
  Accuracy2: string;
  Target: string;
  Effect: string;
  Description: string;
  _id: string;
  Attributes: object;
  AddedEffects: AddedEffects;
  Category: string;
}

/**
 * Interface for a Pokémon ability.
 */
export interface Ability {
  _id: string;
  Name: string;
  Effect: string;
  Description: string;
}

/**
 * Represents a Pokémon or Trainer's Nature.
 */
export interface Nature {
  name: string;
  keywords: string;
  confidence: number;
}

/**
 * Represents the editable character sheet data for a Pokémon.
 */
export interface PokemonData {
    pokemonNumber: string;
    pokemonName: string;
    ability: string;
    strength: number;
    dexterity: number;
    vitality: number;
    special: number;
    insight: number;
    brawl: number;
    channel: number;
    clash: number;
    evasion: number;
    alert: number;
    athletic: number;
    nature: number;
    stealth: number;
    allure: number;
    etiquette: number;
    intimidate: number;
    perform: number;
    extraSkillName: string;
    extraSkillValue: number;
    tough: number;
    cool: number;
    beauty: number;
    cute: number;
    clever: number;
    pokemonNature: string;
    confidence: string;
    happiness: number;
    loyalty: number;
    numberOfBattles: string;
    victories: string;
    accessory: string;
    type: string;
    weakness: string;
    hp: string;
    will: string;
    item: string;
    status: string;
    initiative: string;
    accuracy: string;
    damage: string;
    evasionValue: string;
    clashValue: string;
    defSDef: string;
    rank: string;
    size: string;
    weight: string;
    moves: (string | null)[];
    ribbons: (string | null)[];
}

/**
 * Represents a move in the context of a Pokémon's learnset, including availability.
 */
export interface LearnableMove {
  move: Move;
  isAvailable: boolean;
  requiredRank: Rank | null;
  isOverRanked: boolean;
  isTutorMove: boolean;
}

/**
 * Represents a member of the user's team, combining Pokédex data with sheet data.
 */
export interface TeamMember {
  instanceID: string;
  pokedexData: Pokedex;
  sheetData: PokemonData;
}

/**
 * Represents a bottle of potion in the trainer's inventory.
 */
export interface PotionBottle {
  id: string;
  type: 'potion' | 'superPotion' | 'hyperPotion';
  maxUnits: number;
  currentUnits: number;
}

/**
 * Represents an instance of an item in the trainer's inventory.
 */
export interface ItemInstance {
  id: string;
  name: string;
  quantity: number;
  description?: string;
}

/**
 * Represents the editable character sheet data for a Trainer.
 */
export interface TrainerData {
  // Trainer Card
  name: string;
  age: string;
  hometown: string;
  trainerRank: Rank;
  playerName: string;
  concept: string;
  nature: string;
  confidence: string;
  money: string;

  // Core Attributes
  strength: number;
  dexterity: number;
  vitality: number;
  insight: number;

  // Skills - Fight
  brawl: number;
  throw: number;
  evasion: number;
  weapons: number;
  
  // Skills - Survival
  alert: number;
  athletic: number;
  natureSurvival: number;
  stealth: number;
  
  // Skills - Social
  allure: number;
  etiquette: number;
  intimidate: number;
  perform: number;

  // Skills - Knowledge
  crafts: number;
  lore: number;
  medicine: number;
  science: number;
  
  // Extra Skills
  extraSkills: { name: string; value: number }[];
  
  // Social Attributes (Contest)
  tough: number;
  cool: number;
  beauty: number;
  clever: number;
  cute: number;
  
  // Progression & Records
  achievements: { text: string; completed: boolean }[];
  pokedexCaught: string;
  pokedexSeen: string;
  
  // Backpack
  potions: PotionBottle[];
  smallPocket: ItemInstance[];
  mainPocket: ItemInstance[];
  badges: string;
}

/**
 * Represents a generic item that can be obtained in the game.
 */
export interface Item {
  name: string;
  description: string;
  usable_in_battle: boolean;
  image: string | null;
  price?: number;
  rarity?: string;
  effect?: string;
}

/**
 * Represents a ribbon that a Pokémon can earn.
 */
export interface Ribbon {
  name: string;
  image_url: string;
  description: string;
}

/**
 * Represents a gym badge that a Trainer can earn.
 */
export interface Badge {
  name: string;
  image_url: string;
  description: string;
}

/**
 * Represents sub-categories within the "Healing Items" category.
 */
export interface HealingItemsSubCategory {
  potions: Item[];
  status_heals: Item[];
}

/**
 * A union type for the content of an item category.
 */
export type ItemCategoryContent = Item[] | HealingItemsSubCategory;

/**
 * Represents the structure of the entire items data file.
 */
export interface ItemsData {
  items: {
    [key: string]: ItemCategoryContent;
  };
}

/**
 * Represents the calculated type coverage for a Pokémon team.
 */
export interface TeamTypeCoverageData {
  weaknesses: { [type: string]: number };
  resistances: { [type: string]: number };
  immunities: { [type: string]: number };
}