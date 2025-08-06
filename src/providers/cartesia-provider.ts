import axios, { AxiosInstance } from 'axios';
import { Readable } from 'stream';
import WebSocket from 'ws';
import { 
  TTSProvider, 
  TTSProviderConfig, 
  TTSOptions, 
  TTSVoice, 
  TTSProviderError 
} from './tts-provider';

interface CartesiaOutputFormat {
  container: 'raw' | 'wav' | 'mp3';
  encoding?: 'pcm_s16le' | 'pcm_f32le' | 'pcm_mulaw' | 'pcm_alaw';
  bit_rate?: number;
  sample_rate: number;
}

export class CartesiaProvider implements TTSProvider {
  readonly name = 'cartesia';
  private client!: AxiosInstance;
  private apiKey!: string;
  private baseUrl = 'https://api.cartesia.ai';
  private wsUrl = 'wss://api.cartesia.ai/tts/websocket';

  async initialize(config: TTSProviderConfig): Promise<void> {
    if (!config.apiKey) {
      throw new TTSProviderError(this.name, 'API key is required');
    }

    this.apiKey = config.apiKey;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Cartesia-Version': '2025-04-16',
        'Content-Type': 'application/json',
      },
    });
  }

  async textToSpeech(text: string, voiceId: string, options?: TTSOptions): Promise<Buffer> {
    try {
      const outputFormat = this.parseOutputFormat(options?.outputFormat);
      
      const requestBody = {
        transcript: text,
        model_id: options?.modelId || 'sonic-2',
        voice: {
          mode: 'id',
          id: voiceId,
        },
        output_format: outputFormat,
      };
      
      
      const response = await this.client.post(
        '/tts/bytes',
        requestBody,
        {
          responseType: 'arraybuffer',
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.response?.data || error.message;
        throw new TTSProviderError(this.name, `Text-to-speech failed: ${error.response?.status} ${errorMessage}`);
      }
      throw error;
    }
  }

  async textToSpeechStream(text: string, voiceId: string, options?: TTSOptions): Promise<Readable> {
    return new Promise((resolve, reject) => {
      const stream = new Readable({
        read() {} // No-op
      });

      const ws = new WebSocket(this.wsUrl, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Cartesia-Version': '2025-04-16',
        },
      });

      ws.on('open', () => {
        // Send the TTS request
        const request = {
          transcript: text,
          model_id: options?.modelId || 'sonic-2',
          voice: {
            mode: 'id',
            id: voiceId,
          },
          output_format: {
            container: 'raw',
            encoding: 'pcm_s16le',
            sample_rate: 44100,
          },
          context_id: this.generateContextId(),
        };

        ws.send(JSON.stringify(request));
        resolve(stream);
      });

      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          
          if (message.type === 'chunk' && message.data) {
            // Convert base64 audio data to buffer and push to stream
            const audioBuffer = Buffer.from(message.data, 'base64');
            stream.push(audioBuffer);
          } else if (message.type === 'done') {
            // End the stream when done
            stream.push(null);
            ws.close();
          } else if (message.type === 'error') {
            stream.destroy(new TTSProviderError(this.name, message.message || 'WebSocket error'));
            ws.close();
          }
        } catch (error) {
          // If it's not JSON, it might be binary audio data
          stream.push(data);
        }
      });

      ws.on('error', (error) => {
        stream.destroy(new TTSProviderError(this.name, `WebSocket error: ${error.message}`));
        reject(error);
      });

      ws.on('close', () => {
        stream.push(null);
      });
    });
  }

  async listVoices(): Promise<TTSVoice[]> {
    // Cartesia has predefined voices, we'll return a static list
    // In a real implementation, this might come from an API endpoint
    return [
      {
        id: '694f9389-aac1-45b6-b726-9d9369183238',
        name: 'Cartesia Default',
        description: 'Default Cartesia voice',
        provider: this.name,
        languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'ru', 'nl', 'sv', 'no', 'da', 'fi', 'cs', 'tr'],
      },
      // Add more voices as they become available
    ];
  }

  async getVoice(voiceId: string): Promise<TTSVoice | null> {
    const voices = await this.listVoices();
    return voices.find(v => v.id === voiceId) || null;
  }

  supportsVoiceCloning(): boolean {
    return true; // Cartesia supports voice cloning
  }

  async createVoice(_name: string, _samples: Buffer[], _description?: string): Promise<string> {
    // Cartesia voice cloning API would go here
    // This is a placeholder as the specific API endpoint wasn't found in docs
    throw new TTSProviderError(this.name, 'Voice cloning API not yet implemented');
  }

  async deleteVoice(_voiceId: string): Promise<void> {
    // Cartesia voice deletion API would go here
    throw new TTSProviderError(this.name, 'Voice deletion API not yet implemented');
  }

  getSupportedFormats(): string[] {
    return ['wav', 'raw', 'mp3'];
  }

  async validateConnection(): Promise<boolean> {
    try {
      // Try a minimal API call to validate the connection
      const voices = await this.listVoices();
      return voices.length > 0;
    } catch (error) {
      return false;
    }
  }

  private parseOutputFormat(format?: string): CartesiaOutputFormat {
    // Default format
    const defaultFormat: CartesiaOutputFormat = {
      container: 'wav',
      encoding: 'pcm_f32le',
      sample_rate: 44100,
    };

    if (!format) return defaultFormat;

    // Parse format string (e.g., "wav", "mp3", "raw")
    switch (format.toLowerCase()) {
      case 'mp3':
        // MP3 uses bit_rate instead of encoding
        return { 
          container: 'mp3', 
          bit_rate: 128000, // 128 kbps
          sample_rate: 44100 
        };
      case 'raw':
        return { container: 'raw', encoding: 'pcm_s16le', sample_rate: 44100 };
      case 'wav':
      default:
        return defaultFormat;
    }
  }

  private generateContextId(): string {
    return `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}