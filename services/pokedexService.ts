import { Pokedex, Move, Ability, ItemsData } from '../types';

interface FetchAllDataResponse {
  pokemonData: Pokedex[];
  movesData: Move[];
  abilitiesData: Ability[];
  itemsData: ItemsData;
}

const DATA_REPO_BASE_URL = 'https://raw.githubusercontent.com/antonydp/PokeRole-data/main/public/data';

export const fetchAllData = async (): Promise<FetchAllDataResponse> => {
  try {
    // Fetch the three pre-processed files from the user's dedicated data repository.
    // This is significantly faster and more reliable than fetching hundreds of individual files.
    const [pokemonRes, movesRes, abilitiesRes, itemsRes] = await Promise.all([
      fetch(`${DATA_REPO_BASE_URL}/all_pokemon.json`),
      fetch(`${DATA_REPO_BASE_URL}/all_moves.json`),
      fetch(`${DATA_REPO_BASE_URL}/all_abilities.json`),
      fetch(`${DATA_REPO_BASE_URL}/all_items.json`),
    ]);

    // Check if all requests were successful
    if (!pokemonRes.ok || !movesRes.ok || !abilitiesRes.ok || !itemsRes.ok) {
        throw new Error(`Failed to fetch pre-processed data files. Statuses: P(${pokemonRes.status}), M(${movesRes.status}), A(${abilitiesRes.status}), I(${itemsRes.status})`);
    }

    const [pokemonData, movesData, abilitiesData, itemsData] = await Promise.all([
      pokemonRes.json(),
      movesRes.json(),
      abilitiesRes.json(),
      itemsRes.json(),
    ]);

    // Basic validation to ensure we received arrays of data.
    if (!Array.isArray(pokemonData) || !Array.isArray(movesData) || !Array.isArray(abilitiesData) || typeof itemsData !== 'object' || itemsData === null) {
        throw new Error("Fetched data is not in the expected array format.");
    }

    return { pokemonData, movesData, abilitiesData, itemsData };

  } catch (error) {
    console.error('Failed to fetch or parse pre-processed data:', error);
    // Re-throw a user-friendly error for the UI component to catch and display.
    if (error instanceof Error) {
        throw new Error(`A network error occurred while fetching game data. Please check your connection and try again. Details: ${error.message}`);
    }
    throw new Error('An unknown error occurred while fetching game data.');
  }
};