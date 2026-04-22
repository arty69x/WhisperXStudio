import { GoogleGenAI } from "@google/genai";

export const generateAIResponse = async (prompt: string, apiKey: string, systemInstruction?: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure it in Settings.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey, vertexai: true });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      },
      config: {
        systemInstruction: systemInstruction || "You are WhisperX Studio Omega, an advanced AI assistant embedded in a futuristic operating system. Be concise, technical, and helpful.",
        temperature: 0.7,
      }
    });
    
    return response.text || "No response generated.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to communicate with AI core.");
  }
};

export const analyzeFileContent = async (content: string, apiKey: string) => {
  const prompt = `Analyze the following file content and extract its core logic. Return ONLY a valid JSON object with this structure: {"corePurpose": "string", "abilities": ["string"], "risks": ["string"]}\n\nContent:\n${content.substring(0, 5000)}`;
  const res = await generateAIResponse(prompt, apiKey, "You are a code analysis engine. Return ONLY valid JSON.");
  try {
    const cleaned = res.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Failed to parse AI analysis.");
  }
};

export const evolveLogic = async (blueprint: string, matrix: string, ability: string, apiKey: string) => {
  const prompt = `Fuse these two logic structures using the specified ability.\nBlueprint: ${blueprint}\nMatrix: ${matrix}\nAbility: ${ability}\nReturn ONLY a valid JSON object: {"result": "string describing the new system", "score": number between 0-100}`;
  const res = await generateAIResponse(prompt, apiKey, "You are an evolution engine. Return ONLY valid JSON.");
  try {
    const cleaned = res.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Failed to parse evolution result.");
  }
};
