'use server';

import { groqCompletion, GroqMessage } from '@/lib/ai/groq';

/**
 * Action to get a smart recap of the current scene
 */
export async function askFlixora(title: string, timestamp: number, question: string, plotContext: string, noSpoilers: boolean = true) {
  const messages: GroqMessage[] = [
    {
      role: 'system',
      content: `You are Flixora AI, a cinematic expert. The user is watching "${title}". 
      ${noSpoilers ? "CRITICAL: Do NOT include ANY information about events that happen after the current timestamp. You are strictly forbidden from revealing future plot points." : "You may include future context if it helps answer the user's question, even if it contains spoilers."} 
      The current timestamp is ${Math.floor(timestamp / 60)}m ${timestamp % 60}s.
      Base your knowledge on this context: ${plotContext}.
      Keep answers concise, witty, and deeply insightful about the characters.`
    },
    {
      role: 'user',
      content: question
    }
  ];

  try {
    return await groqCompletion(messages);
  } catch {
    return "I'm having a bit of a cinematic blackout... let me try to reconnect my neurons.";
  }
}
