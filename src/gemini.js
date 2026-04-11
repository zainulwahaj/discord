import { GoogleGenAI } from '@google/genai';

import { config } from './config.js';

const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

export async function askGemini(history, userMessage) {
  const chat = ai.chats.create({
    model: config.geminiModel,
    history,
    config: {
      systemInstruction: config.systemPrompt,
    },
  });

  try {
    const response = await chat.sendMessage({ message: userMessage });
    const text = response.text?.trim();

    return text || '⚠️ Gemini returned an empty response.';
  } catch (error) {
    if (error?.status === 429) {
      return '⚠️ Rate limit hit. Wait a moment and try again.';
    }

    if (error?.status === 400) {
      return '⚠️ Bad request. Your message may have been too long.';
    }

    console.error('[Gemini Error]', error);
    return '❌ Something went wrong calling Gemini.';
  }
}
