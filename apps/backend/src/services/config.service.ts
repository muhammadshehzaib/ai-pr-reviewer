import YAML from 'yaml';
import { GitHubService } from './github.service';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface AiPrConfig {
  version: number;
  ignore: string[];
  min_severity: SeverityLevel;
  guidelines: string[];
  language: string;
  summarize: boolean;
}

export const DEFAULT_AIPR_CONFIG: AiPrConfig = {
  version: 1,
  ignore: [
    'dist/**',
    'build/**',
    'node_modules/**',
    '**/*.min.js',
    '**/*.min.css',
    '**/*.map',
    '**/*.lock',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    '**/*.svg',
    '**/*.png',
    '**/*.jpg',
    '**/*.jpeg',
  ],
  min_severity: 'low',
  guidelines: [],
  language: 'en',
  summarize: true,
};

const CONFIG_CANDIDATE_PATHS = [
  '.aipr.yml',
  '.aipr.yaml',
  '.github/.aipr.yml',
  '.github/.aipr.yaml',
];

export class ConfigService {
  /**
   * Parses a raw YAML string into a sanitized AiPrConfig object.
   */
  public static parseConfigYaml(yamlString: string): AiPrConfig {
    try {
      const parsed = YAML.parse(yamlString);
      if (!parsed || typeof parsed !== 'object') {
        return { ...DEFAULT_AIPR_CONFIG };
      }

      const ignore = Array.isArray(parsed.ignore)
        ? parsed.ignore.filter((item: any) => typeof item === 'string')
        : DEFAULT_AIPR_CONFIG.ignore;

      const validSeverities: SeverityLevel[] = ['low', 'medium', 'high', 'critical'];
      const rawSeverity = typeof parsed.min_severity === 'string' ? parsed.min_severity.toLowerCase() : '';
      const min_severity: SeverityLevel = validSeverities.includes(rawSeverity as SeverityLevel)
        ? (rawSeverity as SeverityLevel)
        : DEFAULT_AIPR_CONFIG.min_severity;

      const guidelines = Array.isArray(parsed.guidelines)
        ? parsed.guidelines.filter((item: any) => typeof item === 'string')
        : DEFAULT_AIPR_CONFIG.guidelines;

      const language = typeof parsed.language === 'string' ? parsed.language : DEFAULT_AIPR_CONFIG.language;
      const summarize = typeof parsed.summarize === 'boolean' ? parsed.summarize : DEFAULT_AIPR_CONFIG.summarize;
      const version = typeof parsed.version === 'number' ? parsed.version : DEFAULT_AIPR_CONFIG.version;

      return {
        version,
        ignore,
        min_severity,
        guidelines,
        language,
        summarize,
      };
    } catch (err) {
      console.warn('⚠️ Failed to parse .aipr.yml YAML content, falling back to default config:', (err as Error).message);
      return { ...DEFAULT_AIPR_CONFIG };
    }
  }

  /**
   * Fetches .aipr.yml (or candidate locations) from the target repository at a given ref.
   * If none exist, returns the default configuration.
   */
  public static async fetchRepoConfig(
    ghService: GitHubService,
    owner: string,
    repo: string,
    ref?: string
  ): Promise<AiPrConfig> {
    for (const configPath of CONFIG_CANDIDATE_PATHS) {
      try {
        const rawContent = await ghService.getFileContent(owner, repo, configPath, ref);
        if (rawContent) {
          console.log(`📄 Loaded repository config from: ${configPath} (${owner}/${repo})`);
          return this.parseConfigYaml(rawContent);
        }
      } catch {
        // Try next candidate
      }
    }

    // Default configuration if no config file is found
    return { ...DEFAULT_AIPR_CONFIG };
  }
}
