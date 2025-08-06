import fs from 'fs';
import path from 'path';
import os from 'os';
import { Config } from './types';

export class ConfigManager {
  private configPath: string;
  private config: Config;

  constructor(configPath?: string) {
    this.configPath = configPath || path.join(os.homedir(), '.saymrc');
    this.config = this.loadConfig();
  }

  /**
   * Load configuration from file
   */
  private loadConfig(): Config {
    const defaultConfig: Config = {
      defaultLanguage: 'en',
      outputFormat: 'mp3',
      voiceSettings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
      },
      cache: {
        enabled: true,
        maxSize: '100MB',
        ttl: 86400,
      },
      ttsProvider: 'elevenlabs',
      providers: {},
    };

    if (!fs.existsSync(this.configPath)) {
      return defaultConfig;
    }

    try {
      const configData = fs.readFileSync(this.configPath, 'utf-8');
      const userConfig = JSON.parse(configData);
      return { ...defaultConfig, ...userConfig };
    } catch (error) {
      console.error('Failed to load config file:', error);
      return defaultConfig;
    }
  }

  /**
   * Save configuration to file
   */
  saveConfig(): void {
    try {
      const configDir = path.dirname(this.configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Failed to save config file:', error);
    }
  }

  /**
   * Get configuration value
   */
  get<K extends keyof Config>(key: K): Config[K] {
    return this.config[key];
  }

  /**
   * Set configuration value
   */
  set<K extends keyof Config>(key: K, value: Config[K]): void {
    this.config[key] = value;
    this.saveConfig();
  }

  /**
   * Update configuration
   */
  update(updates: Partial<Config>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  /**
   * Get all configuration
   */
  getAll(): Config {
    return { ...this.config };
  }

  /**
   * Reset to default configuration
   */
  reset(): void {
    this.config = this.loadConfig();
    if (fs.existsSync(this.configPath)) {
      fs.unlinkSync(this.configPath);
    }
  }

  /**
   * Get API key from environment or config
   */
  getApiKey(provider?: 'elevenlabs' | 'cartesia'): string | undefined {
    const ttsProvider = provider || this.config.ttsProvider || 'elevenlabs';
    
    switch (ttsProvider) {
      case 'elevenlabs':
        return process.env.ELEVENLABS_API_KEY || this.config.providers?.elevenlabs?.apiKey;
      case 'cartesia':
        return process.env.CARTESIA_API_KEY || this.config.providers?.cartesia?.apiKey;
      default:
        return undefined;
    }
  }

  /**
   * Get default voice for a specific provider
   */
  getDefaultVoice(provider?: 'elevenlabs' | 'cartesia'): string | undefined {
    const ttsProvider = provider || this.config.ttsProvider || 'elevenlabs';
    
    // First check provider-specific default voice
    switch (ttsProvider) {
      case 'elevenlabs':
        if (this.config.providers?.elevenlabs?.defaultVoice) {
          return this.config.providers.elevenlabs.defaultVoice;
        }
        break;
      case 'cartesia':
        if (this.config.providers?.cartesia?.defaultVoice) {
          return this.config.providers.cartesia.defaultVoice;
        }
        break;
    }
    
    // Fallback to global default voice
    return this.config.defaultVoice;
  }

  /**
   * Set default voice for a specific provider
   */
  setProviderDefaultVoice(provider: 'elevenlabs' | 'cartesia', voiceId: string): void {
    if (!this.config.providers) {
      this.config.providers = {};
    }
    
    if (!this.config.providers[provider]) {
      this.config.providers[provider] = {};
    }
    
    this.config.providers[provider]!.defaultVoice = voiceId;
    this.saveConfig();
  }

}