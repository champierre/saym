export interface Config {
  defaultVoice?: string;
  defaultLanguage?: string;
  outputFormat?: 'mp3' | 'wav' | 'ogg';
  cache?: {
    enabled: boolean;
    maxSize: string;
    ttl: number;
  };
  ttsProvider?: 'elevenlabs' | 'cartesia';
  providers?: {
    elevenlabs?: {
      apiKey?: string;
      defaultVoice?: string;
    };
    cartesia?: {
      apiKey?: string;
      defaultVoice?: string;
    };
  };
}