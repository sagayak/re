
import { GoogleGenAI, Type } from "@google/genai";
import { Property, LeadCriteria, RecommendationResponse, StoredDocument } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

export async function getPropertyRecommendations(
  inventory: Property[] | string,
  lead: LeadCriteria
): Promise<RecommendationResponse | null> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please check your environment settings.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const inventoryContext = typeof inventory === 'string' 
    ? inventory 
    : JSON.stringify(inventory, null, 2);

  const prompt = `
    Analyze the following Lead Criteria against the provided Property Inventory.
    
    Lead Criteria:
    - Budget: $${lead.budgetMin} to $${lead.budgetMax}
    - Location Preference: ${lead.location}
    - Min Beds/Baths: ${lead.minBedrooms}/${lead.minBathrooms}
    - Preferred Type: ${lead.preferredType}
    - Lifestyle: ${lead.lifestyle}
    - Essential Features: ${lead.essentialFeatures.join(', ')}

    Property Inventory (Source Content):
    ${inventoryContext}

    Instructions:
    1. If the inventory is a raw document, extract property details first.
    2. Recommend the top 3 best matching properties found in the source.
    3. If no properties are found in the text that even remotely match, explain why in the summary.
    
    Output your analysis and recommendations in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  propertyId: { type: Type.STRING, description: "Name or ID of the property" },
                  matchScore: { type: Type.NUMBER, description: "Match percentage 0-100" },
                  whyItMatches: { type: Type.STRING },
                  keySellingPoints: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING } 
                  },
                  suggestedPitch: { type: Type.STRING }
                },
                required: ["propertyId", "matchScore", "whyItMatches", "keySellingPoints", "suggestedPitch"]
              }
            },
            summary: { type: Type.STRING, description: "Executive summary of the matching process" }
          },
          required: ["recommendations", "summary"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Model returned an empty response.");
    
    return JSON.parse(resultText) as RecommendationResponse;
  } catch (error: any) {
    console.error("Error fetching recommendations:", error);
    throw new Error(error.message || "Failed to generate property recommendations.");
  }
}

export async function askQuestionAboutResources(
  articles: StoredDocument[],
  question: string
): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please ensure your API Key is configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const context = articles.map(doc => `--- DOCUMENT: ${doc.name} ---\n${doc.content}`).join('\n\n');

  const prompt = `
    You are a professional real estate advisor. Below is a knowledge base of articles and guides.
    Answer the user's question based ONLY on the information provided in the documents. 
    If the answer is not in the documents, state that you don't have enough information from the provided resources.
    Be concise, helpful, and professional. Mention which documents you are citing.

    KNOWLEDGE BASE:
    ${context}

    USER QUESTION:
    ${question}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are a helpful real estate expert grounded in specific documentation.",
        temperature: 0.2,
      }
    });

    const text = response.text;
    if (!text) throw new Error("Agent was unable to generate an answer from the provided articles.");
    return text;
  } catch (error: any) {
    console.error("Error asking resources:", error);
    throw new Error(error.message || "The AI Agent encountered an error while reading the library.");
  }
}
