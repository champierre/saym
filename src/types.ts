export interface Config {
  defaultVoice?: string;
  defaultLanguage?: string;
  outputFormat?: 'mp3' | 'wav' | 'ogg';
  ttsProvider?: 'elevenlabs' | 'cartesia' | 'xtts' | 'coefont';
  providers?: {
    elevenlabs?: {
      apiKey?: string;
      defaultVoice?: string;
    };
    cartesia?: {
      apiKey?: string;
      defaultVoice?: string;
    };
    xtts?: {
      apiKey?: string;
      serverUrl?: string;
      defaultVoice?: string;
    };
    coefont?: {
      accessKey?: string;
      accessSecret?: string;
      defaultVoice?: string;
    };
  };
}