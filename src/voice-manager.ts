import axios, { AxiosInstance } from 'axios';
import { Voice, VoiceManagerError } from './types';

export class VoiceManager {
  private client: AxiosInstance;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new VoiceManagerError('ElevenLabs API key is required');
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'xi-api-key': apiKey,
      },
    });
  }

  /**
   * List all available voices including custom ones
   */
  async listVoices(): Promise<Voice[]> {
    try {
      const response = await this.client.get('/voices');
      return response.data.voices;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new VoiceManagerError(`Failed to list voices: ${error.response?.data?.detail?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get a specific voice by ID
   */
  async getVoice(voiceId: string): Promise<Voice> {
    try {
      const response = await this.client.get(`/voices/${voiceId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new VoiceManagerError(`Failed to get voice: ${error.response?.data?.detail?.message || error.message}`);
      }
      throw error;
    }
  }


  /**
   * Update voice settings
   */
  async updateVoiceSettings(voiceId: string, settings: Partial<Voice>): Promise<void> {
    try {
      await this.client.post(`/voices/${voiceId}/settings/edit`, settings);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new VoiceManagerError(`Failed to update voice settings: ${error.response?.data?.detail?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get voice generation history
   */
  async getVoiceGenerationHistory(): Promise<any[]> {
    try {
      const response = await this.client.get('/voice-generation/history');
      return response.data.history;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new VoiceManagerError(`Failed to get voice generation history: ${error.response?.data?.detail?.message || error.message}`);
      }
      throw error;
    }
  }

}