


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

export interface Learnset {
  Learned: string;
  Name: string;
}

export interface StatChange {
    Stats: string[];
    Stages: number;
    ChanceDice?: number;
    Affects: 'User' | 'Foe';
}

export interface AddedEffects {
    StatChanges?: StatChange[];
    TerrainEffect?: string;
    InflictStatus?: {
        Status: string;
        ChanceDice?: number;
        Affects: 'User' | 'Foe';
    }[];
}


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

export interface Ability {
  _id: string;
  Name: string;
  Effect: string;
  Description: string;
}

export interface Nature {
  name: string;
  keywords: string;
  confidence: number;
}

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
}

export interface TeamMember {
  pokedexData: Pokedex;
  sheetData: PokemonData;
}