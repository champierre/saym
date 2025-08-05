import axios, { AxiosInstance } from 'axios';
import fs from 'fs';
import { Readable } from 'stream';
import { VoiceSettings, VoiceEngineError } from './types';

export class VoiceEngine {
  private client: AxiosInstance;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new VoiceEngineError('ElevenLabs API key is required');
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'xi-api-key': apiKey,
      },
    });
  }

  /**
   * Convert text to speech using a specific voice
   */
  async textToSpeech(
    text: string,
    voiceId: string,
    options?: {
      modelId?: string;
      voiceSettings?: VoiceSettings;
      outputFormat?: 'mp3_44100_128' | 'mp3_44100_64' | 'mp3_44100_32' | 'mp3_44100_16' | 'pcm_16000' | 'pcm_22050' | 'pcm_24000' | 'pcm_44100';
    }
  ): Promise<Buffer> {
    try {
      const response = await this.client.post(
        `/text-to-speech/${voiceId}`,
        {
          text,
          model_id: options?.modelId || 'eleven_monolingual_v1',
          voice_settings: options?.voiceSettings || {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
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
        throw new VoiceEngineError(`Text-to-speech failed: ${errorMessage}`);
      }
      throw error;
    }
  }

  /**
   * Stream text to speech for real-time playback
   */
  async textToSpeechStream(
    text: string,
    voiceId: string,
    options?: {
      modelId?: string;
      voiceSettings?: VoiceSettings;
      outputFormat?: string;
    }
  ): Promise<Readable> {
    try {
      const response = await this.client.post(
        `/text-to-speech/${voiceId}/stream`,
        {
          text,
          model_id: options?.modelId || 'eleven_monolingual_v1',
          voice_settings: options?.voiceSettings || {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
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
        throw new VoiceEngineError(`Text-to-speech stream failed: ${errorMessage}`);
      }
      throw error;
    }
  }

  /**
   * Save audio to file
   */
  async saveAudioToFile(audio: Buffer, filePath: string): Promise<void> {
    try {
      await fs.promises.writeFile(filePath, audio);
    } catch (error) {
      throw new VoiceEngineError(`Failed to save audio file: ${error}`);
    }
  }

  /**
   * Save audio stream to file
   */
  async saveStreamToFile(stream: Readable, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(filePath);
      
      stream.pipe(writeStream);
      
      writeStream.on('finish', resolve);
      writeStream.on('error', (error) => {
        reject(new VoiceEngineError(`Failed to save audio stream: ${error}`));
      });
      
      stream.on('error', (error) => {
        writeStream.destroy();
        reject(new VoiceEngineError(`Stream error: ${error}`));
      });
    });
  }

  /**
   * Get available models
   */
  async getModels(): Promise<any[]> {
    try {
      const response = await this.client.get('/models');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new VoiceEngineError(`Failed to get models: ${error.response?.data?.detail?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get user subscription info
   */
  async getSubscriptionInfo(): Promise<any> {
    try {
      const response = await this.client.get('/user/subscription');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new VoiceEngineError(`Failed to get subscription info: ${error.response?.data?.detail?.message || error.message}`);
      }
      throw error;
    }
  }
}