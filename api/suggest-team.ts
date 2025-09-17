import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { SimplifiedPokedex, TeamMember } from '../types.js';

export const config = {
  runtime: 'edge',
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    console.error("Missing API_KEY environment variable.");
    return new Response(JSON.stringify({ error: 'Server configuration error: Missing API Key.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const openai = new OpenAI({
    apiKey: API_KEY,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  });

  try {
    const { prompt, allPokemon, currentTeam } = await req.json();

    if (!prompt || !allPokemon || !currentTeam) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const stream = await getTeamSuggestionStream(openai, prompt, allPokemon, currentTeam);
    
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          controller.enqueue(new TextEncoder().encode(content));
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in suggest-team function:', error);
    return new Response(JSON.stringify({ error: 'Failed to get team suggestion from AI.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function getTeamSuggestionStream(
    openai: OpenAI,
    prompt: string,
    allPokemon: SimplifiedPokedex[],
    currentTeam: TeamMember[]
) {
    const currentTeamNames = new Set(currentTeam.map(member => member.pokedexData.Name));
    const availablePokemon = allPokemon.filter(p => !currentTeamNames.has(p.Name));
    
    const systemPrompt = `You are a Pokémon team building expert for the Pokérole tabletop RPG. Your task is to suggest a team of up to 6 Pokémon based on the user's request.
- Analyze the user's prompt to understand their desired playstyle, strategy, or type preferences.
- Choose from the provided list of available Pokémon. Do not suggest any Pokémon not on this list.
- Prioritize creating a balanced team unless the user specifies otherwise.
- Return your response as a valid JSON object with a single key "team" which is an array of strings, where each string is the exact name of a suggested Pokémon. Example: {"team": ["Pikachu", "Charizard", "Blastoise"]}`;

    const userMessage = `User request: "${prompt}".
Available Pokémon: ${JSON.stringify(availablePokemon, null, 2)}`;

    try {
        return await openai.chat.completions.create({
            model: 'models/gemini-2.5-flash',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            stream: true,
        });
    } catch (error) {
        console.error("Error calling AI service:", error);
        throw new Error("Failed to get team suggestion from AI. The model may be unavailable or the request failed. Please try again.");
    }
}