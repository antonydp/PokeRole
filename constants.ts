


export const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/Willowlark/Pokerole-Data/master/images/HomeSprites/';

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

export const RANKS = ['Starter', 'Beginner', 'Amateur', 'Ace', 'Pro', 'Master', 'Champion'] as const;
export type Rank = typeof RANKS[number];

export const RANK_SKILL_LIMITS: Record<Rank, number> = {
    Starter: 1,
    Beginner: 2,
    Amateur: 3,
    Ace: 4,
    Pro: 5,
    Master: 5,
    Champion: 5,
};

export const RANK_ORDER: Record<Rank, number> = {
    Starter: 0,
    Beginner: 1,
    Amateur: 2,
    Ace: 3,
    Pro: 4,
    Master: 5,
    Champion: 6,
};

export const RANK_ATTRIBUTE_POINTS: Record<Rank, number> = {
    Starter: 0,
    Beginner: 2,
    Amateur: 4,
    Ace: 6,
    Pro: 8,
    Master: 8,
    Champion: 10, // Total 14, base 4 -> 10 to spend
};

export const RANK_SOCIAL_ATTRIBUTE_POINTS: Record<Rank, number> = {
    Starter: 0,
    Beginner: 2,
    Amateur: 4,
    Ace: 6,
    Pro: 8,
    Master: 9, // Total 14, base 5 -> 9 to spend
    Champion: 9,
};

export const RANK_SKILL_POINTS: Record<Rank, number> = {
    Starter: 5,
    Beginner: 9,
    Amateur: 12,
    Ace: 14,
    Pro: 15,
    Master: 15,
    Champion: 16,
};


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