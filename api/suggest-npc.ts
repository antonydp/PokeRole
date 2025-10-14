/**
 * @file This module provides a serverless function for generating NPC trainer suggestions using OpenAI's API.
 * It acts as a backend endpoint to securely interact with the AI model, processing user prompts
 * and returning a fully-formed NPC trainer object.
 */

import OpenAI from 'openai';
import { Pokedex, Rank } from '../src/types/index.js';
import { RANKS } from '../src/constants/gameConstants.js';

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
    const { prompt, allPokemon, rank, options } = await req.json();

    if (!prompt || !allPokemon) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const stream = await getNPCSuggestionStream(openai, prompt, allPokemon, rank, options);
    
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
    console.error('Error in suggest-npc function:', error);
    return new Response(JSON.stringify({ error: 'Failed to get NPC suggestion from AI.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function getNPCSuggestionStream(
    openai: OpenAI,
    prompt: string,
    allPokemon: Pokedex[],
    rank: Rank | undefined,
    options: any
) {
    const legendaryFilter = (p: Pokedex) => !p.Legendary || !!options.allowLegendaries;
    let candidates;
    if (rank) {
        candidates = allPokemon.filter(p => p.RecommendedRank === rank && legendaryFilter(p));
        if (candidates.length === 0) {
            candidates = allPokemon.filter(legendaryFilter);
        }
    } else {
        candidates = allPokemon.filter(legendaryFilter);
    }

    const rankInstruction = rank
        ? `Your task is to suggest a thematic NPC trainer of rank "${rank}".`
        : `Your task is to suggest a thematic NPC trainer. First, analyze the user's prompt to determine the most appropriate rank from the following list: [${RANKS.join(', ')}]. The chosen rank should reflect the trainer's experience and theme.`;

    const systemPrompt = `You are a Pokémon Game Master assistant for the Pokérole tabletop RPG.
${rankInstruction}
- Analyze the user's prompt to understand the desired theme, personality, or role for the NPC.
- Suggest a name for the trainer.
- Suggest a team of Pokémon for the trainer, choosing from the provided list of available Pokémon candidates. The team size should be appropriate for the rank. Do not choose any forms or variants of Pokémon (e.g., Mega, Alolan) unless specifically requested.
- Provide a brief (2-3 sentences) thematic explanation for your choices, describing the trainer's background or strategy.
- Return your response as a single valid JSON object. The object must have four keys:
  1. "name": a string for the trainer's name. Use the one given by the user if provided, otherwise make one up.
  2. "team": an array of strings, where each string is the exact name of a suggested Pokémon.
  3. "explanation": a string containing the thematic explanation.
  4. "rank": a string with the chosen rank.
Example: {"name": "Bug Catcher Brandon", "team": ["Caterpie", "Weedle"], "explanation": "Brandon is a young bug enthusiast exploring the Viridian Forest to fill his Pokédex.", "rank": "Starter"}`;

    const userMessage = `User request: "${prompt}".
Available Pokémon${rank ? ` for rank ${rank}` : ''}: ${JSON.stringify(candidates.map(p => p.Name))}`;

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
        throw new Error("Failed to get NPC suggestion from AI. The model may be unavailable or the request failed. Please try again.");
    }
}