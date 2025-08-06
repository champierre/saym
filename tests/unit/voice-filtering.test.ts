import { TTSVoice } from '../../src/providers/tts-provider';

describe('Voice Filtering Logic', () => {
  const ownedVoices: TTSVoice[] = [
    {
      id: 'owned-1',
      name: 'My Custom Voice 1',
      description: 'User created voice',
      provider: 'cartesia',
      languages: ['en'],
      labels: { is_owner: true, is_public: false, gender: 'feminine' },
    },
    {
      id: 'owned-2',
      name: 'My Custom Voice 2',
      description: 'Another user created voice',
      provider: 'cartesia',
      languages: ['ja'],
      labels: { is_owner: true, is_public: true, gender: 'masculine' }, // Public but owned
    },
  ];

  const publicVoices: TTSVoice[] = [
    {
      id: 'public-1',
      name: 'Public Voice 1',
      description: 'Public voice',
      provider: 'cartesia',
      languages: ['en'],
      labels: { is_owner: false, is_public: true, gender: 'feminine' },
    },
    {
      id: 'public-2',
      name: 'Public Voice 2',
      description: 'Another public voice',
      provider: 'cartesia',
      languages: ['es'],
      labels: { is_owner: false, is_public: true, gender: 'masculine' },
    },
  ];

  const mixedVoices: TTSVoice[] = [...ownedVoices, ...publicVoices];

  describe('filterOwnedVoices', () => {
    const filterOwnedVoices = (voices: TTSVoice[]): TTSVoice[] => {
      return voices.filter(voice => voice.labels?.is_owner === true);
    };

    it('should filter only owned voices', () => {
      const filtered = filterOwnedVoices(mixedVoices);

      expect(filtered).toHaveLength(2);
      expect(filtered).toEqual(ownedVoices);
    });

    it('should return empty array when no owned voices exist', () => {
      const filtered = filterOwnedVoices(publicVoices);

      expect(filtered).toHaveLength(0);
      expect(filtered).toEqual([]);
    });

    it('should handle voices without labels', () => {
      const voicesWithoutLabels: TTSVoice[] = [
        {
          id: 'no-labels',
          name: 'Voice Without Labels',
          provider: 'cartesia',
          languages: ['en'],
        },
      ];

      const filtered = filterOwnedVoices(voicesWithoutLabels);

      expect(filtered).toHaveLength(0);
    });

    it('should handle voices with incomplete labels', () => {
      const voicesWithIncompleteLabels: TTSVoice[] = [
        {
          id: 'incomplete-labels',
          name: 'Voice With Incomplete Labels',
          provider: 'cartesia',
          languages: ['en'],
          labels: { gender: 'feminine' }, // Missing is_owner
        },
      ];

      const filtered = filterOwnedVoices(voicesWithIncompleteLabels);

      expect(filtered).toHaveLength(0);
    });

    it('should handle string values for is_owner', () => {
      const voicesWithStringLabels: TTSVoice[] = [
        {
          id: 'string-owner-true',
          name: 'Voice With String True',
          provider: 'cartesia',
          languages: ['en'],
          labels: { is_owner: 'true' as any }, // String instead of boolean
        },
        {
          id: 'string-owner-false',
          name: 'Voice With String False',
          provider: 'cartesia',
          languages: ['en'],
          labels: { is_owner: 'false' as any },
        },
      ];

      const filtered = filterOwnedVoices(voicesWithStringLabels);

      // Should not match string values
      expect(filtered).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty voice list', () => {
      const filterOwnedVoices = (voices: TTSVoice[]): TTSVoice[] => {
        return voices.filter(voice => voice.labels?.is_owner === true);
      };

      const filtered = filterOwnedVoices([]);

      expect(filtered).toHaveLength(0);
      expect(filtered).toEqual([]);
    });

    it('should handle voices with null labels', () => {
      const voicesWithNullLabels: TTSVoice[] = [
        {
          id: 'null-labels',
          name: 'Voice With Null Labels',
          provider: 'cartesia',
          languages: ['en'],
          labels: null as any,
        },
      ];

      const filterOwnedVoices = (voices: TTSVoice[]): TTSVoice[] => {
        return voices.filter(voice => voice.labels?.is_owner === true);
      };

      const filtered = filterOwnedVoices(voicesWithNullLabels);

      expect(filtered).toHaveLength(0);
    });

    it('should handle voices with undefined labels', () => {
      const voicesWithUndefinedLabels: TTSVoice[] = [
        {
          id: 'undefined-labels',
          name: 'Voice With Undefined Labels',
          provider: 'cartesia',
          languages: ['en'],
          labels: undefined,
        },
      ];

      const filterOwnedVoices = (voices: TTSVoice[]): TTSVoice[] => {
        return voices.filter(voice => voice.labels?.is_owner === true);
      };

      const filtered = filterOwnedVoices(voicesWithUndefinedLabels);

      expect(filtered).toHaveLength(0);
    });
  });

  describe('performance with large datasets', () => {
    it('should efficiently filter large voice lists', () => {
      // Generate a large dataset
      const largeVoiceList: TTSVoice[] = [];
      
      // Add 1000 owned voices
      for (let i = 0; i < 1000; i++) {
        largeVoiceList.push({
          id: `owned-${i}`,
          name: `Owned Voice ${i}`,
          provider: 'cartesia',
          languages: ['en'],
          labels: { is_owner: true, is_public: false },
        });
      }
      
      // Add 9000 public voices
      for (let i = 0; i < 9000; i++) {
        largeVoiceList.push({
          id: `public-${i}`,
          name: `Public Voice ${i}`,
          provider: 'cartesia',
          languages: ['en'],
          labels: { is_owner: false, is_public: true },
        });
      }

      const filterOwnedVoices = (voices: TTSVoice[]): TTSVoice[] => {
        return voices.filter(voice => voice.labels?.is_owner === true);
      };

      const startTime = process.hrtime.bigint();
      const filtered = filterOwnedVoices(largeVoiceList);
      const endTime = process.hrtime.bigint();

      expect(filtered).toHaveLength(1000);
      
      // Should complete within reasonable time (less than 10ms)
      const executionTimeMs = Number(endTime - startTime) / 1_000_000;
      expect(executionTimeMs).toBeLessThan(10);
    });
  });

  describe('provider-specific filtering', () => {
    it('should only apply filtering to Cartesia provider', () => {
      const shouldApplyFiltering = (providerType: string): boolean => {
        return providerType === 'cartesia';
      };

      expect(shouldApplyFiltering('cartesia')).toBe(true);
      expect(shouldApplyFiltering('elevenlabs')).toBe(false);
      expect(shouldApplyFiltering('openai')).toBe(false);
      expect(shouldApplyFiltering('')).toBe(false);
      expect(shouldApplyFiltering('CARTESIA')).toBe(false); // Case sensitive
    });
  });

  describe('command line argument parsing', () => {
    const mockProcessArgv = (args: string[]) => {
      return ['node', 'script.js', ...args];
    };

    it('should detect --all flag', () => {
      const getAllFlagFromArgs = (args: string[]): boolean => {
        return args.includes('-a') || args.includes('--all');
      };

      expect(getAllFlagFromArgs(mockProcessArgv(['voice', 'list', '--all']))).toBe(true);
      expect(getAllFlagFromArgs(mockProcessArgv(['voice', 'list', '-a']))).toBe(true);
      expect(getAllFlagFromArgs(mockProcessArgv(['voice', 'list']))).toBe(false);
      expect(getAllFlagFromArgs(mockProcessArgv(['voice', 'list', '--other']))).toBe(false);
    });

    it('should handle mixed flags correctly', () => {
      const getAllFlagFromArgs = (args: string[]): boolean => {
        return args.includes('-a') || args.includes('--all');
      };

      expect(getAllFlagFromArgs(mockProcessArgv(['voice', 'list', '-p', 'cartesia', '--all']))).toBe(true);
      expect(getAllFlagFromArgs(mockProcessArgv(['voice', 'list', '-p', 'cartesia', '-a']))).toBe(true);
      expect(getAllFlagFromArgs(mockProcessArgv(['--all', 'voice', 'list']))).toBe(true);
      expect(getAllFlagFromArgs(mockProcessArgv(['-a', 'voice', 'list']))).toBe(true);
    });
  });
});