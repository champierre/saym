import { VoiceManager } from '../../src/voice-manager';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('VoiceManager', () => {
  let voiceManager: VoiceManager;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    mockedAxios.create.mockReturnValue({
      get: jest.fn(),
      post: jest.fn(),
      delete: jest.fn(),
    } as any);
    
    voiceManager = new VoiceManager(mockApiKey);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should throw error if API key is not provided', () => {
      expect(() => new VoiceManager('')).toThrow('ElevenLabs API key is required');
    });

    it('should create axios client with correct headers', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.elevenlabs.io/v1',
        headers: {
          'xi-api-key': mockApiKey,
        },
      });
    });
  });

  describe('listVoices', () => {
    it('should return list of voices', async () => {
      const mockVoices = [
        { voice_id: 'voice1', name: 'Voice 1' },
        { voice_id: 'voice2', name: 'Voice 2' },
      ];

      const client = (voiceManager as any).client;
      client.get.mockResolvedValue({ data: { voices: mockVoices } });

      const voices = await voiceManager.listVoices();
      expect(voices).toEqual(mockVoices);
      expect(client.get).toHaveBeenCalledWith('/voices');
    });

    it('should handle API errors', async () => {
      const client = (voiceManager as any).client;
      client.get.mockRejectedValue({
        isAxiosError: true,
        response: {
          data: {
            detail: {
              message: 'API error',
            },
          },
        },
      });

      await expect(voiceManager.listVoices()).rejects.toThrow('Failed to list voices: API error');
    });
  });

  describe('getVoice', () => {
    it('should return specific voice', async () => {
      const mockVoice = { voice_id: 'voice1', name: 'Voice 1' };
      const client = (voiceManager as any).client;
      client.get.mockResolvedValue({ data: mockVoice });

      const voice = await voiceManager.getVoice('voice1');
      expect(voice).toEqual(mockVoice);
      expect(client.get).toHaveBeenCalledWith('/voices/voice1');
    });
  });

  describe('deleteVoice', () => {
    it('should delete voice successfully', async () => {
      const client = (voiceManager as any).client;
      client.delete.mockResolvedValue({});

      await voiceManager.deleteVoice('voice1');
      expect(client.delete).toHaveBeenCalledWith('/voices/voice1');
    });
  });
});