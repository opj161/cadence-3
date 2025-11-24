import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

// Note: In a real production app, API calls should be proxied through a backend 
// to keep the API key secure. For this client-side demo, we use the env var directly.
const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key not found in environment variables.");
    }
    return new GoogleGenAI({ apiKey });
};

export const getCreativeSuggestion = async (
    contextText: string, 
    instruction: string, 
    lang: Language
): Promise<string> => {
    try {
        const ai = getClient();
        const modelId = "gemini-2.5-flash"; // Fast and capable for text tasks

        const langName = lang === Language.DE ? "German" : "English";
        
        const systemPrompt = `You are an expert songwriting assistant for a musician using the 'Cadence' app. 
        Your goal is to help with rhymes, rhythm, and lyrical flow.
        The user is writing in ${langName}.
        Keep suggestions concise, artistic, and strictly relevant to the request.
        Return ONLY the suggested text/lyrics, no conversational filler.`;

        const response = await ai.models.generateContent({
            model: modelId,
            contents: `Current Lyrics Context:\n${contextText}\n\nTask: ${instruction}`,
            config: {
                systemInstruction: systemPrompt,
                temperature: 0.8, // Slightly creative
                maxOutputTokens: 200,
            }
        });

        return response.text || "No suggestion generated.";

    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Could not generate suggestion. Please check your API key.";
    }
};
