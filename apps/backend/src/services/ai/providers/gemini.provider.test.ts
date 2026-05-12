import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGenerateContent, mockGetGenerativeModel, GoogleCtor } = vi.hoisted(() => {
  const mockGenerateContent = vi.fn();
  const mockGetGenerativeModel = vi.fn(() => ({ generateContent: mockGenerateContent }));
  const GoogleCtor = vi.fn(function (this: any) {
    this.getGenerativeModel = mockGetGenerativeModel;
  });
  return { mockGenerateContent, mockGetGenerativeModel, GoogleCtor };
});

vi.mock('@google/generative-ai', () => ({ GoogleGenerativeAI: GoogleCtor }));

import { GeminiProvider } from './gemini.provider';

const sample = {
  filePath: 'a.ts',
  lineNumber: 5,
  agentType: 'ARCHITECTURE',
  issue: 'Tight coupling',
  suggestion: 'Inject the dependency',
  priority: 'LOW',
};

function geminiResponse(text: string) {
  return { response: { text: () => text } };
}

describe('GeminiProvider', () => {
  let provider: GeminiProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new GeminiProvider('AIza-test');
  });

  describe('constructor', () => {
    it('initializes GoogleGenerativeAI with the API key', () => {
      new GeminiProvider('AIza-xyz');
      expect(GoogleCtor).toHaveBeenLastCalledWith('AIza-xyz');
    });
  });

  describe('analyzeCode() — happy path', () => {
    it('parses a clean JSON-array response', async () => {
      mockGenerateContent.mockResolvedValueOnce(geminiResponse(JSON.stringify([sample])));
      await expect(provider.analyzeCode('diff')).resolves.toEqual([sample]);
    });

    it('configures model with gemini-1.5-pro and JSON mime type', async () => {
      mockGenerateContent.mockResolvedValueOnce(geminiResponse('[]'));
      await provider.analyzeCode('diff');

      expect(mockGetGenerativeModel).toHaveBeenCalledWith({
        model: 'gemini-1.5-pro',
        generationConfig: { responseMimeType: 'application/json' },
      });
    });

    it('includes the diff and system prompt in the user prompt', async () => {
      mockGenerateContent.mockResolvedValueOnce(geminiResponse('[]'));
      await provider.analyzeCode('UNIQUE_DIFF_BODY', ['Rule X']);

      const promptArg = mockGenerateContent.mock.calls[0][0] as string;
      expect(promptArg).toContain('UNIQUE_DIFF_BODY');
      expect(promptArg).toContain('Rule X');
      expect(promptArg).toMatch(/world-class/i);
    });

    it('returns the parsed value when model returns an empty array', async () => {
      mockGenerateContent.mockResolvedValueOnce(geminiResponse('[]'));
      await expect(provider.analyzeCode('diff')).resolves.toEqual([]);
    });
  });

  describe('analyzeCode() — failure paths', () => {
    it('throws when the model returns invalid JSON', async () => {
      mockGenerateContent.mockResolvedValueOnce(geminiResponse('not json'));
      await expect(provider.analyzeCode('diff')).rejects.toThrow(/Gemini API request failed/);
    });

    it('throws when generateContent rejects (e.g., quota exceeded)', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('RESOURCE_EXHAUSTED'));
      await expect(provider.analyzeCode('diff')).rejects.toThrow(/Gemini API request failed/);
    });

    it('unwraps a single-key object wrapper like { "suggestions": [...] }', async () => {
      mockGenerateContent.mockResolvedValueOnce(
        geminiResponse(JSON.stringify({ suggestions: [sample] })),
      );
      await expect(provider.analyzeCode('diff')).resolves.toEqual([sample]);
    });

    it('returns [] when the wrapper value is not an array', async () => {
      mockGenerateContent.mockResolvedValueOnce(
        geminiResponse(JSON.stringify({ note: 'no issues' })),
      );
      await expect(provider.analyzeCode('diff')).resolves.toEqual([]);
    });
  });
});
