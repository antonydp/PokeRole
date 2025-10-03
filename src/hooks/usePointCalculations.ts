import { useMemo } from 'react';
import type { PokemonData, Pokedex, TrainerData, Rank } from '../types/index.js';
import {
    RANK_ATTRIBUTE_POINTS,
    RANK_SOCIAL_ATTRIBUTE_POINTS,
    RANK_SKILL_POINTS
} from '../logic/core.js';

const ATTRIBUTE_FIELDS: (keyof PokemonData)[] = ['strength', 'dexterity', 'vitality', 'special', 'insight'];
const SOCIAL_ATTRIBUTE_FIELDS: (keyof PokemonData)[] = ['tough', 'cool', 'beauty', 'cute', 'clever'];

type PokemonSkill = 'brawl' | 'channel' | 'clash' | 'evasion' | 'alert' | 'athletic' | 'nature' | 'stealth' | 'allure' | 'etiquette' | 'intimidate' | 'perform' | 'extraSkillValue';
const POKEMON_SKILL_FIELDS: PokemonSkill[] = ['brawl', 'channel', 'clash', 'evasion', 'alert', 'athletic', 'nature', 'stealth', 'allure', 'etiquette', 'intimidate', 'perform', 'extraSkillValue'];

type TrainerSkill = 'brawl' | 'throw' | 'evasion' | 'weapons' | 'alert' | 'athletic' | 'natureSurvival' | 'stealth' | 'allure' | 'etiquette' | 'intimidate' | 'perform' | 'crafts' | 'lore' | 'medicine' | 'science';
const TRAINER_SKILL_FIELDS: TrainerSkill[] = ['brawl', 'throw', 'evasion', 'weapons', 'alert', 'athletic', 'natureSurvival', 'stealth', 'allure', 'etiquette', 'intimidate', 'perform', 'crafts', 'lore', 'medicine', 'science'];

type SheetData = PokemonData | TrainerData;

export function usePointCalculations(data: SheetData, basePokemon?: Pokedex) {
    const isTrainer = !basePokemon;
    const rank = ('trainerRank' in data ? data.trainerRank : data.rank) as Rank;

    const {
        spentAttributePoints,
        totalAttributePoints,
        spentSocialAttributePoints,
        totalSocialAttributePoints,
        spentSkillPoints,
        totalSkillPoints
    } = useMemo(() => {
        const totalAttributePoints = RANK_ATTRIBUTE_POINTS[rank];
        const totalSocialAttributePoints = RANK_SOCIAL_ATTRIBUTE_POINTS[rank];
        const totalSkillPoints = RANK_SKILL_POINTS[rank];

        let spentAttributePoints = 0;
        let spentSocialAttributePoints = 0;
        let spentSkillPoints = 0;

        if (isTrainer) {
            const trainerData = data as TrainerData;
            spentAttributePoints = ((trainerData.strength ?? 1) - 1) + ((trainerData.dexterity ?? 1) - 1) + ((trainerData.vitality ?? 1) - 1) + ((trainerData.insight ?? 1) - 1);
            spentSocialAttributePoints = ((trainerData.tough ?? 1) - 1) + ((trainerData.cool ?? 1) - 1) + ((trainerData.beauty ?? 1) - 1) + ((trainerData.clever ?? 1) - 1) + ((trainerData.cute ?? 1) - 1);
            spentSkillPoints = TRAINER_SKILL_FIELDS.reduce((acc, field) => acc + (trainerData[field] || 0), 0) +
                (trainerData.extraSkills || []).reduce((acc, skill) => acc + (skill.value || 0), 0);
        } else {
            const pokemonData = data as PokemonData;
            spentAttributePoints =
                ((pokemonData.strength ?? basePokemon.Strength) - basePokemon.Strength) +
                ((pokemonData.dexterity ?? basePokemon.Dexterity) - basePokemon.Dexterity) +
                ((pokemonData.vitality ?? basePokemon.Vitality) - basePokemon.Vitality) +
                ((pokemonData.special ?? basePokemon.Special) - basePokemon.Special) +
                ((pokemonData.insight ?? basePokemon.Insight) - basePokemon.Insight);
            spentSocialAttributePoints =
                ((pokemonData.tough ?? 1) - 1) +
                ((pokemonData.cool ?? 1) - 1) +
                ((pokemonData.beauty ?? 1) - 1) +
                ((pokemonData.cute ?? 1) - 1) +
                ((pokemonData.clever ?? 1) - 1);
            spentSkillPoints = POKEMON_SKILL_FIELDS.reduce((acc, field) => acc + (pokemonData[field] || 0), 0);
        }

        return {
            spentAttributePoints,
            totalAttributePoints,
            spentSocialAttributePoints,
            totalSocialAttributePoints,
            spentSkillPoints,
            totalSkillPoints
        };
    }, [data, rank, isTrainer, basePokemon]);

    const points = {
        attributes: { spent: spentAttributePoints, total: totalAttributePoints },
        social: { spent: spentSocialAttributePoints, total: totalSocialAttributePoints },
        skills: { spent: spentSkillPoints, total: totalSkillPoints },
    };

    const isAttributePoolExhausted = spentAttributePoints >= totalAttributePoints;
    const isSocialAttributePoolExhausted = spentSocialAttributePoints >= totalSocialAttributePoints;
    const isSkillPoolExhausted = spentSkillPoints >= totalSkillPoints;

    return {
        points,
        isAttributePoolExhausted,
        isSocialAttributePoolExhausted,
        isSkillPoolExhausted,
        ATTRIBUTE_FIELDS,
        SOCIAL_ATTRIBUTE_FIELDS,
        POKEMON_SKILL_FIELDS,
        TRAINER_SKILL_FIELDS
    };
}