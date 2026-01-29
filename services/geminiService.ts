
import { GoogleGenAI, Type } from "@google/genai";
import { Project, DirectorInsight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateDirectorInsights = async (project: Project): Promise<DirectorInsight> => {
  const updatesText = project.updates
    .map(u => `[${u.timestamp}] Status: ${u.status}. Manager: ${u.managerName}. Update: ${u.content}`)
    .join('\n');

  const prompt = `
    Analyze the following project updates for the project "${project.name}" (Description: ${project.description}).
    Provide a strategic summary, key risks, and recommendations for a Director-level audience.
    
    Updates:
    ${updatesText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Executive summary of current project health" },
            risks: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of critical risks identified"
            },
            recommendations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Strategic next steps"
            }
          },
          required: ["summary", "risks", "recommendations"]
        }
      }
    });

    return JSON.parse(response.text || '{}') as DirectorInsight;
  } catch (error) {
    console.error("Gemini Insight Generation Failed", error);
    return {
      summary: "Unable to generate insights at this time.",
      risks: ["System connectivity issues"],
      recommendations: ["Manually review recent updates"]
    };
  }
};
