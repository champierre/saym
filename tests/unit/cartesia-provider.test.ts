import { CartesiaProvider } from '../../src/providers/cartesia-provider';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CartesiaProvider', () => {
  let provider: CartesiaProvider;
  const mockApiKey = 'test-cartesia-api-key';

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock axios.create to return a mock client
    const mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      headers: {},
    };
    mockedAxios.create.mockReturnValue(mockClient as any);

    provider = new CartesiaProvider();
    await provider.initialize({ apiKey: mockApiKey });
  });

  describe('initialization', () => {
    it('should initialize with API key', async () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.cartesia.ai',
        headers: {
          'Authorization': `Bearer ${mockApiKey}`,
          'Cartesia-Version': '2025-04-16',
          'Content-Type': 'application/json',
        },
      });
    });

    it('should throw error if API key is not provided', async () => {
      const newProvider = new CartesiaProvider();
      await expect(newProvider.initialize({} as any)).rejects.toThrow('API key is required');
    });
  });

  describe('listVoices', () => {
    it('should return mapped voices from API response', async () => {
      const mockApiResponse = {
        data: {
          data: [
            {
              id: 'voice-1',
              name: 'Test Voice 1',
              description: 'A test voice',
              language: 'en',
              gender: 'feminine',
              is_owner: true,
              is_public: false,
              is_starred: false,
              created_at: '2025-08-01T05:40:47.298633Z',
            },
            {
              id: 'voice-2',
              name: 'Test Voice 2',
              description: 'Another test voice',
              language: 'ja',
              gender: 'masculine',
              is_owner: false,
              is_public: true,
              is_starred: true,
              created_at: '2025-08-01T06:40:47.298633Z',
            },
          ],
        },
      };

      const client = (provider as any).client;
      client.get.mockResolvedValue(mockApiResponse);

      const voices = await provider.listVoices();

      expect(client.get).toHaveBeenCalledWith('/voices/', {
        params: { limit: 100 },
      });

      expect(voices).toHaveLength(2);

      // Check first voice mapping
      expect(voices[0]).toEqual({
        id: 'voice-1',
        name: 'Test Voice 1',
        description: 'A test voice',
        provider: 'cartesia',
        languages: ['en'],
        labels: {
          gender: 'feminine',
          is_owner: true,
          is_public: false,
          is_starred: false,
          created_at: '2025-08-01T05:40:47.298633Z',
        },
      });

      // Check second voice mapping
      expect(voices[1]).toEqual({
        id: 'voice-2',
        name: 'Test Voice 2',
        description: 'Another test voice',
        provider: 'cartesia',
        languages: ['ja'],
        labels: {
          gender: 'masculine',
          is_owner: false,
          is_public: true,
          is_starred: true,
          created_at: '2025-08-01T06:40:47.298633Z',
        },
      });
    });

    it('should handle voices without language gracefully', async () => {
      const mockApiResponse = {
        data: {
          data: [
            {
              id: 'voice-no-lang',
              name: 'Voice Without Language',
              description: 'Test voice without language',
              gender: 'feminine',
              is_owner: true,
              is_public: false,
              is_starred: false,
              created_at: '2025-08-01T05:40:47.298633Z',
            },
          ],
        },
      };

      const client = (provider as any).client;
      client.get.mockResolvedValue(mockApiResponse);

      const voices = await provider.listVoices();

      expect(voices[0].languages).toEqual(['en']); // Default language
    });

    it('should handle voices without description', async () => {
      const mockApiResponse = {
        data: {
          data: [
            {
              id: 'voice-no-desc',
              name: 'Voice Without Description',
              language: 'fr',
              gender: 'masculine',
              is_owner: false,
              is_public: true,
              is_starred: false,
              created_at: '2025-08-01T05:40:47.298633Z',
            },
          ],
        },
      };

      const client = (provider as any).client;
      client.get.mockResolvedValue(mockApiResponse);

      const voices = await provider.listVoices();

      expect(voices[0].description).toBe(''); // Empty string for missing description
    });

    it('should handle API errors', async () => {
      const client = (provider as any).client;
      const error = {
        isAxiosError: true,
        response: {
          status: 401,
          data: 'Unauthorized',
        },
      };

      // Mock axios.isAxiosError to return true
      mockedAxios.isAxiosError.mockReturnValue(true);
      client.get.mockRejectedValue(error);

      await expect(provider.listVoices()).rejects.toThrow('Failed to list voices: 401 Unauthorized');
    });

    it('should handle network errors', async () => {
      const client = (provider as any).client;
      const error = {
        isAxiosError: true,
        message: 'Network Error',
      };

      // Mock axios.isAxiosError to return true
      mockedAxios.isAxiosError.mockReturnValue(true);
      client.get.mockRejectedValue(error);

      await expect(provider.listVoices()).rejects.toThrow('Failed to list voices: undefined Network Error');
    });
  });

  describe('getVoice', () => {
    it('should return specific voice by ID', async () => {
      const mockVoices = [
        {
          id: 'voice-1',
          name: 'Test Voice 1',
          description: 'A test voice',
          provider: 'cartesia',
          languages: ['en'],
          labels: { is_owner: true, is_public: false },
        },
        {
          id: 'voice-2',
          name: 'Test Voice 2',
          description: 'Another test voice',
          provider: 'cartesia',
          languages: ['ja'],
          labels: { is_owner: false, is_public: true },
        },
      ];

      // Mock listVoices to return test voices
      jest.spyOn(provider, 'listVoices').mockResolvedValue(mockVoices);

      const voice = await provider.getVoice('voice-1');

      expect(voice).toEqual(mockVoices[0]);
    });

    it('should return null for non-existent voice ID', async () => {
      const mockVoices = [
        {
          id: 'voice-1',
          name: 'Test Voice 1',
          description: 'A test voice',
          provider: 'cartesia',
          languages: ['en'],
          labels: { is_owner: true, is_public: false },
        },
      ];

      jest.spyOn(provider, 'listVoices').mockResolvedValue(mockVoices);

      const voice = await provider.getVoice('non-existent');

      expect(voice).toBeNull();
    });
  });

  describe('parseOutputFormat', () => {
    it('should return correct format for MP3', () => {
      const parseOutputFormat = (provider as any).parseOutputFormat;

      const mp3Format = parseOutputFormat('mp3');

      expect(mp3Format).toEqual({
        container: 'mp3',
        bit_rate: 128000,
        sample_rate: 44100,
      });
    });

    it('should return correct format for WAV', () => {
      const parseOutputFormat = (provider as any).parseOutputFormat;

      const wavFormat = parseOutputFormat('wav');

      expect(wavFormat).toEqual({
        container: 'wav',
        encoding: 'pcm_f32le',
        sample_rate: 44100,
      });
    });

    it('should return correct format for RAW', () => {
      const parseOutputFormat = (provider as any).parseOutputFormat;

      const rawFormat = parseOutputFormat('raw');

      expect(rawFormat).toEqual({
        container: 'raw',
        encoding: 'pcm_s16le',
        sample_rate: 44100,
      });
    });

    it('should return default format for undefined input', () => {
      const parseOutputFormat = (provider as any).parseOutputFormat;

      const defaultFormat = parseOutputFormat(undefined);

      expect(defaultFormat).toEqual({
        container: 'wav',
        encoding: 'pcm_f32le',
        sample_rate: 44100,
      });
    });

    it('should return default format for unknown format', () => {
      const parseOutputFormat = (provider as any).parseOutputFormat;

      const unknownFormat = parseOutputFormat('unknown');

      expect(unknownFormat).toEqual({
        container: 'wav',
        encoding: 'pcm_f32le',
        sample_rate: 44100,
      });
    });
  });

  describe('provider info', () => {
    it('should return correct provider name', () => {
      expect(provider.name).toBe('cartesia');
    });


    it('should return supported formats', () => {
      const formats = provider.getSupportedFormats();
      expect(formats).toEqual(['wav', 'raw', 'mp3']);
    });
  });

  describe('textToSpeech', () => {
    it('should make correct API request for MP3 format', async () => {
      const client = (provider as any).client;
      const mockResponse = { data: Buffer.from('mock audio data') };
      client.post.mockResolvedValue(mockResponse);

      const result = await provider.textToSpeech('Hello world', 'voice-1', {
        outputFormat: 'mp3',
      });

      expect(client.post).toHaveBeenCalledWith(
        '/tts/bytes',
        {
          transcript: 'Hello world',
          model_id: 'sonic-2',
          voice: {
            mode: 'id',
            id: 'voice-1',
          },
          output_format: {
            container: 'mp3',
            bit_rate: 128000,
            sample_rate: 44100,
          },
        },
        {
          responseType: 'arraybuffer',
        }
      );

      expect(result).toBeInstanceOf(Buffer);
    });
  });
});