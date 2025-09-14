
import { Pokedex, Move, Ability } from '../types';

interface FetchAllDataResponse {
  pokemonData: Pokedex[];
  movesData: Move[];
  abilitiesData: Ability[];
}

const GITHUB_REPO_OWNER = 'Pokerole-Software-Development';
const GITHUB_REPO_NAME = 'Pokerole-Data';
const GITHUB_BRANCH = 'master';
const BASE_PATH = 'Version20';

const GITHUB_TREES_API_URL = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/git/trees/${GITHUB_BRANCH}?recursive=1`;
const GITHUB_RAW_BASE_URL = `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/${GITHUB_BRANCH}/`;

/**
 * Fetches a JSON file from a URL with a simple retry mechanism for network errors.
 * @param url The URL to fetch.
 * @param retries Number of retry attempts.
 * @param delay Delay between retries in ms.
 * @returns A promise that resolves to the parsed JSON data, or null if it fails.
 */
async function fetchJsonWithRetries(url: string, retries = 3, delay = 500): Promise<any> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                return await response.json();
            }
             // For client-side errors (like 404), don't retry.
            if (response.status >= 400 && response.status < 500) {
                console.warn(`Client error fetching ${url} (status: ${response.status}). Skipping.`);
                return null;
            }
        } catch (error) {
            console.warn(`Network error fetching ${url}. Retrying in ${delay}ms...`, error);
        }
        await new Promise(res => setTimeout(res, delay * (i + 1)));
    }
    console.error(`Failed to fetch ${url} after ${retries} attempts.`);
    return null;
}

/**
 * Fetches an array of JSON files with limited concurrency.
 * @param urls Array of URLs to fetch.
 * @param concurrencyLimit The maximum number of parallel requests.
 * @returns A promise that resolves to an array of the fetched data.
 */
async function fetchAllJsonsConcurrently<T>(urls: string[], concurrencyLimit: number = 10): Promise<T[]> {
    const results: T[] = [];
    let currentUrlIndex = 0;

    const worker = async () => {
        while (currentUrlIndex < urls.length) {
            // Atomically get the next index to process
            const index = currentUrlIndex++;
            if (index < urls.length) {
                const url = urls[index];
                const data = await fetchJsonWithRetries(url);
                if (data) {
                    // Pushing to an array from multiple workers is safe in JS's single-threaded model
                    results.push(data);
                }
            }
        }
    };
    
    const workerPromises = Array(concurrencyLimit).fill(0).map(worker);
    await Promise.all(workerPromises);
    
    return results;
}


export const fetchAllData = async (): Promise<FetchAllDataResponse> => {
  try {
    const treeRes = await fetch(GITHUB_TREES_API_URL);
    if (!treeRes.ok) {
        if (treeRes.status === 403) {
            console.error(`GitHub API rate limit exceeded while fetching file tree.`);
            throw new Error(`GitHub API rate limit exceeded. Please wait before trying again.`);
        }
        throw new Error(`Failed to fetch file tree from GitHub: ${treeRes.statusText}`);
    }
    const treeData = await treeRes.json();
    
    if (treeData.truncated) {
        console.warn("GitHub API file tree was truncated; some data may be missing.");
    }

    const pokemonUrls: string[] = [];
    const movesUrls: string[] = [];
    const abilitiesUrls: string[] = [];

    const pokedexPath = `${BASE_PATH}/Pokedex/`;
    const movesPath = `${BASE_PATH}/Moves/`;
    const abilitiesPath = `${BASE_PATH}/Abilities/`;
    
    for (const item of treeData.tree) {
        if (item.type === 'blob' && item.path.endsWith('.json')) {
            if (item.path.startsWith(pokedexPath)) {
                pokemonUrls.push(`${GITHUB_RAW_BASE_URL}${item.path}`);
            } else if (item.path.startsWith(movesPath)) {
                movesUrls.push(`${GITHUB_RAW_BASE_URL}${item.path}`);
            } else if (item.path.startsWith(abilitiesPath)) {
                abilitiesUrls.push(`${GITHUB_RAW_BASE_URL}${item.path}`);
            }
        }
    }
    
    const [pokemonData, movesData, abilitiesData] = await Promise.all([
      fetchAllJsonsConcurrently<Pokedex>(pokemonUrls),
      fetchAllJsonsConcurrently<Move>(movesUrls),
      fetchAllJsonsConcurrently<Ability>(abilitiesUrls),
    ]);

    return { pokemonData, movesData, abilitiesData };

  } catch (error) {
    console.error('Failed to fetch data:', error);
    // Re-throw so the UI can display a user-friendly error message.
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
        throw new Error('A network error occurred. Please check your connection and try again.');
    }
    throw error;
  }
};
