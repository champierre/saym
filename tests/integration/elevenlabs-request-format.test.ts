/**
 * Integration test to verify ElevenLabs API request format
 * This test uses a network interceptor to capture actual HTTP requests
 * without making real API calls.
 */

import nock from 'nock';
import { ElevenLabsProvider } from '../../src/providers/elevenlabs-provider';

describe('ElevenLabs API Request Format Integration', () => {
  let provider: ElevenLabsProvider;
  const mockApiKey = 'sk_test123456789012345678901234567890123456789012';
  const baseUrl = 'https://api.elevenlabs.io';

  beforeEach(async () => {
    // Clear any existing interceptors
    nock.cleanAll();
    
    provider = new ElevenLabsProvider();
    await provider.initialize({ apiKey: mockApiKey });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test('should send HTTP request with correct format to ElevenLabs API', async () => {
    const voiceId = 'test-voice-id';
    const testText = 'Hello world';

    // Intercept the HTTP request and validate its format
    const scope = nock(baseUrl)
      .post(`/v1/text-to-speech/${voiceId}`)
      .matchHeader('xi-api-key', mockApiKey)
      .matchHeader('Content-Type', 'application/json')
      .reply(function(_uri, requestBody) {
        // Validate the request body
        const body = requestBody as any;
        expect(body.text).toBe(testText);
        expect(body.model_id).toBe('eleven_monolingual_v1');

        // Validate that problematic headers are NOT present
        expect(this.req.headers['accept']).not.toBe('audio/mpeg');
        
        // Return fake audio data
        return [200, Buffer.from('fake audio data'), {
          'Content-Type': 'audio/mpeg'
        }];
      });

    const result = await provider.textToSpeech(testText, voiceId);
    
    expect(scope.isDone()).toBe(true);
    expect(result).toBeInstanceOf(Buffer);
  });


  test('should handle different model IDs correctly', async () => {
    const voiceId = 'test-voice-id';
    const customModelId = 'eleven_turbo_v2';

    const scope = nock(baseUrl)
      .post(`/v1/text-to-speech/${voiceId}`)
      .reply(function(_uri, requestBody) {
        const body = requestBody as any;
        expect(body.model_id).toBe(customModelId);

        return [200, Buffer.from('fake audio data')];
      });

    await provider.textToSpeech('test', voiceId, {
      modelId: customModelId
    });
    
    expect(scope.isDone()).toBe(true);
  });

  test('should NOT include query parameters in URL', async () => {
    const voiceId = 'test-voice-id';

    // This will fail if any query parameters are added to the URL
    const scope = nock(baseUrl)
      .post(`/v1/text-to-speech/${voiceId}`) // Exact URL match, no query params
      .reply(200, Buffer.from('fake audio data'));

    await provider.textToSpeech('test', voiceId, {
      outputFormat: 'mp3' // This should NOT become a query parameter
    });
    
    expect(scope.isDone()).toBe(true);
  });

  test('should fail if problematic headers are added', async () => {
    // This test ensures that if someone accidentally adds the problematic
    // "Accept: audio/mpeg" header back, the test will catch it
    
    const voiceId = 'test-voice-id';

    const scope = nock(baseUrl)
      .post(`/v1/text-to-speech/${voiceId}`)
      .reply(function(_uri, _requestBody) {
        // If the Accept header is set to audio/mpeg, this should fail
        if (this.req.headers['accept'] === 'audio/mpeg') {
          return [403, { detail: { message: 'Invalid Accept header' } }];
        }
        return [200, Buffer.from('fake audio data')];
      });

    // This should succeed because we don't send the problematic header
    const result = await provider.textToSpeech('test', voiceId);
    expect(result).toBeInstanceOf(Buffer);
    expect(scope.isDone()).toBe(true);
  });
});