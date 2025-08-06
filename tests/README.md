# Test Documentation

## Overview

This directory contains comprehensive test suites for the `saym voice list` command functionality, including argument parsing, provider integration, and voice filtering features.

## Test Files

### 1. `unit/cli-voice-list.test.ts`

Tests the CLI argument parsing logic used in the voice list command.

**Features tested:**
- `getProviderFromArgs()` function parsing `-p` and `--provider` flags
- `getAllFlagFromArgs()` function parsing `-a` and `--all` flags
- Voice filtering logic for owned vs. all voices
- Edge cases with mixed arguments and missing values

### 2. `unit/cartesia-provider.test.ts`

Tests the CartesiaProvider implementation including API integration and data mapping.

**Features tested:**
- Provider initialization with API keys
- Voice listing from Cartesia API (`/voices/` endpoint)
- Voice data mapping from API response to `TTSVoice` format
- Error handling for API failures and network issues
- Output format parsing for MP3, WAV, and RAW formats
- Voice lookup by ID functionality

### 3. `unit/voice-filtering.test.ts`

Tests the voice filtering logic in detail.

**Features tested:**
- Filtering owned voices (`is_owner: true`) from mixed voice lists
- Handling edge cases (empty lists, missing labels, null values)
- Performance with large datasets (1000+ voices)
- Provider-specific filtering logic (Cartesia vs. others)
- Command line argument parsing for filtering options

### 4. `unit/voice-manager.test.ts`

Pre-existing test for ElevenLabs voice management (updated for compatibility).

## Test Commands

```bash
# Run all unit tests
npm run test:unit

# Run specific test file
npm test -- --testPathPattern=cli-voice-list.test.ts
npm test -- --testPathPattern=cartesia-provider.test.ts
npm test -- --testPathPattern=voice-filtering.test.ts

# Run tests with coverage
npm run test:coverage

# Run all tests
npm test
```

## Test Coverage

The tests cover the following `saym voice list` functionality:

✅ **Argument Parsing**
- Provider selection (`-p`, `--provider`)
- All flag detection (`-a`, `--all`)
- Mixed argument scenarios

✅ **Provider Integration** 
- Cartesia API calls and response handling
- Error handling for network/API failures
- Data mapping from API format to internal format

✅ **Voice Filtering**
- Default behavior: show only owned voices for Cartesia
- `--all` flag: show all voices including public ones
- No filtering for non-Cartesia providers
- Edge cases with missing or malformed data

✅ **Output Format Handling**
- MP3 format with bit_rate parameter
- WAV format with PCM encoding
- RAW format support
- Default format fallback

## Integration with CLI Commands

The tests verify the behavior that users experience with these commands:

```bash
# Default: owned voices only (tested)
saym voice list -p cartesia

# All voices including public (tested)  
saym voice list -p cartesia --all
saym voice list -p cartesia -a

# ElevenLabs (no filtering applied) (tested)
saym voice list -p elevenlabs
```

## Error Scenarios Tested

- Missing API keys
- Network connectivity issues
- Malformed API responses
- Invalid provider names
- Missing voice labels
- Large dataset performance

## Mock Strategy

Tests use Jest mocks for:
- Axios HTTP client and responses
- Provider factory dependency injection
- Configuration manager
- Environment variables (dotenv)

This ensures tests run quickly and reliably without external API dependencies.

## Adding New Tests

When adding new voice-related functionality:

1. Add unit tests for new logic in appropriate test file
2. Test both success and error scenarios  
3. Include edge cases and performance considerations
4. Update this documentation with new test coverage

## Known Limitations

- CLI integration tests use mocked dependencies rather than full E2E testing
- Real API calls are mocked to avoid external dependencies
- File system operations are not extensively tested

This provides comprehensive test coverage for the core voice listing functionality while maintaining fast, reliable test execution.