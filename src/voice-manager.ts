import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { Voice, VoiceCloneRequest, VoiceManagerError } from './types';

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
   * Create a new voice model from audio samples
   */
  async createVoice(request: VoiceCloneRequest): Promise<string> {
    try {
      const formData = new FormData();
      
      formData.append('name', request.name);
      if (request.description) {
        formData.append('description', request.description);
      }
      
      if (request.labels) {
        formData.append('labels', JSON.stringify(request.labels));
      }

      // Add audio files
      request.files.forEach((file) => {
        formData.append('files', file.data, {
          filename: file.filename,
          contentType: file.contentType,
        });
      });

      const response = await this.client.post('/voices/add', formData, {
        headers: {
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      return response.data.voice_id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.detail?.message || error.message;
        throw new VoiceManagerError(`Failed to create voice: ${errorMessage}`);
      }
      throw error;
    }
  }

  /**
   * Create a voice model from local audio files
   */
  async createVoiceFromFiles(name: string, audioFiles: string[], description?: string, labels?: Record<string, string>): Promise<string> {
    const files: VoiceCloneRequest['files'] = [];

    // Validate and read audio files
    for (const filePath of audioFiles) {
      if (!fs.existsSync(filePath)) {
        throw new VoiceManagerError(`Audio file not found: ${filePath}`);
      }

      const stats = fs.statSync(filePath);
      if (stats.size > 10 * 1024 * 1024) { // 10MB limit per file
        throw new VoiceManagerError(`Audio file too large (max 10MB): ${filePath}`);
      }

      const extension = path.extname(filePath).toLowerCase();
      const validExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.flac'];
      if (!validExtensions.includes(extension)) {
        throw new VoiceManagerError(`Invalid audio format: ${extension}. Supported formats: ${validExtensions.join(', ')}`);
      }

      const data = fs.readFileSync(filePath);
      const contentType = this.getContentType(extension);
      
      files.push({
        data,
        filename: path.basename(filePath),
        contentType,
      });
    }

    if (files.length === 0) {
      throw new VoiceManagerError('At least one audio file is required');
    }

    if (files.length > 25) {
      throw new VoiceManagerError('Maximum 25 audio files allowed');
    }

    return this.createVoice({
      name,
      description,
      files,
      labels,
    });
  }

  /**
   * Delete a custom voice
   */
  async deleteVoice(voiceId: string): Promise<void> {
    try {
      await this.client.delete(`/voices/${voiceId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new VoiceManagerError(`Failed to delete voice: ${error.response?.data?.detail?.message || error.message}`);
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

  private getContentType(extension: string): string {
    const contentTypes: Record<string, string> = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.m4a': 'audio/mp4',
      '.ogg': 'audio/ogg',
      '.flac': 'audio/flac',
    };
    return contentTypes[extension] || 'audio/mpeg';
  }
}