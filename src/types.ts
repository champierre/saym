export interface Config {
  defaultVoice?: string;
  defaultLanguage?: string;
  outputFormat?: 'mp3' | 'wav' | 'ogg';
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