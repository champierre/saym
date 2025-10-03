export interface Config {
  defaultVoice?: string;
  defaultLanguage?: string;
  outputFormat?: 'mp3' | 'wav' | 'ogg';
  ttsProvider?: 'elevenlabs' | 'cartesia' | 'xtts' | 'resemble' | 'hume';
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
    resemble?: {
      apiKey?: string;
      defaultVoice?: string;
    };
    hume?: {
      apiKey?: string;
      defaultVoice?: string;
    };
  };
}