import { TTSProvider, TTSProviderConfig } from './tts-provider';
import { ElevenLabsProvider } from './elevenlabs-provider';
import { CartesiaProvider } from './cartesia-provider';
import { XTTSProvider } from './xtts-provider';
import { CoeFontProvider } from './coefont-provider';

export type ProviderType = 'elevenlabs' | 'cartesia' | 'xtts' | 'coefont';

export class ProviderFactory {
  private static providers: Map<string, TTSProvider> = new Map();

  static async createProvider(type: ProviderType, config: TTSProviderConfig): Promise<TTSProvider> {
    // Check if provider already exists and initialized
    const existingProvider = this.providers.get(type);
    if (existingProvider) {
      return existingProvider;
    }

    let provider: TTSProvider;

    switch (type) {
      case 'elevenlabs':
        provider = new ElevenLabsProvider();
        break;
      case 'cartesia':
        provider = new CartesiaProvider();
        break;
      case 'xtts':
        provider = new XTTSProvider();
        break;
      case 'coefont':
        provider = new CoeFontProvider();
        break;
      default:
        throw new Error(`Unknown provider type: ${type}`);
    }

    await provider.initialize(config);
    this.providers.set(type, provider);
    
    return provider;
  }

  static getProvider(type: ProviderType): TTSProvider | null {
    return this.providers.get(type) || null;
  }

  static clearProviders(): void {
    this.providers.clear();
  }

  static getSupportedProviders(): ProviderType[] {
    return ['elevenlabs', 'cartesia', 'xtts', 'coefont'];
  }
}