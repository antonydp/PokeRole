import { Pokedex, PokemonData, TrainerData, ItemInstance, TeamMember, TeamTypeCoverageData } from './types';
import { TYPE_CHART } from './constants';

type UnitSettings = {
    height: 'imperial' | 'metric';
    weight: 'imperial' | 'metric';
};

const getMultiplier = (attackingType: string, defendingType: string): number => {
    const defenseData = TYPE_CHART[defendingType];
    if (!defenseData) return 1;
    if (defenseData.immunities.includes(attackingType)) return 0;
    if (defenseData.resistances.includes(attackingType)) return 0.5;
    if (defenseData.weaknesses.includes(attackingType)) return 2;
    return 1;
};

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


export const createInitialSheetData = (pokemon: Pokedex, unitSettings: UnitSettings): PokemonData => {
    // A Pokémon can learn a number of moves equal to its Insight score + 2.
    const emptyMoves = Array(pokemon.Insight + 2).fill(null);
    
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
        hp: String(pokemon.BaseHP + pokemon.Vitality),
        will: String(pokemon.Insight + 2),
        item: '',
        status: 'Healthy',
        initiative: String(pokemon.Dexterity + 0),
        accuracy: '',
        damage: '',
        evasionValue: String(pokemon.Dexterity + 0),
        clashValue: `${pokemon.Strength} / ${pokemon.Special}`,
        defSDef: `${pokemon.Vitality} / ${pokemon.Insight}`,
        rank: pokemon.RecommendedRank || 'Starter',
        size: sizeString,
        weight: weightString,
        moves: emptyMoves,
    };
};

export const createInitialTrainerData = (): TrainerData => {
    const now = Date.now();
    return {
        // Trainer Card
        name: 'Ash Ketchum',
        age: '10',
        hometown: 'Pallet Town',
        trainerRank: 'Rookie',
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
        // FIX: Renamed 'nature' to 'natureSkill' to resolve duplicate key error.
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
