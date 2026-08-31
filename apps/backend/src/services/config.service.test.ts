import { describe, it, expect, vi } from 'vitest';
import { ConfigService, DEFAULT_AIPR_CONFIG } from './config.service';

describe('ConfigService', () => {
  it('parses valid .aipr.yml string into AiPrConfig object', () => {
    const yamlString = `
version: 1
ignore:
  - "dist/**"
  - "build/**"
  - "**/*.test.ts"
min_severity: "high"
guidelines:
  - "Do not use any"
  - "Ensure 100% type safety"
language: "en"
summarize: true
`;

    const config = ConfigService.parseConfigYaml(yamlString);
    expect(config.version).toBe(1);
    expect(config.ignore).toEqual(['dist/**', 'build/**', '**/*.test.ts']);
    expect(config.min_severity).toBe('high');
    expect(config.guidelines).toHaveLength(2);
    expect(config.guidelines[0]).toBe('Do not use any');
    expect(config.summarize).toBe(true);
  });

  it('handles invalid or empty YAML gracefully by returning default config', () => {
    const config = ConfigService.parseConfigYaml('');
    expect(config).toEqual(DEFAULT_AIPR_CONFIG);
  });

  it('sanitizes invalid min_severity to default', () => {
    const yamlString = `
min_severity: "invalid_level"
`;
    const config = ConfigService.parseConfigYaml(yamlString);
    expect(config.min_severity).toBe('low');
  });

  it('fetches repo config from GitHubService if present', async () => {
    const mockGhService: any = {
      getFileContent: vi.fn().mockImplementation(async (_owner, _repo, path) => {
        if (path === '.aipr.yml') {
          return 'min_severity: "critical"\nignore:\n  - "tests/**"';
        }
        return null;
      }),
    };

    const config = await ConfigService.fetchRepoConfig(mockGhService, 'owner', 'repo', 'main');
    expect(config.min_severity).toBe('critical');
    expect(config.ignore).toEqual(['tests/**']);
  });
});
