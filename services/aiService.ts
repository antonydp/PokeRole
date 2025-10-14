import { Pokedex, TeamMember, SimplifiedPokedex, Rank } from '../src/types/index.js';
import { NPCTrainerOptions } from '../src/logic/npc-generator.js';

async function fetchAIStream(apiUrl: string, body: object): Promise<any> {
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch from ${apiUrl}`);
    }

    if (!response.body) {
        throw new Error("Streaming response not available.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullResponse += decoder.decode(value, { stream: true });
    }
    
    const jsonString = fullResponse.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonString);
}

function simplifyPokemon(p: Pokedex): SimplifiedPokedex {
    return {
        Name: p.Name,
        Type1: p.Type1,
        Type2: p.Type2,
        BaseHP: p.BaseHP,
        Strength: p.Strength,
        Dexterity: p.Dexterity,
        Vitality: p.Vitality,
        Moves: p.Moves.map(m => m.Name),
        RecommendedRank: p.RecommendedRank,
    };
}

export async function suggestTeam(
    prompt: string,
    allPokemon: Pokedex[],
    currentTeam: TeamMember[]
): Promise<string[]> {
    try {
        const simplifiedPokemon = allPokemon.map(simplifyPokemon);
        const apiUrl = import.meta.env.VITE_API_URL || '/api/suggest-team';
        const body = { prompt, allPokemon: simplifiedPokemon, currentTeam };
        const parsed = await fetchAIStream(apiUrl, body);

        if (parsed.team && Array.isArray(parsed.team)) {
            return parsed.team.filter((name: any) => typeof name === 'string');
        } else {
            throw new Error("AI response is not in the expected format.");
        }
    } catch (error) {
        console.error("Error in suggestTeam service:", error);
        throw new Error("Failed to get team suggestion from the backend.");
    }
}

export async function suggestEncounter(
    prompt: string,
    allPokemon: Pokedex[],
    rank: Rank | undefined,
    numPokemon: number,
    selectedType: string | null,
    excludeForms: boolean
): Promise<{ team: string[], explanation: string }> {
    try {
        const simplifiedPokemon = allPokemon.map(simplifyPokemon);
        const apiUrl = import.meta.env.VITE_API_URL || '/api/suggest-encounter';
        const body = { prompt, allPokemon: simplifiedPokemon, rank, numPokemon, selectedType, excludeForms };
        const parsed = await fetchAIStream(apiUrl, body);

        if (parsed.team && Array.isArray(parsed.team) && typeof parsed.explanation === 'string') {
            return {
                team: parsed.team.filter((name: any) => typeof name === 'string'),
                explanation: parsed.explanation,
            };
        } else {
            throw new Error("AI response is not in the expected format.");
        }
    } catch (error) {
        console.error("Error in suggestEncounter service:", error);
        throw new Error("Failed to get encounter suggestion from the backend.");
    }
}

export async function suggestNPC(
    prompt: string,
    allPokemon: Pokedex[],
    rank: Rank | undefined,
    options: NPCTrainerOptions
): Promise<{ name: string, team: string[], explanation: string, rank: Rank }> {
    try {
        const simplifiedPokemon = allPokemon.map(simplifyPokemon);
        const apiUrl = import.meta.env.VITE_API_URL || '/api/suggest-npc';
        const body = { prompt, allPokemon: simplifiedPokemon, rank, options };
        const parsed = await fetchAIStream(apiUrl, body);

        if (parsed.name && typeof parsed.name === 'string' && parsed.team && Array.isArray(parsed.team) && typeof parsed.explanation === 'string' && parsed.rank && typeof parsed.rank === 'string') {
            return {
                name: parsed.name,
                team: parsed.team.filter((name: any) => typeof name === 'string'),
                explanation: parsed.explanation,
                rank: parsed.rank,
            };
        } else {
            throw new Error("AI response is not in the expected format.");
        }
    } catch (error) {
        console.error("Error in suggestNPC service:", error);
        throw new Error("Failed to get NPC suggestion from the backend.");
    }
}
