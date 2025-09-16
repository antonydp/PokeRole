import { Pokedex, Move, Ability } from '../types';

interface FetchAllDataResponse {
  pokemonData: Pokedex[];
  movesData: Move[];
  abilitiesData: Ability[];
}

const DATA_REPO_BASE_URL = 'https://raw.githubusercontent.com/antonydp/PokeRole-data/main/public/data';

export const fetchAllData = async (): Promise<FetchAllDataResponse> => {
  try {
    // Fetch the three pre-processed files from the user's dedicated data repository.
    // This is significantly faster and more reliable than fetching hundreds of individual files.
    const [pokemonRes, movesRes, abilitiesRes] = await Promise.all([
      fetch(`${DATA_REPO_BASE_URL}/all_pokemon.json`),
      fetch(`${DATA_REPO_BASE_URL}/all_moves.json`),
      fetch(`${DATA_REPO_BASE_URL}/all_abilities.json`),
    ]);

    // Check if all requests were successful
    if (!pokemonRes.ok || !movesRes.ok || !abilitiesRes.ok) {
        throw new Error(`Failed to fetch pre-processed data files. Statuses: P(${pokemonRes.status}), M(${movesRes.status}), A(${abilitiesRes.status})`);
    }

    const [pokemonData, movesData, abilitiesData] = await Promise.all([
      pokemonRes.json(),
      movesRes.json(),
      abilitiesRes.json(),
    ]);

    // Basic validation to ensure we received arrays of data.
    if (!Array.isArray(pokemonData) || !Array.isArray(movesData) || !Array.isArray(abilitiesData)) {
        throw new Error("Fetched data is not in the expected array format.");
    }

    return { pokemonData, movesData, abilitiesData };

  } catch (error) {
    console.error('Failed to fetch or parse pre-processed data:', error);
    // Re-throw a user-friendly error for the UI component to catch and display.
    if (error instanceof Error) {
        throw new Error(`A network error occurred while fetching game data. Please check your connection and try again. Details: ${error.message}`);
    }
    throw new Error('An unknown error occurred while fetching game data.');
  }
};