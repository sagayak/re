
import { GoogleGenAI, Type } from "@google/genai";
import { Property, LeadCriteria, RecommendationResponse, StoredDocument } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

export async function getPropertyRecommendations(
  inventory: Property[] | string,
  lead: LeadCriteria
): Promise<RecommendationResponse | null> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Format inventory context based on whether it's structured data or raw text
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
      contents: prompt,
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
    if (!resultText) return null;
    
    return JSON.parse(resultText) as RecommendationResponse;
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return null;
  }
}

export async function askQuestionAboutResources(
  articles: StoredDocument[],
  question: string
): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "API Key not found. Please check your environment.";

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
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful real estate expert grounded in specific documentation.",
        temperature: 0.2,
      }
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error asking resources:", error);
    return "There was an error processing your request. Please try again later.";
  }
}
