import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockCreate, OpenAICtor } = vi.hoisted(() => {
  const mockCreate = vi.fn();
  const OpenAICtor = vi.fn(function (this: any, opts?: { apiKey: string; baseURL?: string }) {
    (this as any)._opts = opts;
    this.chat = { completions: { create: mockCreate } };
  });
  return { mockCreate, OpenAICtor };
});

vi.mock('openai', () => ({ default: OpenAICtor }));

import { OpenAiProvider } from './openai.provider';

const sample = {
  filePath: 'a.ts',
  lineNumber: 1,
  agentType: 'PERFORMANCE',
  issue: 'N+1',
  suggestion: 'Batch the query',
  priority: 'MEDIUM',
};

function chatResponse(content: string) {
  return { choices: [{ message: { content } }] };
}

describe('OpenAiProvider', () => {
  let provider: OpenAiProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new OpenAiProvider('sk-openai-test');
  });

  describe('constructor', () => {
    it('initializes OpenAI client with the given API key', () => {
      new OpenAiProvider('sk-xyz');
      expect(OpenAICtor).toHaveBeenLastCalledWith({ apiKey: 'sk-xyz' });
    });

    it('does NOT pass a baseURL (that is grok provider behavior)', () => {
      new OpenAiProvider('sk-xyz');
      const opts = OpenAICtor.mock.calls.at(-1)?.[0] as any;
      expect(opts.baseURL).toBeUndefined();
    });
  });

  describe('analyzeCode() — happy path', () => {
    it('parses a JSON-array response', async () => {
      mockCreate.mockResolvedValueOnce(chatResponse(JSON.stringify([sample])));
      await expect(provider.analyzeCode('diff')).resolves.toEqual([sample]);
    });

    it('unwraps a single-key object wrapper like { "issues": [...] }', async () => {
      mockCreate.mockResolvedValueOnce(
        chatResponse(JSON.stringify({ issues: [sample] })),
      );
      await expect(provider.analyzeCode('diff')).resolves.toEqual([sample]);
    });

    it('returns [] when the wrapper value is not an array', async () => {
      mockCreate.mockResolvedValueOnce(chatResponse(JSON.stringify({ note: 'clean' })));
      await expect(provider.analyzeCode('diff')).resolves.toEqual([]);
    });

    it('returns [] when content is empty (fallback "{}")', async () => {
      mockCreate.mockResolvedValueOnce({ choices: [{ message: { content: null } }] });
      await expect(provider.analyzeCode('diff')).resolves.toEqual([]);
    });

    it('uses model gpt-4o and forces json_object response_format', async () => {
      mockCreate.mockResolvedValueOnce(chatResponse('[]'));
      await provider.analyzeCode('diff');

      const call = mockCreate.mock.calls[0][0];
      expect(call.model).toBe('gpt-4o');
      expect(call.response_format).toEqual({ type: 'json_object' });
    });

    it('passes both the system prompt and user diff', async () => {
      mockCreate.mockResolvedValueOnce(chatResponse('[]'));
      await provider.analyzeCode('MY_DIFF_PAYLOAD', ['Rule A']);

      const call = mockCreate.mock.calls[0][0];
      expect(call.messages[0].role).toBe('system');
      expect(call.messages[0].content).toContain('Rule A');
      expect(call.messages[1].role).toBe('user');
      expect(call.messages[1].content).toContain('MY_DIFF_PAYLOAD');
    });
  });

  describe('analyzeCode() — failure paths', () => {
    it('throws when content is invalid JSON', async () => {
      mockCreate.mockResolvedValueOnce(chatResponse('not json {{{'));
      await expect(provider.analyzeCode('diff')).rejects.toThrow(/OpenAI Request Failed/);
    });

    it('throws when the SDK rejects', async () => {
      mockCreate.mockRejectedValueOnce(new Error('429 rate limited'));
      await expect(provider.analyzeCode('diff')).rejects.toThrow(/OpenAI Request Failed/);
    });

    it('throws when response has no choices array', async () => {
      mockCreate.mockResolvedValueOnce({ choices: [] });
      await expect(provider.analyzeCode('diff')).rejects.toThrow(/OpenAI Request Failed/);
    });
  });
});
