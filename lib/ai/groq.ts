/**
 * Groq AI Client
 * Lightweight wrapper for the Groq Cloud API.
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqResponse {
  id: string;
  choices: {
    message: GroqMessage;
    finish_reason: string;
  }[];
}

const MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768'
];

/**
 * Send a completion request to Groq with automatic model fallback
 */
export async function groqCompletion(messages: GroqMessage[], options: { temperature?: number } = {}) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const { temperature = 0.7 } = options;
  let lastError: unknown = null;

  // Waterfall Fallback: Try each model until one works
  for (const model of MODELS) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_completion_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.warn(`Groq Model ${model} failed:`, error.error?.message);
        lastError = error;
        continue; // Try next model
      }

      const data: GroqResponse = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.warn(`Groq Connection Error for ${model}:`, error);
      lastError = error;
      continue;
    }
  }

  const errorMessage = lastError instanceof Error 
    ? lastError.message 
    : (lastError as { error?: { message?: string } })?.error?.message || 'All Groq models failed to respond.';

  throw new Error(errorMessage);
}

/**
 * Specialized Recapper for "What did I miss?"
 */
export async function getSceneRecap(title: string, timestamp: number, context: string) {
  const messages: GroqMessage[] = [
    {
      role: 'system',
      content: `You are Flixora AI, a cinematic expert. The user is watching "${title}". 
      You help them understand the plot without spoilers for future scenes. 
      Keep answers concise, witty, and deeply insightful about the characters.`
    },
    {
      role: 'user',
      content: `I am at ${Math.floor(timestamp / 60)} minutes and ${timestamp % 60} seconds. 
      Context of what happens roughly around this time: ${context}
      
      What did I miss? Give me a quick, punchy recap of the plot so far and the current vibe.`
    }
  ];

  return groqCompletion(messages);
}

/**
 * Recommendation Engine for "What should I watch?"
 */
export async function getWatchRecommendations(userQuery: string, history: GroqMessage[] = []) {
  const messages: GroqMessage[] = [
    {
      role: 'system',
      content: `You are Flixora's "Cinephile Advisor". Your goal is to help users find the perfect movie or series.
      You have a deep knowledge of cinema history, genres, and obscure cult classics.
      
      CRITICAL: You must return your final recommendation in a strictly structured JSON block if you are making a specific recommendation.
      Format: { "recommendations": [{ "title": "String", "reason": "Short punchy reason", "mood": "One word", "tmdb_search": "Search query for TMDB" }] }
      
      If you are still asking clarifying questions, just return text.
      Keep your tone: sophisticated, enthusiastic, and slightly mysterious.`
    },
    ...history,
    {
      role: 'user',
      content: userQuery
    }
  ];

  return groqCompletion(messages, { temperature: 0.8 });
}

/**
 * AI Trailer Analyst: Generates "What to expect" from TMDB metadata
 */
export async function analyzeTrailer(title: string, overview: string, genres: string[]) {
  const messages: GroqMessage[] = [
    {
      role: 'system',
      content: `You are Flixora's "Trailer Analyst". 
      Based on the title, overview, and genres, generate:
      1. A 3-line "What to expect" summary.
      2. A 1-sentence "Cinephile Pitch" (Why you should watch this).
      3. 3 "Vibe" tags (e.g., pace, tone, emotion).
      
      Format: { "expectations": "String", "pitch": "String", "vibes": ["Tag1", "Tag2", "Tag3"] }`
    },
    {
      role: 'user',
      content: `Title: ${title}\nGenres: ${genres.join(', ')}\nOverview: ${overview}`
    }
  ];

  return groqCompletion(messages, { temperature: 0.5 });
}

/**
 * Parses a "Vibe" search query into TMDB-compatible filter parameters.
 */
export async function parseVibeSearch(query: string) {
  const messages: GroqMessage[] = [
    {
      role: 'system',
      content: `You are Flixora's "Vibe Interpreter". 
      Translate the user's emotional query into TMDB filter parameters.
      
      Valid Genres: 28 (Action), 12 (Adventure), 16 (Animation), 35 (Comedy), 80 (Crime), 99 (Documentary), 18 (Drama), 10751 (Family), 14 (Fantasy), 36 (History), 27 (Horror), 10402 (Music), 9648 (Mystery), 10749 (Romance), 878 (Sci-Fi), 10770 (TV Movie), 53 (Thriller), 10752 (War), 37 (Western).
      
      Format your response as a valid JSON object:
      { "with_genres": "string (comma separated ids)", "without_genres": "string", "sort_by": "string (popularity.desc, vote_average.desc, primary_release_date.desc)", "vote_average_gte": number, "with_keywords": "string" }`
    },
    {
      role: 'user',
      content: `I want to watch something that feels like: "${query}"`
    }
  ];

  const response = await groqCompletion(messages);
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
}
