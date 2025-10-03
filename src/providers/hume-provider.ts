import axios, { AxiosInstance } from 'axios';
import { Readable } from 'stream';
import {
  TTSProvider,
  TTSProviderConfig,
  TTSOptions,
  TTSVoice,
  TTSProviderError
} from './tts-provider';

export class HumeProvider implements TTSProvider {
  readonly name = 'hume';
  private client!: AxiosInstance;
  private apiKey!: string;
  private baseUrl = 'https://api.hume.ai/v0';

  async initialize(config: TTSProviderConfig): Promise<void> {
    if (!config.apiKey) {
      throw new TTSProviderError(this.name, 'API key is required');
    }

    this.apiKey = config.apiKey;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'X-Hume-Api-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  async textToSpeech(text: string, voiceId: string, options?: TTSOptions): Promise<Buffer> {
    try {
      const requestBody: any = {
        utterances: [
          {
            text,
          }
        ],
        format: {
          type: options?.outputFormat || 'mp3'
        }
      };

      // Use the voice ID from Hume API
      requestBody.utterances[0].voice = {
        id: voiceId
      };

      const response = await this.client.post(
        '/tts/file',
        requestBody,
        {
          responseType: 'arraybuffer',
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        if (status === 401) {
          throw new TTSProviderError(this.name, 'Invalid API key');
        } else if (status === 429) {
          throw new TTSProviderError(this.name, 'Rate limit exceeded');
        } else if (status === 400) {
          throw new TTSProviderError(this.name, `Bad request: ${message}`);
        } else {
          throw new TTSProviderError(this.name, `API error: ${message}`);
        }
      }
      throw new TTSProviderError(this.name, 'Failed to synthesize speech');
    }
  }

  async textToSpeechStream(text: string, voiceId: string, options?: TTSOptions): Promise<Readable> {
    try {
      const requestBody: any = {
        utterances: [
          {
            text,
          }
        ],
        format: {
          type: options?.outputFormat || 'mp3'
        }
      };

      // Use the voice ID from Hume API
      requestBody.utterances[0].voice = {
        id: voiceId
      };

      const response = await this.client.post(
        '/tts/file/streaming',
        requestBody,
        {
          responseType: 'stream',
        }
      );

      return response.data as Readable;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        if (status === 401) {
          throw new TTSProviderError(this.name, 'Invalid API key');
        } else if (status === 429) {
          throw new TTSProviderError(this.name, 'Rate limit exceeded');
        } else if (status === 400) {
          throw new TTSProviderError(this.name, `Bad request: ${message}`);
        } else {
          throw new TTSProviderError(this.name, `API error: ${message}`);
        }
      }
      throw new TTSProviderError(this.name, 'Failed to stream speech');
    }
  }

  async listVoices(): Promise<TTSVoice[]> {
    try {
      const voices: TTSVoice[] = [];

      // Fetch HUME_AI preset voices
      const humeResponse = await this.client.get('/tts/voices', {
        params: {
          provider: 'HUME_AI',
          page_size: 100
        }
      });

      if (humeResponse.data?.voices_page) {
        for (const voice of humeResponse.data.voices_page) {
          voices.push({
            id: voice.id,
            name: voice.name,
            provider: 'hume',
            description: `Hume AI preset voice: ${voice.name}`,
            languages: ['en', 'ja'], // Hume AI supports multiple languages
          });
        }
      }

      // Fetch CUSTOM_VOICE voices
      try {
        const customResponse = await this.client.get('/tts/voices', {
          params: {
            provider: 'CUSTOM_VOICE',
            page_size: 100
          }
        });

        if (customResponse.data?.voices_page) {
          for (const voice of customResponse.data.voices_page) {
            voices.push({
              id: voice.id,
              name: voice.name,
              provider: 'hume',
              description: `Custom voice: ${voice.name}`,
              languages: ['en', 'ja'], // Custom voices may support multiple languages
              labels: { is_owner: true, category: 'custom' }
            });
          }
        }
      } catch (error) {
        // Custom voices might not be available or accessible, continue with preset voices
      }

      return voices;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        if (status === 401) {
          throw new TTSProviderError(this.name, 'Invalid API key for voice listing');
        } else if (status === 429) {
          throw new TTSProviderError(this.name, 'Rate limit exceeded for voice listing');
        } else if (status === 400) {
          throw new TTSProviderError(this.name, `Bad request: ${message}`);
        } else {
          throw new TTSProviderError(this.name, `API error: ${message}`);
        }
      }
      throw new TTSProviderError(this.name, 'Failed to fetch voices from Hume API');
    }
  }

  async getVoice(voiceId: string): Promise<TTSVoice | null> {
    const voices = await this.listVoices();
    return voices.find(v => v.id === voiceId) || null;
  }

  getSupportedFormats(): string[] {
    return ['mp3', 'wav', 'ogg', 'flac'];
  }

  async validateConnection(): Promise<boolean> {
    try {
      // Make a simple test request to validate the API key
      await this.client.post('/tts/file', {
        utterances: [{ text: 'test' }],
        format: { type: 'mp3' }
      }, {
        validateStatus: (status) => status === 200 || status === 401
      });
      return true;
    } catch {
      return false;
    }
  }

}