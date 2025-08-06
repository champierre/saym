export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface Voice {
  voice_id: string;
  name: string;
  samples?: VoiceSample[];
  category?: string;
  fine_tuning?: {
    is_allowed_to_fine_tune: boolean;
    finetuning_state: string;
  };
  labels?: Record<string, string>;
  description?: string;
  preview_url?: string;
  available_for_tiers?: string[];
  settings?: VoiceSettings;
}

export interface VoiceSample {
  sample_id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  hash: string;
}

export interface TextToSpeechRequest {
  text: string;
  model_id?: string;
  voice_settings?: VoiceSettings;
}


export interface ElevenLabsError {
  detail: {
    status: string;
    message: string;
  };
}

export interface Config {
  defaultVoice?: string;
  defaultLanguage?: string;
  outputFormat?: 'mp3' | 'wav' | 'ogg';
  voiceSettings?: VoiceSettings;
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

export class VoiceEngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VoiceEngineError';
  }
}

export class VoiceManagerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VoiceManagerError';
  }
}