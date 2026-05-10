import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseAiProvider, AiSuggestion } from './base.provider';

export class GeminiProvider extends BaseAiProvider {
  private aiClient: GoogleGenerativeAI;

  constructor(apiKey: string) {
    super(apiKey);
    this.aiClient = new GoogleGenerativeAI(apiKey);
  }

  async analyzeCode(diff: string, customRules: string[] = []): Promise<AiSuggestion[]> {
    try {
      // 1. Initialize modern ultra-performant model
      const model = this.aiClient.getGenerativeModel({ 
        model: 'gemini-1.5-pro',
        generationConfig: {
           responseMimeType: "application/json" // Forces structural output!
        }
      });

      const systemPrompt = this.getSystemPrompt(customRules);
      
      const prompt = `
        ${systemPrompt}
        
        Here is the GIT DIFF to review:
        
        ${diff}
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Safely parse the forced JSON output
      const suggestions: AiSuggestion[] = JSON.parse(responseText);
      return suggestions;
      
    } catch (error) {
      console.error('🔴 Gemini Provider Error:', error);
      throw new Error(`Gemini API request failed: ${(error as Error).message}`);
    }
  }
}
