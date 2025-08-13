import { TTSProvider, TTSProviderConfig, TTSOptions, TTSVoice } from './tts-provider';
import { Readable } from 'stream';

export class ResembleProvider implements TTSProvider {
  readonly name = 'resemble';
  private apiKey: string = '';
  private baseUrl = 'https://f.cluster.resemble.ai';

  async initialize(config: TTSProviderConfig): Promise<void> {
    if (!config.apiKey) {
      throw new Error('Resemble AI API key is required');
    }
    this.apiKey = config.apiKey;
  }

  async listVoices(): Promise<TTSVoice[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to list voices: ${response.statusText}`);
      }

      const data = await response.json() as any;
      
      if (data.items && Array.isArray(data.items)) {
        return data.items.map((voice: any) => ({
          id: voice.uuid,
          name: voice.name || voice.uuid,
          description: voice.description || '',
          provider: 'resemble',
          labels: {
            language: voice.language || 'en',
            gender: voice.gender,
            use_case: voice.use_case,
            is_owner: voice.is_owner || false,
          },
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error listing Resemble voices:', error);
      return [];
    }
  }

  async textToSpeech(text: string, voiceId: string, options?: TTSOptions): Promise<Buffer> {
    const requestBody = {
      voice_uuid: voiceId,
      data: text,
      output_format: options?.outputFormat === 'wav' ? 'wav' : 'mp3',
      sample_rate: 48000,
    };

    const response = await fetch(`${this.baseUrl}/synthesize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resemble AI synthesis failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as any;
    
    if (!data.success || !data.audio_content) {
      throw new Error('Resemble AI synthesis failed: No audio content in response');
    }

    // Decode base64 audio content
    const audioBuffer = Buffer.from(data.audio_content, 'base64');
    return audioBuffer;
  }

  async textToSpeechStream(text: string, voiceId: string, options?: TTSOptions): Promise<Readable> {
    // Resemble AI doesn't support streaming directly, so we'll get the buffer and convert to stream
    const audioBuffer = await this.textToSpeech(text, voiceId, options);
    
    const stream = new Readable();
    stream.push(audioBuffer);
    stream.push(null);
    
    return stream;
  }

  async getVoice(voiceId: string): Promise<TTSVoice | null> {
    try {
      const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const voice = await response.json() as any;
      
      return {
        id: voice.uuid,
        name: voice.name || voice.uuid,
        description: voice.description || '',
        provider: 'resemble',
        labels: {
          language: voice.language || 'en',
          gender: voice.gender,
          use_case: voice.use_case,
          is_owner: voice.is_owner || false,
        },
      };
    } catch (error) {
      console.error('Error getting Resemble voice details:', error);
      return null;
    }
  }

  getSupportedFormats(): string[] {
    return ['mp3', 'wav'];
  }

  async validateConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}