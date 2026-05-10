import { AiProvider } from '@prisma/client';
import { BaseAiProvider } from './providers/base.provider';
import { GeminiProvider } from './providers/gemini.provider'; // We will code this next
import { OpenAiProvider } from './providers/openai.provider'; // We will code this skeleton next

export class AiProviderFactory {
  static getProvider(providerType: AiProvider, apiKey: string): BaseAiProvider {
    switch (providerType) {
      case AiProvider.GEMINI:
        return new GeminiProvider(apiKey);
      
      case AiProvider.OPENAI:
        return new OpenAiProvider(apiKey);

      // We can effortlessly scale this to Claude and Grok simply by writing their provider file
      case AiProvider.CLAUDE:
      case AiProvider.GROK:
        throw new Error(`Provider ${providerType} logic pipeline is currently being integrated.`);

      default:
        throw new Error(`Unknown or unsupported AI Provider: ${providerType}`);
    }
  }
}
