/**
 * @file This module provides a serverless function for generating Pokémon encounter suggestions using OpenAI's API.
 * It acts as a backend endpoint to securely interact with the AI model, processing user prompts
 * and returning a list of suggested Pokémon names based on available Pokémon and encounter parameters.
 */

import OpenAI from 'openai';
import { SimplifiedPokedex, Rank } from '../src/types/index.js';

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
    const { prompt, allPokemon, rank, numPokemon, selectedType } = await req.json();

    if (!prompt || !allPokemon || !numPokemon) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const stream = await getEncounterSuggestionStream(openai, prompt, allPokemon, rank, numPokemon, selectedType);
    
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
    console.error('Error in suggest-encounter function:', error);
    return new Response(JSON.stringify({ error: 'Failed to get encounter suggestion from AI.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function getEncounterSuggestionStream(
    openai: OpenAI,
    prompt: string,
    allPokemon: SimplifiedPokedex[],
    rank: Rank | undefined,
    numPokemon: number,
    selectedType: string | null
) {
    let candidates = allPokemon;
    if (rank) {
        candidates = candidates.filter(p => p.RecommendedRank === rank);
    }
    if (selectedType) {
        candidates = candidates.filter(p => p.Type1 === selectedType || p.Type2 === selectedType);
    }

    const systemPrompt = `You are a Pokémon Game Master assistant for the Pokérole tabletop RPG. Your task is to suggest a thematic encounter with ${numPokemon} Pokémon${rank ? ` of rank ${rank}` : ''}.
- Analyze the user's prompt to understand the desired theme, environment, or story for the encounter.
- Choose from the provided list of available Pokémon candidates. Do not suggest any Pokémon not on this list.
- Provide a brief (1-2 sentences) thematic explanation for your choices.
- Return your response as a single valid JSON object. The object should have two keys:
  1. "team": an array of strings, where each string is the exact name of a suggested Pokémon. The array should contain exactly ${numPokemon} Pokémon.
  2. "explanation": a string containing the thematic explanation.
Example: {"team": ["Pikachu", "Pichu"], "explanation": "A small family of electric mice are nesting in the power plant."}`;

    const userMessage = `User request: "${prompt}".
Available Pokémon${rank ? ` for rank ${rank}` : ''}${selectedType ? ` and type ${selectedType}` : ''}: ${JSON.stringify(candidates.map(p => p.Name))}`;

    try {
        return await openai.chat.completions.create({
            model: 'models/gemini-flash-latest',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            stream: true,
        });
    } catch (error) {
        console.error("Error calling AI service:", error);
        throw new Error("Failed to get encounter suggestion from AI. The model may be unavailable or the request failed. Please try again.");
    }
}