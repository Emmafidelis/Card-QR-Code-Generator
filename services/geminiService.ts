
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
            4. 'date': Full date like '22 NOVEMBA 2025'.
            5. 'time': Specific time like 'Saa 10:00 Jioni'.
            6. 'venue': The hall or location name.
            7. 'dressCode': Look for 'Dress Code' or 'Vazi' info.
            8. 'contact': Phone numbers for RSVP.
            9. 'locationUrl': Any URL mentioned.
            
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
            date: { type: Type.STRING },
            time: { type: Type.STRING },
            venue: { type: Type.STRING },
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
}
