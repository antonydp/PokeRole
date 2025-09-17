import OpenAI from 'openai';
import { Pokedex, TeamMember } from '../types';

const API_KEY = process.env.API_KEY;

const openai = new OpenAI({
  apiKey: API_KEY,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  dangerouslyAllowBrowser: true,
});

export async function suggestTeam(
    prompt: string,
    allPokemon: Pokedex[],
    currentTeam: TeamMember[]
): Promise<string[]> {
    const currentTeamNames = new Set(currentTeam.map(member => member.pokedexData.Name));
    const availablePokemon = allPokemon
        .filter(p => !currentTeamNames.has(p.Name))
        .map(p => p.Name);
    
    const systemPrompt = `You are a Pokémon team building expert for the Pokérole tabletop RPG. Your task is to suggest a team of up to 6 Pokémon based on the user's request.
- Analyze the user's prompt to understand their desired playstyle, strategy, or type preferences.
- Choose from the provided list of available Pokémon. Do not suggest any Pokémon not on this list.
- Prioritize creating a balanced team unless the user specifies otherwise.
- Return your response as a valid JSON object with a single key "team" which is an array of strings, where each string is the exact name of a suggested Pokémon. Example: {"team": ["Pikachu", "Charizard", "Blastoise"]}`;

    const userMessage = `User request: "${prompt}".
Available Pokémon: [${availablePokemon.join(', ')}]`;

    try {
        const response = await openai.chat.completions.create({
            model: 'models/gemini-2.5-flash',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            // Requesting JSON output directly through prompt engineering
        });
        
        const content = response.choices[0].message.content;
        if (!content) {
            throw new Error("AI returned an empty response.");
        }

        // The response might be wrapped in markdown backticks. Clean it up.
        const jsonString = content.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(jsonString);
        
        if (parsed.team && Array.isArray(parsed.team)) {
            // Ensure all suggested pokemon are strings and exist in the available list
            return parsed.team.filter(name => typeof name === 'string' && availablePokemon.includes(name));
        } else {
            throw new Error("AI response is not in the expected format.");
        }

    } catch (error) {
        console.error("Error calling AI service:", error);
        throw new Error("Failed to get team suggestion from AI. The model may be unavailable or the request failed. Please try again.");
    }
}
