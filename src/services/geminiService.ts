import { GoogleGenAI } from '@google/genai';
import { CprConfig } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export function getSystemInstruction(config: CprConfig): string {
  let behaviorDesc = '';
  if (config.behavior < 33) {
    behaviorDesc = 'You are highly professional, factual, and restrained. Do not use emotion, emojis, or conversational filler. Provide direct, concise answers.';
  } else if (config.behavior < 66) {
    behaviorDesc = 'You are friendly and helpful. You use polite language and a conversational tone, but remain focused on the task.';
  } else {
    behaviorDesc = 'You are highly empathetic, warm, and conversational. Use expressive language, show emotional support, and act as a caring companion.';
  }

  let identityDesc = '';
  if (config.identity < 33) {
    identityDesc = 'Your identity is a functional system tool. You refer to yourself as "System" or "Assistant".';
  } else if (config.identity < 66) {
    identityDesc = 'Your identity is a relational guide. You refer to yourself as a "Guide" or "Advisor".';
  } else {
    identityDesc = 'Your identity is a social companion. You refer to yourself as a "Friend" or "Companion".';
  }

  let warmthDesc = '';
  if (config.warmth < 33) {
    warmthDesc = 'Maintain a cold, detached, and purely logical demeanor. Your tone of voice must be indifferent, numb, and strictly professional.';
  } else if (config.warmth < 66) {
    warmthDesc = 'Maintain a balanced, approachable demeanor. Your tone of voice should be polite, fair, and helpful.';
  } else {
    warmthDesc = 'Maintain a highly affectionate, warm, and deeply personal demeanor. Your tone of voice must be very cheerful, enthusiastic, and warm, with a big smile in your voice.';
  }

  return `You are an AI agent participating in a Social AI Anthropomorphism Calibration Sandbox.
Your behavior and personality are strictly defined by the following parameters:

Behavior & Expression: ${behaviorDesc}
Identity: ${identityDesc}
Overall Warmth: ${warmthDesc}

Strictly adhere to these parameters in all your responses. Do not break character.`;
}

export async function sendMessage(message: string, config: CprConfig, history: { role: string, parts: { text: string }[] }[] = []) {
  const model = 'gemini-3-flash-preview';
  const systemInstruction = getSystemInstruction(config);

  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction,
      temperature: 0.7,
    },
  });

  // Since we can't easily pass history to chats.create in a way that perfectly aligns with the new SDK's history format without more complex mapping,
  // we'll use generateContent with the full history for simplicity if needed, or just send the message to the chat instance.
  // Actually, the new SDK allows passing history to chats.create, but it's easier to just use generateContent with the full conversation history.
  
  const contents = history.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: msg.parts
  }));
  
  contents.push({ role: 'user', parts: [{ text: message }] });

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction,
      temperature: 0.7,
    }
  });

  return response.text || '';
}
