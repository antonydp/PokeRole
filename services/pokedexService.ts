import { Pokedex, Move, Ability, ItemsData, Ribbon, Badge, Sprite } from '../src/types/index.js';

interface FetchAllDataResponse {
  pokemonData: Pokedex[];
  movesData: Move[];
  abilitiesData: Ability[];
  itemsData: ItemsData;
  ribbonsData: Ribbon[];
  badgesData: Badge[];
  spritesData: Sprite[];
}

const DATA_REPO_BASE_URL = 'https://raw.githubusercontent.com/antonydp/PokeRole-data/main/public/data';

export const fetchAllData = async (): Promise<FetchAllDataResponse> => {
  try {
    // Fetch the three pre-processed files from the user's dedicated data repository.
    // This is significantly faster and more reliable than fetching hundreds of individual files.
    const [pokemonRes, movesRes, abilitiesRes, itemsRes, ribbonsRes, badgesRes, spritesRes] = await Promise.all([
      fetch(`${DATA_REPO_BASE_URL}/all_pokemon.json`),
      fetch(`${DATA_REPO_BASE_URL}/all_moves.json`),
      fetch(`${DATA_REPO_BASE_URL}/all_abilities.json`),
      fetch(`${DATA_REPO_BASE_URL}/all_items.json`),
      fetch(`${DATA_REPO_BASE_URL}/ribbons.json`),
      fetch(`${DATA_REPO_BASE_URL}/badges.json`),
      fetch(`${DATA_REPO_BASE_URL}/sprites.json`),
    ]);

    // Check if all requests were successful
    if (!pokemonRes.ok || !movesRes.ok || !abilitiesRes.ok || !itemsRes.ok || !ribbonsRes.ok || !badgesRes.ok || !spritesRes.ok) {
        throw new Error(`Failed to fetch pre-processed data files. Statuses: P(${pokemonRes.status}), M(${movesRes.status}), A(${abilitiesRes.status}), I(${itemsRes.status}), R(${ribbonsRes.status}), B(${badgesRes.status}), S(${spritesRes.status})`);
    }

    const [pokemonData, movesData, abilitiesData, itemsData, ribbonsData, badgesData, spritesData] = await Promise.all([
      pokemonRes.json(),
      movesRes.json(),
      abilitiesRes.json(),
      itemsRes.json(),
      ribbonsRes.json(),
      badgesRes.json(),
      spritesRes.json(),
    ]);

    // Basic validation to ensure we received arrays of data.
    if (!Array.isArray(pokemonData) || !Array.isArray(movesData) || !Array.isArray(abilitiesData) || typeof itemsData !== 'object' || itemsData === null || !Array.isArray(ribbonsData) || !Array.isArray(badgesData) || !Array.isArray(spritesData)) {
        throw new Error("Fetched data is not in the expected array format.");
    }

    return { pokemonData, movesData, abilitiesData, itemsData, ribbonsData, badgesData, spritesData };

  } catch (error) {
    console.error('Failed to fetch or parse pre-processed data:', error);
    // Re-throw a user-friendly error for the UI component to catch and display.
    if (error instanceof Error) {
        throw new Error(`A network error occurred while fetching game data. Please check your connection and try again. Details: ${error.message}`);
    }
    throw new Error('An unknown error occurred while fetching game data.');
  }
};