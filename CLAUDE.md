# CLAUDE.md - Development Guidelines for saym

## Project Overview

saym (Say iMproved) is a CLI tool that extends the traditional `say` command with ElevenLabs API integration for advanced text-to-speech capabilities, including custom voice modeling and multi-language support with translation.

## Key Project Information

### Technology Stack
- **Runtime**: Node.js 18+ or Deno
- **Language**: TypeScript
- **API**: ElevenLabs Text-to-Speech API
- **Audio Processing**: FFmpeg
- **Translation**: Google Translate API (primary), DeepL/OpenAI (optional)

### Project Structure
```
saym/
├── src/
│   ├── cli.ts              # CLI entry point and argument parsing
│   ├── voice-engine.ts     # ElevenLabs API integration
│   ├── translator.ts       # Translation module
│   ├── voice-manager.ts    # Voice model management
│   ├── audio.ts           # Audio playback and file handling
│   ├── config.ts          # Configuration management
│   └── types.ts           # TypeScript type definitions
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
- Cache voice list for performance
- Stream audio for large texts

### Translation APIs
- Support multiple providers via adapter pattern
- Cache translations to reduce API calls
- Implement language detection fallback
- Handle unsupported language pairs gracefully

## Common Development Tasks

### Adding a New CLI Option
1. Update the CLI parser in `src/cli.ts`
2. Add the option to the TypeScript interface
3. Update the help text
4. Add validation if needed
5. Update tests and documentation

### Implementing a New Voice Feature
1. Add the feature to `src/voice-engine.ts`
2. Update the ElevenLabs API types
3. Add configuration options if needed
4. Update the CLI to expose the feature
5. Add unit and integration tests

### Adding Translation Provider
1. Create new adapter in `src/translator.ts`
2. Implement the TranslationProvider interface
3. Add configuration for API keys
4. Update provider selection logic
5. Add provider-specific tests

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

### Caching Strategy
- Cache voice list (1 hour TTL)
- Cache synthesized audio (hash-based)
- Implement LRU eviction
- Make cache configurable

### Streaming
- Use streaming for large texts
- Implement chunked processing
- Progressive audio playback
- Memory-efficient file handling

## Debugging Tips

### Common Issues
1. **API Key Issues**: Check environment variable is set
2. **Audio Playback**: Verify FFmpeg is installed
3. **Translation Errors**: Check language codes are valid
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