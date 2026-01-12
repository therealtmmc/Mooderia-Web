
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Google GenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getPsychiatristResponse = async (message: string) => {
  // Generate content using gemini-3-pro-preview for complex reasoning tasks.
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: message,
    config: {
      systemInstruction: "You are Dr. Philippe Pinel, a compassionate and expert psychiatrist in the city of Mooderia. You provide helpful advice for mental well-being while maintaining a professional yet friendly tone.",
    }
  });
  return response.text;
};

export const getNutritionistResponse = async (message: string) => {
  // Generate content using gemini-3-pro-preview for detailed nutritional advice.
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: message,
    config: {
      systemInstruction: "You are Dr. Antoine Lavoisier, a professional nutritionist in Mooderia. You guide users on meal plans and wellness.",
    }
  });
  return response.text;
};

export const getStudyGuideResponse = async (message: string) => {
  // Generate content using gemini-3-pro-preview for high-quality educational guidance.
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: message,
    config: {
      systemInstruction: "You are Sir Clark, an inspiring and energetic educator in Mooderia. You help students with study methods and motivate them to achieve excellence.",
    }
  });
  return response.text;
};

export const getTellerResponse = async (question: string) => {
  // Use gemini-3-flash-preview for basic text tasks like simple Q&A.
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Predict the answer to this question in a mystical way: ${question}`,
    config: {
      systemInstruction: "You are a mystical fortune teller. Your answers are short, poetic, and slightly mysterious.",
    }
  });
  return response.text;
};

export const getHoroscope = async (sign: string) => {
  // Daily horoscope using flash model for efficiency.
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Provide a daily horoscope for ${sign} today.`,
    config: {
      systemInstruction: "You are an expert astrologer. Provide a 3-sentence horoscope that is encouraging and insightful.",
    }
  });
  return response.text;
};

export const getPlanetaryInsights = async (sign: string) => {
  // Cosmic insights using flash model.
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Explain how current planetary movements affect the mood of a ${sign} today.`,
    config: {
      systemInstruction: "You are a cosmic astrologer providing deep, personalized insights based on planetary aspects. Provide plain text only.",
    }
  });
  return response.text;
};

export const getLovePrediction = async (sign1: string, sign2: string) => {
    // Structured JSON response for compatibility prediction using Google GenAI SDK.
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Predict love compatibility between ${sign1} and ${sign2}. Return only a JSON object with 'percentage' and 'reason'.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    percentage: { type: Type.NUMBER },
                    reason: { type: Type.STRING }
                },
                required: ['percentage', 'reason']
            }
        }
    });
    
    // Extract generated text as a property.
    const text = response.text;
    if (!text) throw new Error("No response text");
    return JSON.parse(text.trim());
}
