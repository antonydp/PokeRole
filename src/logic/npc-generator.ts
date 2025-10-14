// src/logic/npc-generator.ts

import { Pokedex, Rank, Move, NPCTrainer, NPCPokemon, Sprite } from '../types/index.js';

export interface NPCTrainerOptions {
    teamSize?: number;
    allowLegendaries?: boolean;
    excludeForms?: boolean;
}
import { createInitialSheetData } from './initializers.js';
import { applyRandomBonusPoints, selectRandomMoves } from './gm-tools.js';
import { UnitSettings } from '../store/useUIStore.js';
import { RANK_ATTRIBUTE_POINTS, RANK_SKILL_LIMITS, RANK_SKILL_POINTS } from './core.js';
import { SKILLS, TRAINER_ATTRIBUTES } from '../constants/gameConstants.js';

const TRAINER_NAMES = [
    // Original Names
    "Ace", "Aria", "Axel", "Blaze", "Brock", "Cassidy", "Cynthia", "Drake",
    "Erika", "Flint", "Giselle", "Hunter", "Iris", "Jasmine", "Koga", "Lorelei",
    "Misty", "Nate", "Olivia", "Phoebe", "Quinn", "Roxie", "Sabrina", "Tate",
    "Ursula", "Victor", "Whitney", "Xander", "Yasmine", "Zane",
    "Aden", "Aiden", "Akira", "Alder", "Amber", "Apollo", "Archer", "Ash",
    "Aspen", "Astrid", "Atlas", "Aurora", "Baron", "Beau", "Birch", "Blade",
    "Bolt", "Brawly", "Breeze", "Briar", "Brooke", "Bruno", "Bryce", "Byron",
    "Cade", "Caelan", "Candice", "Celeste", "Chase", "Cinder", "Clay", "Cliff",
    "Cobalt", "Cole", "Colt", "Coral", "Corbin", "Cove", "Cruz", "Crystal",
    "Daisy", "Dakota", "Dallas", "Dante", "Dawn", "Dex", "Diamond", "Duke",
    "Dusty", "Echo", "Eclipse", "Eden", "Elm", "Ember", "Falkner", "Fern",
    "Fia", "Finn", "Forrest", "Gale", "Gardenia", "Garnet", "Grant", "Griffin",
    "Halen", "Harlow", "Hawk", "Hazel", "Heath", "Hex", "Holly", "Indigo",
    "Ivy", "Jade", "Jagger", "Jasper", "Jett", "Jinx", "Jolt", "Judd", "Juniper",
    "Kai", "Kane", "Kenji", "Kieran", "Klaus", "Lana", "Lance", "Lark", "Leaf",
    "Leif", "Lena", "Leo", "Lex", "Lief", "Lila", "Linden", "Loch", "Luna",
    "Lux", "Lyra", "Mace", "Magnus", "Maple", "Marina", "Marshal", "Maverick",
    "Max", "Meadow", "Milo", "Morgan", "Nash", "Neo", "Nero", "Nico", "Nova",
    "Nyx", "Oakley", "Ocean", "Odin", "Olive", "Onyx", "Opal", "Orion",
    "Parker", "Pearl", "Perrin", "Petra", "Phoenix", "Piper", "Poppy",
    "Rai", "Rain", "Ranger", "Raven", "Ray", "Reed", "Rex", "Ridge",
    "Riley", "Rio", "River", "Rocco", "Roman", "Ronan", "Rory", "Rowan",
    "Ruby", "Rune", "Ryder", "Ryu", "Sable", "Sagan", "Sage", "Sapphire",
    "Sawyer", "Scarlett", "Serena", "Shade", "Shane", "Shaw", "Sierra",
    "Silas", "Silver", "Skye", "Slate", "Sol", "Soren", "Sparrow", "Spike",
    "Steel", "Sterling", "Stone", "Storm", "Suki", "Summer", "Talon",
    "Tanner", "Tara", "Terra", "Thorne", "Tidus", "Timber", "Topaz", "Tori",
    "Trace", "Trent", "Umbra", "Vail", "Vale", "Valor", "Vance", "Vaughn",
    "Vesper", "Violet", "Volt", "Wade", "Walker", "West", "Wilder",
    "Willow", "Winter", "Wolf", "Wren", "Wyatt", "Zelda", "Zephyr", "Zinnia"
];
export const getTeamSizeForRank = (rank: Rank): number => {
    switch (rank) {
        case 'Starter': return Math.floor(Math.random() * 2) + 1; // 1-2
        case 'Beginner': return Math.floor(Math.random() * 2) + 2; // 2-3
        case 'Amateur': return Math.floor(Math.random() * 2) + 3; // 3-4
        case 'Ace': return Math.floor(Math.random() * 2) + 4; // 4-5
        case 'Pro': return Math.floor(Math.random() * 2) + 5; // 5-6
        case 'Master': return 6;
        case 'Champion': return 6;
        default: return 3;
    }
};

const ALL_TRAINER_SKILLS = Object.values(SKILLS).flat().map(s => s.field);

function generateTrainerStats(rank: Rank): Partial<NPCTrainer> {
    const stats: Partial<NPCTrainer> = {
        strength: 1, dexterity: 1, vitality: 1, insight: 1,
        brawl: 0, throw: 0, evasion: 0, weapons: 0,
        alert: 0, athletic: 0, natureSurvival: 0, stealth: 0,
        allure: 0, etiquette: 0, intimidate: 0, perform: 0,
        crafts: 0, lore: 0, medicine: 0, science: 0,
    };

    // 1. Distribute Attribute Points
    let attrPointsToSpend = RANK_ATTRIBUTE_POINTS[rank];
    const availableAttributes = [...TRAINER_ATTRIBUTES.map(a => a.field as keyof NPCTrainer)];
    
    while (attrPointsToSpend > 0) {
        const randomIndex = Math.floor(Math.random() * availableAttributes.length);
        const randomAttr = availableAttributes[randomIndex];
        const currentValue = stats[randomAttr];
        if (typeof currentValue === 'number' && currentValue < 5) { // Assuming a max of 5 for trainer attributes
            (stats as any)[randomAttr] = currentValue + 1;
            attrPointsToSpend--;
        }
    }

    // 2. Distribute Skill Points
    let skillPointsToSpend = RANK_SKILL_POINTS[rank];
    const skillLimit = RANK_SKILL_LIMITS[rank];
    let availableSkills = [...ALL_TRAINER_SKILLS.map(s => s as keyof NPCTrainer)];

    while (skillPointsToSpend > 0 && availableSkills.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableSkills.length);
        const randomSkill = availableSkills[randomIndex];
        const currentSkillValue = stats[randomSkill];

        if (typeof currentSkillValue === 'number' && currentSkillValue < skillLimit) {
            (stats as any)[randomSkill] = currentSkillValue + 1;
            skillPointsToSpend--;
        } else {
            availableSkills.splice(randomIndex, 1);
        }
    }

    return stats;
}


export function generateNPCTrainer(
    rank: Rank,
    allPokemon: Pokedex[],
    allMoves: Record<string, Move>,
    allSprites: Sprite[],
    unitSettings: UnitSettings,
    options: NPCTrainerOptions = {},
    suggestedName?: string,
    suggestedTeam?: Pokedex[]
): NPCTrainer {
    const name = suggestedName || TRAINER_NAMES[Math.floor(Math.random() * TRAINER_NAMES.length)];
    const team: NPCPokemon[] = [];
    const trainerStats = generateTrainerStats(rank);

    const teamToGenerate = suggestedTeam || [];
    if (!suggestedTeam) {
        const teamSize = options.teamSize ?? getTeamSizeForRank(rank);
        const legendaryFilter = (p: Pokedex) => !p.Legendary || !!options.allowLegendaries;
        const formFilter = (p: Pokedex) => !p.Name.includes('Form)') || !options.excludeForms;

        const combinedFilter = (p: Pokedex) => legendaryFilter(p) && formFilter(p);

        let candidates;
        if (rank) {
            candidates = allPokemon.filter(p => p.RecommendedRank === rank && combinedFilter(p));
            if (candidates.length === 0) {
                candidates = allPokemon.filter(combinedFilter);
            }
        } else {
            candidates = allPokemon.filter(combinedFilter);
        }

        for (let i = 0; i < teamSize; i++) {
            if (candidates.length === 0) break;
            const randomIndex = Math.floor(Math.random() * candidates.length);
            const pokemonData = candidates[randomIndex];
            teamToGenerate.push(pokemonData);
            candidates.splice(randomIndex, 1);
        }
    }

    for (const pokemonData of teamToGenerate) {
        const baseSheet = createInitialSheetData(pokemonData, unitSettings, rank);
        const sheetWithBonuses = applyRandomBonusPoints(pokemonData, baseSheet, rank);
        const selectedMoves = selectRandomMoves(pokemonData, sheetWithBonuses, allMoves);

        const npcPokemon: NPCPokemon = {
            pokedexData: pokemonData,
            sheetData: {
                ...sheetWithBonuses,
                moves: selectedMoves,
            },
        };
        team.push(npcPokemon);
    }

    const randomSprite = allSprites[Math.floor(Math.random() * allSprites.length)];

    return {
        name,
        rank,
        team,
        spriteUrl: randomSprite.spriteUrl,
        ...trainerStats,
    } as NPCTrainer;
}

export function regenerateNPCTrainerStats(
    existingTrainer: NPCTrainer,
    allPokemon: Pokedex[],
    allMoves: Record<string, Move>,
    unitSettings: UnitSettings,
): NPCTrainer {
    const newTrainerStats = generateTrainerStats(existingTrainer.rank);

    const newTeam: NPCPokemon[] = existingTrainer.team.map(pokemon => {
        const baseSheet = createInitialSheetData(pokemon.pokedexData, unitSettings, existingTrainer.rank);
        const sheetWithBonuses = applyRandomBonusPoints(pokemon.pokedexData, baseSheet, existingTrainer.rank);
        const selectedMoves = selectRandomMoves(pokemon.pokedexData, sheetWithBonuses, allMoves);

        return {
            ...pokemon,
            sheetData: {
                ...sheetWithBonuses,
                moves: selectedMoves,
            },
        };
    });

    return {
        ...existingTrainer,
        ...newTrainerStats,
        team: newTeam,
    } as NPCTrainer;
}

export function regenerateNPCTrainerForNewRank(
    existingTrainer: NPCTrainer,
    newRank: Rank,
    allMoves: Record<string, Move>,
    unitSettings: UnitSettings
): NPCTrainer {
    // 1. Regenerate trainer's own stats for the new rank
    const newTrainerStats = generateTrainerStats(newRank);

    // 2. Regenerate each Pokémon's sheet for the new rank, but keep the same Pokémon
    const newTeam: NPCPokemon[] = existingTrainer.team.map(pokemon => {
        const baseSheet = createInitialSheetData(pokemon.pokedexData, unitSettings, newRank);
        const sheetWithBonuses = applyRandomBonusPoints(pokemon.pokedexData, baseSheet, newRank);
        const selectedMoves = selectRandomMoves(pokemon.pokedexData, sheetWithBonuses, allMoves);

        return {
            ...pokemon,
            sheetData: {
                ...sheetWithBonuses,
                moves: selectedMoves,
            },
        };
    });

    // 3. Return the updated trainer object
    return {
        ...existingTrainer,
        ...newTrainerStats,
        rank: newRank,
        team: newTeam,
    } as NPCTrainer;
}