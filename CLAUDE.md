# CLAUDE.md - Development Guidelines for saym

## Project Overview

saym (Say iMproved) is a CLI tool that extends the traditional `say` command with advanced text-to-speech capabilities using multiple TTS providers (ElevenLabs, Cartesia, and XTTS v2).

## Key Project Information

### Technology Stack
- **Runtime**: Node.js 18+ or Deno
- **Language**: TypeScript
- **APIs**: ElevenLabs, Cartesia, and XTTS v2 Text-to-Speech APIs
- **Audio Processing**: FFmpeg

### Project Structure
```
saym/
├── src/
│   ├── cli.ts              # CLI entry point and argument parsing
│   ├── providers/          # TTS provider implementations
│   │   ├── tts-provider.ts     # Provider interface
│   │   ├── elevenlabs-provider.ts # ElevenLabs integration
│   │   ├── cartesia-provider.ts   # Cartesia integration
│   │   ├── xtts-provider.ts      # XTTS v2 integration
│   │   └── provider-factory.ts    # Provider factory
│   ├── voice-manager.ts    # Voice model management
│   ├── audio.ts           # Audio playback and file handling
│   ├── config.ts          # Configuration management
│   └── types.ts           # TypeScript type definitions
├── docs/                   # Documentation
│   ├── XTTS_SETUP.md          # Complete XTTS v2 setup guide
│   └── XTTS_QUICKSTART.md     # 5-minute XTTS v2 quickstart
├── tests/
│   ├── unit/
│   └── integration/
├── package.json
├── tsconfig.json
├── README.md
├── SPECIFICATION.md
└── CLAUDE.md
```

## Development Commands

### Build and Run
```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run typecheck
```

### Testing
```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

## Coding Standards

### TypeScript Guidelines
- Use strict TypeScript configuration
- Define interfaces for all API responses
- Use enums for constants
- Implement proper error types
- Add JSDoc comments for public APIs

### Code Style
- Use ESLint with TypeScript plugin
- Follow Prettier formatting
- Use meaningful variable names
- Keep functions small and focused
- Implement proper error handling

### Error Handling Pattern
```typescript
try {
  const result = await apiCall();
  return result;
} catch (error) {
  if (error instanceof ElevenLabsError) {
    throw new VoiceEngineError(`Voice synthesis failed: ${error.message}`);
  }
  throw error;
}
```

## API Integration Notes

### ElevenLabs API
- Rate limiting: 100 requests/minute
- Always check for valid API key before requests
- Implement exponential backoff for retries
- Stream audio for large texts

### Cartesia API
- Ultra-low latency TTS (40-90ms)
- WebSocket streaming support
- Multiple audio formats supported
- Rate limiting varies by plan

### XTTS v2 API
- Self-hosted TTS server
- Supports multilingual synthesis
- Voice cloning capabilities
- Requires local or remote server instance
- Default server URL: http://localhost:8020


## Common Development Tasks

### Adding a New CLI Option
1. Update the CLI parser in `src/cli.ts`
2. Add the option to the TypeScript interface
3. Update the help text
4. Add validation if needed
5. Update tests and documentation

### Language Support Implementation
- **Language option**: `-l, --language` specifies target language code
- **ElevenLabs integration**: Automatically selects appropriate model based on language
- **Cartesia integration**: Passes language parameter (automatic detection fallback)
- **Model selection**: Non-English languages use `eleven_multilingual_v2` for ElevenLabs

### Implementing a New TTS Feature
1. Add the feature to the appropriate provider (e.g., `src/providers/elevenlabs-provider.ts`)
2. Update the provider API types
3. Add configuration options if needed
4. Update the CLI to expose the feature
5. Add unit and integration tests

### Adding a New TTS Provider
1. Create new provider implementation in `src/providers/`
2. Implement the TTSProvider interface
3. Add provider to ProviderFactory
4. Add configuration for API keys
5. Update provider selection logic
6. Add provider-specific tests


## Testing Guidelines

### Unit Tests
- Test each module in isolation
- Mock external API calls
- Test error scenarios
- Aim for >90% coverage

### Integration Tests
- Test full command execution
- Use test API keys when possible
- Test file I/O operations
- Verify audio output format

## Security Considerations

- Never commit API keys
- Use environment variables for secrets
- Validate all user inputs
- Sanitize file paths
- Implement rate limiting for API calls

## Performance Optimization

### Streaming
- Use streaming for large texts
- Implement chunked processing
- Progressive audio playback
- Memory-efficient file handling

## Debugging Tips

### Common Issues
1. **API Key Issues**: Check environment variable is set (ELEVENLABS_API_KEY, CARTESIA_API_KEY, or XTTS_API_KEY)
2. **Audio Playback**: Verify FFmpeg is installed
3. **Provider Selection**: Ensure correct provider is specified with -p flag
5. **XTTS Server**: Verify server is running at the configured URL (default: http://localhost:8020)
4. **Network Issues**: Implement proper timeout handling

### Debug Mode
```bash
# Enable verbose logging
DEBUG=saym:* saym "test"

# Log API requests
SAYM_LOG_LEVEL=debug saym "test"
```

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Run full test suite
4. Build and verify distribution
5. Tag release in git
6. Publish to npm/package manager

## Important Reminders

- Always validate user input before API calls
- Implement proper cleanup for temporary files
- Handle Ctrl+C gracefully during audio playback
- Provide clear error messages to users
- Keep API keys secure and never log them
- Test with various text lengths and languages
- Consider accessibility in audio output options