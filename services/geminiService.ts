
import { GoogleGenAI, Type } from "@google/genai";

// Safe initialization of AI client
const getAI = () => {
  const apiKey = process.env.API_KEY || "";
  return new GoogleGenAI({ apiKey });
};

export const getPsychiatristResponse = async (message: string) => {
  const ai = getAI();
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
  const ai = getAI();
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
  const ai = getAI();
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
  const ai = getAI();
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
  const ai = getAI();
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
  const ai = getAI();
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
    const ai = getAI();
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
    
    const text = response.text;
    if (!text) throw new Error("No response text");
    return JSON.parse(text.trim());
}
