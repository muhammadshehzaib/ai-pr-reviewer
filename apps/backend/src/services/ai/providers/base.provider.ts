export interface AiSuggestion {
  filePath: string;
  lineNumber: number;
  agentType: 'SECURITY' | 'PERFORMANCE' | 'ARCHITECTURE';
  issue: string;
  suggestion: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export abstract class BaseAiProvider {
  protected apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Core function implemented uniquely by each service (OpenAI, Gemini, etc)
   * but returning the exactly identical standard format.
   */
  abstract analyzeCode(diff: string, customRules?: string[]): Promise<AiSuggestion[]>;

  protected getSystemPrompt(customRules: string[] = []): string {
    const basePrompt = `
      You are a strict, world-class software security and code quality auditor.
      Examine the following code diff and return structural improvements.
      Focus heavily on performance, memory optimization, clean architecture, and critical security bugs.

      OUTPUT FORMAT RULES:
      You MUST output STRICT, RAW JSON only. Do not output markdown formatting (like \`\`\`json).
      The response must be an array of objects.
      Format per object:
      {
        "filePath": "string",
        "lineNumber": number,
        "agentType": "SECURITY" | "PERFORMANCE" | "ARCHITECTURE",
        "issue": "Concise description",
        "suggestion": "Clear solution snippet",
        "priority": "HIGH" | "MEDIUM" | "LOW"
      }
    `;

    const rulesInjection = customRules.length > 0 
      ? `\nADDITIONAL USER RULES TO ENFORCE:\n${customRules.join('\n')}` 
      : '';

    return basePrompt + rulesInjection;
  }
}
