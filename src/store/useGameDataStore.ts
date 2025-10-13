import { create } from 'zustand';
import { Pokedex, Move, Ability, ItemsData, Ribbon, Badge, Sprite } from '../types/index.js';
import { fetchAllData } from '../../services/pokedexService.js';

interface GameDataState {
    allPokemon: Pokedex[];
    allMoves: Record<string, Move>;
    allAbilities: Record<string, Ability>;
    allItems: ItemsData | null;
    ribbonsData: Ribbon[];
    allBadges: Badge[];
    allSprites: Sprite[];
    isLoading: boolean;
    error: string | null;
    loadData: () => Promise<void>;
}

export const useGameDataStore = create<GameDataState>((set) => ({
    allPokemon: [],
    allMoves: {},
    allAbilities: {},
    allItems: null,
    ribbonsData: [],
    allBadges: [],
    allSprites: [],
    isLoading: true,
    error: null,
    loadData: async () => {
        try {
            set({ isLoading: true, error: null });
            const { pokemonData, movesData, abilitiesData, itemsData, ribbonsData, badgesData, spritesData } = await fetchAllData();
            
            const movesMap = movesData.reduce((acc, move) => {
                acc[move._id] = move;
                return acc;
            }, {} as Record<string, Move>);

            const abilitiesMap = abilitiesData.reduce((acc, ability) => {
                acc[ability._id] = ability;
                return acc;
            }, {} as Record<string, Ability>);

            set({
                allPokemon: pokemonData,
                allMoves: movesMap,
                allAbilities: abilitiesMap,
                allItems: itemsData,
                ribbonsData: ribbonsData,
                allBadges: badgesData,
                allSprites: spritesData,
                isLoading: false
            });
        } catch (err) {
            set({ error: 'Failed to fetch Pokémon data. Please try again.', isLoading: false });
            console.error(err);
        }
    },
}));