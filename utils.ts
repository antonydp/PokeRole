import { Pokedex, PokemonData } from './types';

type UnitSettings = {
    height: 'imperial' | 'metric';
    weight: 'imperial' | 'metric';
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
        tough: 0, cool: 0, beauty: 0, cute: 0, clever: 0,
        pokemonNature: '',
        confidence: '',
        happiness: 2,
        loyalty: 2,
        numberOfBattles: '0',
        victories: '0',
        accessory: '',
        type: [pokemon.Type1, pokemon.Type2].filter(Boolean).join(' / '),
        weakness: '',
        hp: String(pokemon.BaseHP + pokemon.Vitality),
        will: String(pokemon.Insight + 2),
        item: '',
        status: 'Healthy',
        initiative: String(pokemon.Dexterity),
        accuracy: '',
        damage: '',
        evasionValue: '',
        clashValue: '',
        defSDef: `${pokemon.Vitality} / ${pokemon.Insight}`,
        rank: pokemon.RecommendedRank || 'Starter',
        size: sizeString,
        weight: weightString,
        moves: emptyMoves,
    };
};