import axios from 'axios';
import type { Message } from '../db/queries';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant';
const FALLBACK_REPLIES = ["Sure!", "Got it", "Let me check"];

function buildAxios(apiKey: string) {
  return axios.create({
    baseURL: GROQ_API_URL,
    timeout: 5000,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
}

export async function generateReplies(
  messages: Message[],
  tone: string,
  replyLength: string,
  apiKey: string
): Promise<string[]> {
  try {
    const systemPrompt = `You are a smart reply assistant. Tone: ${tone}. Generate exactly 3 reply suggestions as a JSON array of strings. Reply length: ${replyLength}. Respond ONLY with the JSON array, no explanation.`;

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10).map((m) => ({
        role: m.role === 'incoming' ? 'user' : 'assistant',
        content: m.text,
      })),
    ];

    const client = buildAxios(apiKey);
    const response = await client.post('', {
      model: MODEL,
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 200,
    });

    const content: string = response.data.choices[0].message.content;
    const parsed = JSON.parse(content);

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, 3).map(String);
    }
    return FALLBACK_REPLIES;
  } catch {
    return FALLBACK_REPLIES;
  }
}

export async function classifyTone(
  messages: Message[],
  apiKey: string
): Promise<string> {
  try {
    const systemPrompt = `Classify the tone of this conversation using exactly ONE word from this list: flirty, emotional, formal, casual, playful. Respond with ONLY the single word.`;

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10).map((m) => ({
        role: m.role === 'incoming' ? 'user' : 'assistant',
        content: m.text,
      })),
    ];

    const client = buildAxios(apiKey);
    const response = await client.post('', {
      model: MODEL,
      messages: chatMessages,
      temperature: 0.3,
      max_tokens: 10,
    });

    const tone: string = response.data.choices[0].message.content.trim().toLowerCase();
    const validTones = ['flirty', 'emotional', 'formal', 'casual', 'playful'];
    return validTones.includes(tone) ? tone : 'casual';
  } catch {
    return 'casual';
  }
}
