import axios, { AxiosInstance } from 'axios';
import { Readable } from 'stream';
import crypto from 'crypto';
import { 
  TTSProvider, 
  TTSProviderConfig, 
  TTSOptions, 
  TTSVoice, 
  TTSProviderError 
} from './tts-provider';

interface CoeFontProviderConfig extends TTSProviderConfig {
  accessKey: string;
  accessSecret: string;
}

interface CoeFontVoice {
  coefont_id: string;
  name: string;
  description?: string;
  language?: string;
}

export class CoeFontProvider implements TTSProvider {
  readonly name = 'coefont';
  private client!: AxiosInstance;
  private accessKey!: string;
  private accessSecret!: string;
  private baseUrl = 'https://api.coefont.cloud/v2';

  async initialize(config: CoeFontProviderConfig): Promise<void> {
    if (!config.accessKey || !config.accessSecret) {
      throw new TTSProviderError(this.name, 'CoeFont access key and access secret are required');
    }

    this.accessKey = config.accessKey;
    this.accessSecret = config.accessSecret;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private createAuthHeaders(requestBody?: any): Record<string, string> {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeString = currentTime.toString();
    
    // Create content for HMAC signature
    let content = timeString;
    if (requestBody) {
      content = timeString + JSON.stringify(requestBody);
    }
    
    // Generate HMAC-SHA256 signature
    const signature = crypto
      .createHmac('sha256', this.accessSecret)
      .update(content)
      .digest('hex');

    return {
      'Authorization': this.accessKey,
      'X-Coefont-Date': timeString,
      'X-Coefont-Content': signature,
    };
  }

  async textToSpeech(text: string, voiceId: string, _options?: TTSOptions): Promise<Buffer> {
    try {
      const requestBody = {
        coefont: voiceId,
        text: text,
        format: 'wav',
      };

      const authHeaders = this.createAuthHeaders(requestBody);
      
      const response = await this.client.post(
        '/text2speech',
        requestBody,
        {
          headers: {
            ...authHeaders,
          },
          responseType: 'arraybuffer',
          timeout: 30000, // 30 seconds timeout
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new TTSProviderError(this.name, `Text-to-speech failed: ${errorMessage}`);
      }
      throw error;
    }
  }

  async textToSpeechStream(text: string, voiceId: string, _options?: TTSOptions): Promise<Readable> {
    // CoeFont doesn't support streaming, so we'll convert buffer to stream
    const buffer = await this.textToSpeech(text, voiceId, _options);
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }

  async listVoices(): Promise<TTSVoice[]> {
    try {
      const authHeaders = this.createAuthHeaders();
      
      const response = await this.client.get('/coefonts/pro', {
        headers: {
          ...authHeaders,
        },
      });

      if (Array.isArray(response.data)) {
        return response.data.map((voice: CoeFontVoice) => ({
          id: voice.coefont_id,
          name: voice.name,
          description: voice.description || `CoeFont voice: ${voice.name}`,
          provider: this.name,
          labels: {},
          languages: voice.language ? [voice.language] : ['ja', 'en'], // Default to Japanese and English
        }));
      }
      
      return [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new TTSProviderError(this.name, `CoeFont API is not accessible`);
        }
        const errorMessage = error.response?.data?.message || error.message;
        throw new TTSProviderError(this.name, `Failed to list voices: ${errorMessage}`);
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
      const authHeaders = this.createAuthHeaders();
      
      await this.client.get('/coefonts/pro', {
        headers: {
          ...authHeaders,
        },
        timeout: 10000, // 10 seconds timeout for validation
      });
      
      return true;
    } catch (error) {
      return false;
    }
  }
}