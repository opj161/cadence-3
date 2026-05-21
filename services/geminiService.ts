import { Language } from '../types';

const getBrowserGeminiApiKey = (): string | undefined => {
  // Browser-side keys are intentionally limited to local development. Production
  // deployments should call Gemini through a server-side or edge-function proxy.
  if (!import.meta.env.DEV) {
    return undefined;
  }

  return import.meta.env.VITE_GEMINI_API_KEY;
};

export const isBrowserGeminiConfigured = (): boolean => Boolean(getBrowserGeminiApiKey());

export const streamCreativeSuggestion = async function* (
  prompt: string,
  systemInstruction: string,
  lang: Language,
): AsyncGenerator<string, void, unknown> {
  const apiKey = getBrowserGeminiApiKey();

  if (!apiKey) {
    throw new Error('Gemini is not configured. Use a server-side proxy for production AI calls, or set VITE_GEMINI_API_KEY only for local development.');
  }

  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });
  const modelId = 'gemini-2.5-flash';
  const languageName = lang === Language.DE ? 'German' : 'English';

  try {
    const responseStream = await ai.models.generateContentStream({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: `${systemInstruction}\nWrite in ${languageName}.`,
        temperature: 0.85,
        topK: 40,
        maxOutputTokens: 600,
      },
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error('Gemini Stream Error:', error);
    throw error;
  }
};
