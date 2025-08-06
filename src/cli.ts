#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs';
import dotenv from 'dotenv';
import { AudioPlayer } from './audio';
import { ConfigManager } from './config';
import { ProviderFactory, ProviderType } from './providers/provider-factory';

dotenv.config();

const program = new Command();
const config = new ConfigManager();

program
  .name('saym')
  .description('Say iMproved - Advanced text-to-speech with custom voice models')
  .version('1.0.0');

// Main text-to-speech command
program
  .argument('[text]', 'Text to speak')
  .option('-v, --voice <voice>', 'Voice ID or name')
  .option('-f, --file <file>', 'Input text file')
  .option('-o, --output <file>', 'Output audio file')
  .option('-p, --provider <provider>', 'TTS provider (elevenlabs, cartesia)')
  .option('--format <format>', 'Audio format (mp3, wav, ogg)', 'mp3')
  .option('-s, --stream', 'Stream audio playback', false)
  .action(async (text, options) => {
    try {
      // Determine provider
      const providerType = (options.provider || config.get('ttsProvider') || 'elevenlabs') as ProviderType;
      
      // Get API key for the selected provider
      const apiKey = config.getApiKey(providerType);
      if (!apiKey) {
        console.error(`Error: API key for ${providerType} is not set. Set ${providerType.toUpperCase()}_API_KEY environment variable.`);
        process.exit(1);
      }

      // Create provider instance
      const provider = await ProviderFactory.createProvider(providerType, { apiKey });
      const audioPlayer = new AudioPlayer();

      // Get text input
      let inputText = text;
      if (options.file) {
        inputText = fs.readFileSync(options.file, 'utf-8');
      } else if (!inputText) {
        console.error('Error: No text provided. Use text argument or -f option.');
        process.exit(1);
      }

      // Get voice ID - check provider-specific default first
      let voiceId = options.voice || config.getDefaultVoice(providerType);
      if (!voiceId) {
        // If no voice specified, list available voices and suggest using one
        const voices = await provider.listVoices();
        if (voices.length > 0) {
          console.error(`Error: No voice specified. Available voices for ${providerType}:`);
          voices.forEach(v => console.error(`  - ${v.id}: ${v.name}`));
          console.error('\nUse --voice option or set default voice in config.');
        } else {
          console.error('Error: No voice specified and no voices available.');
        }
        process.exit(1);
      }

      // If voice looks like a name instead of ID, try to find it
      if (voiceId.length < 15 && !/^[A-Za-z0-9-]{15,}$/.test(voiceId)) {
        const voices = await provider.listVoices();
        const voice = voices.find(v => v.name.toLowerCase() === voiceId.toLowerCase());
        if (voice) {
          voiceId = voice.id;
        } else {
          console.error(`Error: Voice "${voiceId}" not found.`);
          process.exit(1);
        }
      }

      console.log(`Speaking with ${providerType} voice: ${voiceId}`);

      if (options.stream) {
        // Stream mode
        const stream = await provider.textToSpeechStream(inputText, voiceId, { 
          outputFormat: options.format 
        });
        
        if (options.output) {
          // Save stream to file
          const { pipeline } = await import('stream/promises');
          const writeStream = fs.createWriteStream(options.output);
          await pipeline(stream, writeStream);
          console.log(`Audio saved to: ${options.output}`);
        } else {
          await audioPlayer.playStream(stream, options.format);
        }
      } else {
        // Buffer mode
        const audio = await provider.textToSpeech(inputText, voiceId, { 
          outputFormat: options.format 
        });
        
        if (options.output) {
          fs.writeFileSync(options.output, audio);
          console.log(`Audio saved to: ${options.output}`);
        } else {
          await audioPlayer.playAudio(audio, options.format);
        }
      }

      await audioPlayer.cleanup();
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

// List voices command (top-level for simplicity)
program
  .command('voices')
  .description('List available voices for current provider (defaults to owned voices only)')
  .option('-p, --provider <provider>', 'TTS provider (elevenlabs, cartesia)')
  .option('-a, --all', 'Show all voices including public ones')
  .action(async (options) => {
    try {
      // Use current provider if no provider specified
      const currentProvider = config.get('ttsProvider') || 'elevenlabs';
      const providerType = (options.provider || currentProvider) as ProviderType;
      const apiKey = config.getApiKey(providerType);
      
      if (!apiKey) {
        console.error(`Error: API key for ${providerType} is not set. Set ${providerType.toUpperCase()}_API_KEY environment variable.`);
        process.exit(1);
      }

      console.log(`Current provider: ${currentProvider}`);
      const defaultVoice = config.getDefaultVoice(currentProvider as 'elevenlabs' | 'cartesia');
      if (defaultVoice) {
        console.log(`Default voice: ${defaultVoice}`);
      } else {
        console.log('No default voice set');
      }
      console.log(''); // Empty line for spacing

      const provider = await ProviderFactory.createProvider(providerType, { apiKey });
      const allVoices = await provider.listVoices();
      
      // Filter voices based on the --all flag
      let voices = allVoices;
      if (!options.all) {
        // Default to showing only owned/custom voices for both providers
        if (providerType === 'cartesia') {
          voices = allVoices.filter(voice => voice.labels?.is_owner === true);
        } else if (providerType === 'elevenlabs') {
          // For ElevenLabs, filter to show only cloned voices (user-created)
          voices = allVoices.filter(voice => voice.labels?.category === 'cloned');
        }
      }

      console.log(`Available voices for ${providerType}${options.all ? ' (all)' : ' (owned only)'}:`);
      if (!options.all) {
        console.log('Use --all or -a to show all public voices');
      }
      console.log('─'.repeat(80));
      
      if (voices.length === 0) {
        console.log('No voices found.');
        if (!options.all) {
          console.log('Try using --all to see public voices.');
        }
      } else {
        voices.forEach(voice => {
          console.log(`ID: ${voice.id}`);
          console.log(`Name: ${voice.name}`);
          if (voice.description) console.log(`Description: ${voice.description}`);
          if (voice.languages && voice.languages.length > 0) {
            console.log(`Languages: ${voice.languages.join(', ')}`);
          }
          if (voice.labels && Object.keys(voice.labels).length > 0) {
            console.log(`Labels: ${JSON.stringify(voice.labels)}`);
          }
          console.log('─'.repeat(80));
        });
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });


// Configuration commands
const configCommand = program.command('config').description('Configuration management');

configCommand
  .command('show')
  .description('Show current configuration')
  .action(() => {
    const allConfig = config.getAll();
    console.log('Current configuration:');
    console.log(JSON.stringify(allConfig, null, 2));
  });

configCommand
  .command('set <key> <value>')
  .description('Set configuration value')
  .action((key, value) => {
    try {
      // Handle special cases for nested properties
      if (key === 'ttsProvider' && !['elevenlabs', 'cartesia'].includes(value)) {
        console.error('Error: Invalid provider. Choose from: elevenlabs, cartesia');
        process.exit(1);
      }
      
      // Handle provider-specific default voice setting
      if (key.includes('DefaultVoice')) {
        const match = key.match(/^(elevenlabs|cartesia)DefaultVoice$/);
        if (match) {
          const provider = match[1] as 'elevenlabs' | 'cartesia';
          config.setProviderDefaultVoice(provider, value);
          console.log(`Configuration updated: ${provider} default voice = ${value}`);
          return;
        }
      }
      
      config.set(key as any, value);
      console.log(`Configuration updated: ${key} = ${value}`);
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

// Simplified commands for common operations
configCommand
  .command('provider <provider>')
  .description('Set default TTS provider (elevenlabs|cartesia)')
  .action((provider) => {
    try {
      if (!['elevenlabs', 'cartesia'].includes(provider)) {
        console.error('Error: Invalid provider. Choose from: elevenlabs, cartesia');
        process.exit(1);
      }
      
      config.set('ttsProvider' as any, provider);
      console.log(`Default provider set to: ${provider}`);
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

configCommand
  .command('voice <voice-id>')
  .description('Set default voice for current provider')
  .option('-p, --provider <provider>', 'Set voice for specific provider (elevenlabs|cartesia)')
  .action((voiceId, options) => {
    try {
      const provider = options.provider || config.get('ttsProvider') || 'elevenlabs';
      
      if (options.provider && !['elevenlabs', 'cartesia'].includes(options.provider)) {
        console.error('Error: Invalid provider. Choose from: elevenlabs, cartesia');
        process.exit(1);
      }
      
      config.setProviderDefaultVoice(provider as 'elevenlabs' | 'cartesia', voiceId);
      console.log(`Default voice for ${provider} set to: ${voiceId}`);
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

// Keep the original detailed command for advanced users
configCommand
  .command('set-default-voice <provider> <voice-id>')
  .description('Set default voice for a specific provider (elevenlabs|cartesia)')
  .action((provider, voiceId) => {
    try {
      if (!['elevenlabs', 'cartesia'].includes(provider)) {
        console.error('Error: Invalid provider. Choose from: elevenlabs, cartesia');
        process.exit(1);
      }
      
      config.setProviderDefaultVoice(provider as 'elevenlabs' | 'cartesia', voiceId);
      console.log(`Default voice for ${provider} set to: ${voiceId}`);
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

configCommand
  .command('reset')
  .description('Reset configuration to defaults')
  .action(() => {
    config.reset();
    console.log('Configuration reset to defaults.');
  });

// Provider info command
program
  .command('providers')
  .description('List supported TTS providers')
  .action(() => {
    const providers = ProviderFactory.getSupportedProviders();
    console.log('Supported TTS providers:');
    providers.forEach(p => {
      const current = config.get('ttsProvider') === p ? ' (current)' : '';
      console.log(`  - ${p}${current}`);
    });
  });

// Quick setup commands (top-level for ease of use)
program
  .command('use [provider]')
  .description('Switch to a provider (elevenlabs|cartesia) or show current provider')
  .action((provider) => {
    try {
      if (!provider) {
        // Show current provider if no provider specified
        const currentProvider = config.get('ttsProvider') || 'elevenlabs';
        console.log(`Current provider: ${currentProvider}`);
        
        const defaultVoice = config.getDefaultVoice(currentProvider as 'elevenlabs' | 'cartesia');
        if (defaultVoice) {
          console.log(`Default voice for ${currentProvider}: ${defaultVoice}`);
        } else {
          console.log(`No default voice set for ${currentProvider}`);
        }
        return;
      }
      
      if (!['elevenlabs', 'cartesia'].includes(provider)) {
        console.error('Error: Invalid provider. Choose from: elevenlabs, cartesia');
        process.exit(1);
      }
      
      config.set('ttsProvider' as any, provider);
      console.log(`Now using ${provider} as default provider`);
      
      // Show current default voice for this provider if any
      const defaultVoice = config.getDefaultVoice(provider as 'elevenlabs' | 'cartesia');
      if (defaultVoice) {
        console.log(`Default voice for ${provider}: ${defaultVoice}`);
      } else {
        console.log(`No default voice set for ${provider}. Use 'saym default-voice <voice-id>' to set one.`);
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

program
  .command('default-voice <voice-id>')
  .description('Set default voice for current provider')
  .option('-p, --provider <provider>', 'Set for specific provider')
  .action((voiceId, options) => {
    try {
      const provider = options.provider || config.get('ttsProvider') || 'elevenlabs';
      
      if (options.provider && !['elevenlabs', 'cartesia'].includes(options.provider)) {
        console.error('Error: Invalid provider. Choose from: elevenlabs, cartesia');
        process.exit(1);
      }
      
      config.setProviderDefaultVoice(provider as 'elevenlabs' | 'cartesia', voiceId);
      console.log(`✅ Default voice for ${provider} set to: ${voiceId}`);
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

program.parse();