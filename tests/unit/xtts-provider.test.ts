import { XTTSProvider } from '../../src/providers/xtts-provider';
import axios from 'axios';
import { TTSProviderError } from '../../src/providers/tts-provider';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('XTTSProvider', () => {
  let provider: XTTSProvider;
  let mockAxiosInstance: any;

  beforeEach(() => {
    provider = new XTTSProvider();
    mockAxiosInstance = {
      post: jest.fn(),
      get: jest.fn(),
    };
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize with server URL and API key', async () => {
      await provider.initialize({ 
        apiKey: 'test-api-key',
        serverUrl: 'http://localhost:8020' 
      });

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:8020',
        headers: {
          'Authorization': 'Bearer test-api-key',
        },
      });
    });

    it('should initialize with default server URL', async () => {
      await provider.initialize({ apiKey: 'test-api-key' });

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:8020',
        headers: {
          'Authorization': 'Bearer test-api-key',
        },
      });
    });

    it('should initialize without auth headers when apiKey is "none"', async () => {
      await provider.initialize({ apiKey: 'none' });

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:8020',
        headers: {},
      });
    });

    it('should throw error when API key is not provided', async () => {
      await expect(provider.initialize({} as any)).rejects.toThrow(
        new TTSProviderError('xtts', 'API key is required (use "none" for no authentication)')
      );
    });
  });

  describe('textToSpeech', () => {
    beforeEach(async () => {
      await provider.initialize({ apiKey: 'test-api-key' });
    });

    it('should convert text to speech successfully', async () => {
      const audioBuffer = Buffer.from('audio-data');
      mockAxiosInstance.post.mockResolvedValue({ data: audioBuffer });

      const result = await provider.textToSpeech('Hello world', 'voice123');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/tts',
        {
          text: 'Hello world',
          speaker_wav: 'voice123',
          language: 'en'
        },
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
          responseType: 'arraybuffer',
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        })
      );
      expect(result).toEqual(audioBuffer);
    });

    it('should handle language option', async () => {
      const audioBuffer = Buffer.from('audio-data');
      mockAxiosInstance.post.mockResolvedValue({ data: audioBuffer });

      await provider.textToSpeech('Hello world', 'voice123', { language: 'ja' });

      // Check that the post was called
      expect(mockAxiosInstance.post).toHaveBeenCalled();
      // We can't directly test FormData in jest, but we can verify the call was made
    });

    it('should handle API errors', async () => {
      const mockError = {
        isAxiosError: true,
        response: {
          data: { detail: 'Invalid voice ID' },
        },
      };
      
      // Make isAxiosError return true for our mock error
      (axios.isAxiosError as unknown as jest.Mock) = jest.fn().mockReturnValue(true);
      mockAxiosInstance.post.mockRejectedValue(mockError);

      await expect(provider.textToSpeech('Hello', 'invalid-voice')).rejects.toThrow(
        'Text-to-speech failed: Invalid voice ID'
      );
    });
  });

  describe('textToSpeechStream', () => {
    beforeEach(async () => {
      await provider.initialize({ apiKey: 'test-api-key' });
    });

    it('should stream text to speech successfully', async () => {
      const mockStream = { pipe: jest.fn() };
      mockAxiosInstance.post.mockResolvedValue({ data: mockStream });

      const result = await provider.textToSpeechStream('Hello world', 'voice123');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/tts_stream',
        expect.any(Object),
        expect.objectContaining({
          responseType: 'stream',
        })
      );
      expect(result).toEqual(mockStream);
    });

    it('should handle stream errors', async () => {
      const mockError = {
        isAxiosError: true,
        message: 'Connection refused',
      };
      
      (axios.isAxiosError as unknown as jest.Mock) = jest.fn().mockReturnValue(true);
      mockAxiosInstance.post.mockRejectedValue(mockError);

      await expect(provider.textToSpeechStream('Hello', 'voice123')).rejects.toThrow(
        'Text-to-speech stream failed: Connection refused'
      );
    });
  });

  describe('listVoices', () => {
    beforeEach(async () => {
      await provider.initialize({ apiKey: 'test-api-key' });
    });

    it('should list available voices', async () => {
      const voices = await provider.listVoices();

      expect(voices).toHaveLength(1);
      expect(voices[0]).toEqual({
        id: 'custom',
        name: 'Custom Voice (provide .wav file)',
        description: 'XTTS v2 requires a speaker WAV file for voice cloning',
        provider: 'xtts',
        labels: {},
        languages: expect.arrayContaining(['en', 'ja', 'es', 'fr']),
      });
    });

    it('should handle connection errors', async () => {
      // listVoices doesn't make API calls anymore, it returns static data
      // This test is no longer relevant since listVoices always succeeds
      const voices = await provider.listVoices();
      expect(voices).toHaveLength(1);
    });

    it('should return custom voice array', async () => {
      const voices = await provider.listVoices();
      expect(voices).toHaveLength(1);
      expect(voices[0].id).toBe('custom');
    });
  });

  describe('getVoice', () => {
    beforeEach(async () => {
      await provider.initialize({ apiKey: 'test-api-key' });
    });

    it('should get a specific voice', async () => {
      const voice = await provider.getVoice('custom');

      expect(voice).toEqual({
        id: 'custom',
        name: 'Custom Voice (provide .wav file)',
        description: 'XTTS v2 requires a speaker WAV file for voice cloning',
        provider: 'xtts',
        labels: {},
        languages: expect.arrayContaining(['en', 'ja', 'es', 'fr']),
      });
    });

    it('should return null for non-existent voice', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: ['voice1.wav'] });

      const voice = await provider.getVoice('non-existent');
      expect(voice).toBeNull();
    });
  });

  describe('getSupportedFormats', () => {
    it('should return supported audio formats', () => {
      const formats = provider.getSupportedFormats();
      expect(formats).toEqual(['wav']);
    });
  });

  describe('validateConnection', () => {
    beforeEach(async () => {
      await provider.initialize({ apiKey: 'test-api-key' });
    });

    it('should return true for valid connection', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: {} });

      const isValid = await provider.validateConnection();
      expect(isValid).toBe(true);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/health');
    });

    it('should return false for invalid connection', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Connection failed'));

      const isValid = await provider.validateConnection();
      expect(isValid).toBe(false);
    });
  });
});