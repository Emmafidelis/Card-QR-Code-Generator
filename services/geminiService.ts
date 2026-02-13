import { EventDetails } from '../types';

<<<<<<< Updated upstream
export async function analyzeCardImage(_base64Image: string): Promise<Partial<EventDetails> | null> {
  return null;
=======
import { GoogleGenAI, Type } from "@google/genai";
import { EventDetails } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeCardImage(base64Image: string): Promise<Partial<EventDetails> | null> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image.split(',')[1],
            },
          },
          {
            text: `Extract event details from this Tanzanian invitation card (Ecard).
            Look specifically for:
            1. 'eventTitle': The card type like 'Kadi ya Harusi', 'Mwaliko wa Birthday'.
            2. 'hostNames': The family/host header text (e.g. 'Familia ya... inayo furaha kukualika').
            3. 'names': The main names of the bride/groom or celebrant.
            4. 'ceremonyText': Full ceremony/reception sentence as one paragraph starting from text like 'Misa takatifu ya ndoa...' including date, time, venue and ending sentence.
            5. 'dressCode': Look for 'Dress Code' or 'Vazi' info.
            6. 'contact': Phone numbers for RSVP.
            7. 'locationUrl': Any URL mentioned.
            
            Return strictly as JSON.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            names: { type: Type.STRING },
            ceremonyText: { type: Type.STRING },
            dressCode: { type: Type.STRING },
            locationUrl: { type: Type.STRING },
            contact: { type: Type.STRING },
            eventTitle: { type: Type.STRING },
            hostNames: { type: Type.STRING },
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Error analyzing card:", error);
    return null;
  }
>>>>>>> Stashed changes
}
