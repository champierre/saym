import { Readable } from 'stream';

export interface TTSProviderConfig {
  apiKey: string;
  [key: string]: any;
}

export interface TTSVoiceSettings {
  // Common settings across providers
  stability?: number;
  similarity?: number;
  style?: number;
  speakerBoost?: boolean;
  // Provider-specific settings
  [key: string]: any;
}

export interface TTSOptions {
  voiceSettings?: TTSVoiceSettings;
  outputFormat?: string;
  modelId?: string;
}

export interface TTSVoice {
  id: string;
  name: string;
  description?: string;
  provider: string;
  labels?: Record<string, any>;
  previewUrl?: string;
  languages?: string[];
}

export interface TTSProvider {
  readonly name: string;
  
  /**
   * Initialize the provider with configuration
   */
  initialize(config: TTSProviderConfig): Promise<void>;
  
  /**
   * Convert text to speech and return audio buffer
   */
  textToSpeech(text: string, voiceId: string, options?: TTSOptions): Promise<Buffer>;
  
  /**
   * Stream text to speech for real-time playback
   */
  textToSpeechStream(text: string, voiceId: string, options?: TTSOptions): Promise<Readable>;
  
  /**
   * List available voices
   */
  listVoices(): Promise<TTSVoice[]>;
  
  /**
   * Get a specific voice by ID
   */
  getVoice(voiceId: string): Promise<TTSVoice | null>;
  
  
  /**
   * Get supported audio formats
   */
  getSupportedFormats(): string[];
  
  /**
   * Validate API key or connection
   */
  validateConnection(): Promise<boolean>;
}

export class TTSProviderError extends Error {
  constructor(public provider: string, message: string) {
    super(`[${provider}] ${message}`);
    this.name = 'TTSProviderError';
  }
}