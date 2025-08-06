import axios from 'axios';
import { ElevenLabsProvider } from '../../src/providers/elevenlabs-provider';

// Mock axios to intercept and validate API calls
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ElevenLabs API Request Format', () => {
  let provider: ElevenLabsProvider;
  const mockApiKey = 'sk_test123456789012345678901234567890123456789012';

  beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock axios.create to return a mock client
    const mockClient = {
      post: jest.fn(),
      get: jest.fn(),
      defaults: {
        headers: {
          'xi-api-key': mockApiKey
        }
      }
    };
    
    mockedAxios.create.mockReturnValue(mockClient as any);
    
    // Create provider instance
    provider = new ElevenLabsProvider();
    await provider.initialize({ apiKey: mockApiKey });
  });

  test('should send correct headers for text-to-speech request', async () => {
    // Mock successful response
    const mockClient = mockedAxios.create() as any;
    mockClient.post.mockResolvedValue({
      data: Buffer.from('fake audio data')
    });

    const voiceId = 'test-voice-id';
    const text = 'Hello world';

    try {
      await provider.textToSpeech(text, voiceId);
    } catch (error) {
      // We expect this to work in the test environment
    }

    // Verify the request was made with correct parameters
    expect(mockClient.post).toHaveBeenCalledWith(
      `/text-to-speech/${voiceId}`,
      {
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );
  });

  test('should NOT include Accept: audio/mpeg header', async () => {
    const mockClient = mockedAxios.create() as any;
    mockClient.post.mockResolvedValue({
      data: Buffer.from('fake audio data')
    });

    await provider.textToSpeech('test', 'voice-id');

    // Verify that the problematic header is NOT included
    const callArgs = mockClient.post.mock.calls[0];
    const requestConfig = callArgs[2];
    
    expect(requestConfig.headers).toBeDefined();
    expect(requestConfig.headers['Accept']).toBeUndefined();
    expect(requestConfig.headers['Accept']).not.toBe('audio/mpeg');
  });

  test('should NOT include output_format parameter', async () => {
    const mockClient = mockedAxios.create() as any;
    mockClient.post.mockResolvedValue({
      data: Buffer.from('fake audio data')
    });

    await provider.textToSpeech('test', 'voice-id', { outputFormat: 'mp3' });

    // Verify that params (including output_format) are not included
    const callArgs = mockClient.post.mock.calls[0];
    const requestConfig = callArgs[2];
    
    expect(requestConfig.params).toBeUndefined();
  });

  test('should use correct Content-Type header', async () => {
    const mockClient = mockedAxios.create() as any;
    mockClient.post.mockResolvedValue({
      data: Buffer.from('fake audio data')
    });

    await provider.textToSpeech('test', 'voice-id');

    const callArgs = mockClient.post.mock.calls[0];
    const requestConfig = callArgs[2];
    
    expect(requestConfig.headers['Content-Type']).toBe('application/json');
  });

  test('should use arraybuffer response type', async () => {
    const mockClient = mockedAxios.create() as any;
    mockClient.post.mockResolvedValue({
      data: Buffer.from('fake audio data')
    });

    await provider.textToSpeech('test', 'voice-id');

    const callArgs = mockClient.post.mock.calls[0];
    const requestConfig = callArgs[2];
    
    expect(requestConfig.responseType).toBe('arraybuffer');
  });

  test('should handle voice settings correctly', async () => {
    const mockClient = mockedAxios.create() as any;
    mockClient.post.mockResolvedValue({
      data: Buffer.from('fake audio data')
    });

    const customSettings = {
      stability: 0.8,
      similarity: 0.9,
      style: 0.1,
      speakerBoost: false,
    };

    await provider.textToSpeech('test', 'voice-id', {
      voiceSettings: customSettings
    });

    const callArgs = mockClient.post.mock.calls[0];
    const requestBody = callArgs[1];
    
    expect(requestBody.voice_settings).toEqual({
      stability: 0.8,
      similarity_boost: 0.9,
      style: 0.1,
      use_speaker_boost: false,
    });
  });

  test('should use default voice settings when none provided', async () => {
    const mockClient = mockedAxios.create() as any;
    mockClient.post.mockResolvedValue({
      data: Buffer.from('fake audio data')
    });

    await provider.textToSpeech('test', 'voice-id');

    const callArgs = mockClient.post.mock.calls[0];
    const requestBody = callArgs[1];
    
    expect(requestBody.voice_settings).toEqual({
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true,
    });
  });

  test('should use correct base URL and endpoint', async () => {
    const mockClient = mockedAxios.create() as any;
    mockClient.post.mockResolvedValue({
      data: Buffer.from('fake audio data')
    });

    const voiceId = 'test-voice-123';
    await provider.textToSpeech('test', voiceId);

    // Verify axios.create was called with correct baseURL
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'https://api.elevenlabs.io/v1',
      headers: {
        'xi-api-key': mockApiKey,
      },
    });

    // Verify the endpoint path is correct
    const callArgs = mockClient.post.mock.calls[0];
    const endpoint = callArgs[0];
    expect(endpoint).toBe(`/text-to-speech/${voiceId}`);
  });
});