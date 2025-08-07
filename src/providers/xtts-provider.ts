import axios, { AxiosInstance } from 'axios';
import { Readable } from 'stream';
import FormData from 'form-data';
import { 
  TTSProvider, 
  TTSProviderConfig, 
  TTSOptions, 
  TTSVoice, 
  TTSProviderError 
} from './tts-provider';

interface XTTSProviderConfig extends TTSProviderConfig {
  apiKey: string;
  serverUrl?: string;
}

export class XTTSProvider implements TTSProvider {
  readonly name = 'xtts';
  private client!: AxiosInstance;
  private serverUrl!: string;
  private apiKey!: string;

  async initialize(config: XTTSProviderConfig): Promise<void> {
    if (!config.apiKey && config.apiKey !== 'none') {
      throw new TTSProviderError(this.name, 'API key is required (use "none" for no authentication)');
    }

    this.apiKey = config.apiKey;
    this.serverUrl = config.serverUrl || 'http://localhost:8020';
    
    this.client = axios.create({
      baseURL: this.serverUrl,
      headers: this.apiKey !== 'none' ? {
        'Authorization': `Bearer ${this.apiKey}`,
      } : {},
    });
  }

  async textToSpeech(text: string, voiceId: string, options?: TTSOptions): Promise<Buffer> {
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('speaker_wav', voiceId);
      
      if (options?.language) {
        formData.append('language', options.language);
      } else {
        formData.append('language', 'en');
      }

      const response = await this.client.post(
        '/tts_to_audio',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          responseType: 'arraybuffer',
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.detail || error.message;
        throw new TTSProviderError(this.name, `Text-to-speech failed: ${errorMessage}`);
      }
      throw error;
    }
  }

  async textToSpeechStream(text: string, voiceId: string, options?: TTSOptions): Promise<Readable> {
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('speaker_wav', voiceId);
      
      if (options?.language) {
        formData.append('language', options.language);
      } else {
        formData.append('language', 'en');
      }
      
      formData.append('stream_chunk_size', '20');

      const response = await this.client.post(
        '/tts_stream',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          responseType: 'stream',
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.detail || error.message;
        throw new TTSProviderError(this.name, `Text-to-speech stream failed: ${errorMessage}`);
      }
      throw error;
    }
  }

  async listVoices(): Promise<TTSVoice[]> {
    try {
      const response = await this.client.get('/speakers');
      
      if (Array.isArray(response.data)) {
        return response.data.map((speaker: string) => ({
          id: speaker,
          name: speaker,
          description: `XTTS v2 voice: ${speaker}`,
          provider: this.name,
          labels: {},
          languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'tr', 'ru', 'nl', 'cs', 'ar', 'zh-cn', 'ja', 'hu', 'ko', 'hi'],
        }));
      }
      
      return [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new TTSProviderError(this.name, `XTTS server not running at ${this.serverUrl}`);
        }
        throw new TTSProviderError(this.name, `Failed to list voices: ${error.message}`);
      }
      throw error;
    }
  }

  async getVoice(voiceId: string): Promise<TTSVoice | null> {
    try {
      const voices = await this.listVoices();
      return voices.find(v => v.id === voiceId) || null;
    } catch (error) {
      throw new TTSProviderError(this.name, `Failed to get voice: ${error}`);
    }
  }

  getSupportedFormats(): string[] {
    return ['wav'];
  }

  async validateConnection(): Promise<boolean> {
    try {
      await this.client.get('/docs');
      return true;
    } catch (error) {
      return false;
    }
  }
}