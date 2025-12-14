import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFraudRisks = async (transactions: Transaction[]) => {
  if (!process.env.API_KEY) {
    console.warn("API Key missing for Gemini");
    return { 
      analysis: "API Key is missing. Please configure the environment to use AI features.",
      flaggedIds: [] 
    };
  }

  // Filter for unmatched or suspicious looking transactions to save tokens
  const sampleData = transactions.slice(0, 30).map(t => ({
    id: t.id,
    date: t.date,
    amount: t.amount,
    desc: t.description,
    source: t.source
  }));

  const prompt = `
    You are an expert Cash Audit AI. Analyze the following list of cash transactions.
    Look for anomalies such as:
    1. Split transactions (structuring) just below authorization limits.
    2. Round numbers where precise amounts are expected.
    3. Duplicate payments.
    4. Weekend or holiday transactions.
    
    Return a JSON object with:
    - 'summary': A brief executive summary of findings (max 2 sentences).
    - 'flaggedIds': An array of transaction IDs that seem suspicious.
    - 'findings': An array of objects, each containing 'id' and 'reason' for the flagged transaction.

    Data: ${JSON.stringify(sampleData)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            flaggedIds: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            findings: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        reason: { type: Type.STRING }
                    }
                }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return { summary: "Error running analysis.", flaggedIds: [], findings: [] };
  }
};

export const generateAuditSummary = async (stats: any) => {
    if (!process.env.API_KEY) return "AI unavailable.";
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a professional 'Partner Summary Report' paragraph for a Cash Audit based on these stats: ${JSON.stringify(stats)}. Tone: Formal, Auditor. Focus on assertions: Existence and Accuracy.`,
        });
        return response.text;
    } catch (e) {
        return "Could not generate summary.";
    }
}