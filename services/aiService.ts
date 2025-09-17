import { Pokedex, TeamMember, SimplifiedPokedex } from '../types.js';

export async function suggestTeam(
    prompt: string,
    allPokemon: Pokedex[],
    currentTeam: TeamMember[]
): Promise<string[]> {
    try {
        const simplifiedPokemon: SimplifiedPokedex[] = allPokemon.map(p => ({
            Name: p.Name,
            Type1: p.Type1,
            Type2: p.Type2,
            BaseHP: p.BaseHP,
            Strength: p.Strength,
            Dexterity: p.Dexterity,
            Vitality: p.Vitality,
            Moves: p.Moves.map(m => m.Name),
        }));

        const apiUrl = import.meta.env.VITE_API_URL || '/api/suggest-team';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt, allPokemon: simplifiedPokemon, currentTeam }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch team suggestion');
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
        const parsed = JSON.parse(jsonString);

        if (parsed.team && Array.isArray(parsed.team)) {
            return parsed.team.filter((name: any) => typeof name === 'string');
        } else {
            throw new Error("AI response is not in the expected format.");
        }

    } catch (error) {
        console.error("Error calling backend service:", error);
        throw new Error("Failed to get team suggestion from the backend. Please ensure the server is running and try again.");
    }
}
