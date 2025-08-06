import axios, { AxiosInstance } from 'axios';
import { Readable } from 'stream';
import { 
  TTSProvider, 
  TTSProviderConfig, 
  TTSOptions, 
  TTSVoice, 
  TTSProviderError 
} from './tts-provider';

export class ElevenLabsProvider implements TTSProvider {
  readonly name = 'elevenlabs';
  private client!: AxiosInstance;
  private apiKey!: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  async initialize(config: TTSProviderConfig): Promise<void> {
    if (!config.apiKey) {
      throw new TTSProviderError(this.name, 'API key is required');
    }

    this.apiKey = config.apiKey;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'xi-api-key': this.apiKey,
      },
    });
  }

  async textToSpeech(text: string, voiceId: string, options?: TTSOptions): Promise<Buffer> {
    try {
      const response = await this.client.post(
        `/text-to-speech/${voiceId}`,
        {
          text,
          model_id: options?.modelId || 'eleven_monolingual_v1',
          voice_settings: {
            stability: options?.voiceSettings?.stability ?? 0.5,
            similarity_boost: options?.voiceSettings?.similarity ?? 0.75,
            style: options?.voiceSettings?.style ?? 0.0,
            use_speaker_boost: options?.voiceSettings?.speakerBoost ?? true,
          },
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
          },
          params: {
            output_format: options?.outputFormat || 'mp3_44100_128',
          },
          responseType: 'arraybuffer',
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.detail?.message || error.message;
        throw new TTSProviderError(this.name, `Text-to-speech failed: ${errorMessage}`);
      }
      throw error;
    }
  }

  async textToSpeechStream(text: string, voiceId: string, options?: TTSOptions): Promise<Readable> {
    try {
      const response = await this.client.post(
        `/text-to-speech/${voiceId}/stream`,
        {
          text,
          model_id: options?.modelId || 'eleven_monolingual_v1',
          voice_settings: {
            stability: options?.voiceSettings?.stability ?? 0.5,
            similarity_boost: options?.voiceSettings?.similarity ?? 0.75,
            style: options?.voiceSettings?.style ?? 0.0,
            use_speaker_boost: options?.voiceSettings?.speakerBoost ?? true,
          },
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
          },
          params: {
            output_format: options?.outputFormat || 'mp3_44100_128',
          },
          responseType: 'stream',
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.detail?.message || error.message;
        throw new TTSProviderError(this.name, `Text-to-speech stream failed: ${errorMessage}`);
      }
      throw error;
    }
  }

  async listVoices(): Promise<TTSVoice[]> {
    try {
      const response = await this.client.get('/voices');
      return response.data.voices.map((voice: any) => ({
        id: voice.voice_id,
        name: voice.name,
        description: voice.description,
        provider: this.name,
        labels: voice.labels,
        previewUrl: voice.preview_url,
        languages: voice.available_for_tiers ? ['en'] : [], // ElevenLabs doesn't provide language info directly
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new TTSProviderError(this.name, `Failed to list voices: ${error.response?.data?.detail?.message || error.message}`);
      }
      throw error;
    }
  }

  async getVoice(voiceId: string): Promise<TTSVoice | null> {
    try {
      const response = await this.client.get(`/voices/${voiceId}`);
      const voice = response.data;
      return {
        id: voice.voice_id,
        name: voice.name,
        description: voice.description,
        provider: this.name,
        labels: voice.labels,
        previewUrl: voice.preview_url,
        languages: ['en'], // ElevenLabs doesn't provide language info directly
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw new TTSProviderError(this.name, `Failed to get voice: ${error}`);
    }
  }


  getSupportedFormats(): string[] {
    return ['mp3_44100_128', 'mp3_44100_64', 'mp3_44100_32', 'mp3_44100_16', 'pcm_16000', 'pcm_22050', 'pcm_24000', 'pcm_44100'];
  }

  async validateConnection(): Promise<boolean> {
    try {
      await this.client.get('/user/subscription');
      return true;
    } catch (error) {
      return false;
    }
  }
}