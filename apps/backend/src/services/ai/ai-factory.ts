import { AiProvider } from '@prisma/client';
import { BaseAiProvider } from './providers/base.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAiProvider } from './providers/openai.provider';
import { ClaudeProvider } from './providers/claude.provider';
import { GrokProvider } from './providers/grok.provider';

export class AiProviderFactory {
  static getProvider(providerType: AiProvider, apiKey: string): BaseAiProvider {
    switch (providerType) {
      case AiProvider.GEMINI:
        return new GeminiProvider(apiKey);
      case AiProvider.OPENAI:
        return new OpenAiProvider(apiKey);
      case AiProvider.CLAUDE:
        return new ClaudeProvider(apiKey);
      case AiProvider.GROK:
        return new GrokProvider(apiKey);
      default:
        throw new Error(`Unknown or unsupported AI Provider: ${providerType}`);
    }
  }
}
