import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

export const streamCreativeSuggestion = async function* (
    prompt: string, 
    systemInstruction: string, 
    lang: Language
): AsyncGenerator<string, void, unknown> {
    // Use standard Vite environment variable access
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
        throw new Error("API Key not found. Please check configuration.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const modelId = "gemini-2.5-flash"; // Fast and capable for text tasks
    
    try {
        const responseStream = await ai.models.generateContentStream({
            model: modelId,
            contents: prompt,
            config: {
                systemInstruction,
                temperature: 0.85, // Balanced creativity
                topK: 40,
                maxOutputTokens: 600,
            }
        });

        for await (const chunk of responseStream) {
            if (chunk.text) {
                yield chunk.text;
            }
        }
    } catch (error) {
        console.error("Gemini Stream Error:", error);
        throw error;
    }
};
