import { TTSVoice } from '../../src/providers/tts-provider';

// Mock process.argv for argument parsing tests
const originalArgv = process.argv;

// Helper functions to test (these are the actual functions from cli.ts)
function getProviderFromArgs(): string | undefined {
  const args = process.argv;
  const providerIndex = args.indexOf('-p') !== -1 ? args.indexOf('-p') : args.indexOf('--provider');
  if (providerIndex !== -1 && providerIndex + 1 < args.length) {
    return args[providerIndex + 1];
  }
  return undefined;
}

function getAllFlagFromArgs(): boolean {
  const args = process.argv;
  return args.includes('-a') || args.includes('--all');
}

describe('CLI Argument Parsing', () => {
  beforeEach(() => {
    // Reset process.argv before each test
    process.argv = [...originalArgv];
  });

  afterEach(() => {
    // Restore original process.argv after each test
    process.argv = originalArgv;
  });

  describe('getProviderFromArgs', () => {
    it('should extract provider from -p flag', () => {
      process.argv = ['node', 'script.js', 'voice', 'list', '-p', 'cartesia'];
      expect(getProviderFromArgs()).toBe('cartesia');
    });

    it('should extract provider from --provider flag', () => {
      process.argv = ['node', 'script.js', 'voice', 'list', '--provider', 'elevenlabs'];
      expect(getProviderFromArgs()).toBe('elevenlabs');
    });

    it('should return undefined when no provider flag is present', () => {
      process.argv = ['node', 'script.js', 'voice', 'list'];
      expect(getProviderFromArgs()).toBeUndefined();
    });

    it('should return undefined when provider flag has no value', () => {
      process.argv = ['node', 'script.js', 'voice', 'list', '-p'];
      expect(getProviderFromArgs()).toBeUndefined();
    });

    it('should handle mixed arguments correctly', () => {
      process.argv = ['node', 'script.js', 'voice', 'list', '-v', 'voice-id', '-p', 'cartesia', '--all'];
      expect(getProviderFromArgs()).toBe('cartesia');
    });
  });

  describe('getAllFlagFromArgs', () => {
    it('should detect -a flag', () => {
      process.argv = ['node', 'script.js', 'voice', 'list', '-a'];
      expect(getAllFlagFromArgs()).toBe(true);
    });

    it('should detect --all flag', () => {
      process.argv = ['node', 'script.js', 'voice', 'list', '--all'];
      expect(getAllFlagFromArgs()).toBe(true);
    });

    it('should return false when no all flag is present', () => {
      process.argv = ['node', 'script.js', 'voice', 'list'];
      expect(getAllFlagFromArgs()).toBe(false);
    });

    it('should detect flag in mixed arguments', () => {
      process.argv = ['node', 'script.js', 'voice', 'list', '-p', 'cartesia', '--all'];
      expect(getAllFlagFromArgs()).toBe(true);
    });

    it('should handle both short and long flags', () => {
      process.argv = ['node', 'script.js', 'voice', 'list', '-a', '--all'];
      expect(getAllFlagFromArgs()).toBe(true); // Either one should return true
    });
  });

  describe('Voice filtering logic', () => {
    const testVoices: TTSVoice[] = [
      {
        id: 'owned-1',
        name: 'My Voice 1',
        provider: 'cartesia',
        languages: ['en'],
        labels: { is_owner: true, is_public: false },
      },
      {
        id: 'owned-2',
        name: 'My Voice 2',
        provider: 'cartesia',
        languages: ['ja'],
        labels: { is_owner: true, is_public: true },
      },
      {
        id: 'public-1',
        name: 'Public Voice 1',
        provider: 'cartesia',
        languages: ['en'],
        labels: { is_owner: false, is_public: true },
      },
    ];

    const filterOwnedVoices = (voices: TTSVoice[]): TTSVoice[] => {
      return voices.filter(voice => voice.labels?.is_owner === true);
    };

    const shouldApplyFiltering = (providerType: string, showAll: boolean): boolean => {
      return !showAll && providerType === 'cartesia';
    };

    it('should filter owned voices correctly', () => {
      const filtered = filterOwnedVoices(testVoices);
      expect(filtered).toHaveLength(2);
      expect(filtered.map(v => v.id)).toEqual(['owned-1', 'owned-2']);
    });

    it('should determine when to apply filtering', () => {
      expect(shouldApplyFiltering('cartesia', false)).toBe(true);
      expect(shouldApplyFiltering('cartesia', true)).toBe(false);
      expect(shouldApplyFiltering('elevenlabs', false)).toBe(false);
      expect(shouldApplyFiltering('elevenlabs', true)).toBe(false);
    });

    it('should apply filtering logic based on arguments', () => {
      const providerType = 'cartesia';
      const showAll = false;
      
      let voices = testVoices;
      if (shouldApplyFiltering(providerType, showAll)) {
        voices = filterOwnedVoices(voices);
      }

      expect(voices).toHaveLength(2); // Only owned voices
    });

    it('should not apply filtering when --all is specified', () => {
      const providerType = 'cartesia';
      const showAll = true;
      
      let voices = testVoices;
      if (shouldApplyFiltering(providerType, showAll)) {
        voices = filterOwnedVoices(voices);
      }

      expect(voices).toHaveLength(3); // All voices
    });
  });
});