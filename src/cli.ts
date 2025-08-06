#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs';
import dotenv from 'dotenv';
import { AudioPlayer } from './audio';
import { ConfigManager } from './config';
import { TTSVoiceSettings } from './providers/tts-provider';
import { ProviderFactory, ProviderType } from './providers/provider-factory';

dotenv.config();

const program = new Command();
const config = new ConfigManager();

// Helper function to parse provider from command line args due to Commander.js subcommand option issues
function getProviderFromArgs(): string | undefined {
  const args = process.argv;
  const providerIndex = args.indexOf('-p') !== -1 ? args.indexOf('-p') : args.indexOf('--provider');
  if (providerIndex !== -1 && providerIndex + 1 < args.length) {
    return args[providerIndex + 1];
  }
  return undefined;
}

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
  .option('-p, --provider <provider>', 'TTS provider (elevenlabs, cartesia)', 'elevenlabs')
  .option('--format <format>', 'Audio format (mp3, wav, ogg)', 'mp3')
  .option('--stability <value>', 'Voice stability (0.0-1.0)', parseFloat, 0.5)
  .option('--similarity <value>', 'Similarity boost (0.0-1.0)', parseFloat, 0.75)
  .option('--style <value>', 'Style exaggeration (0.0-1.0)', parseFloat, 0.0)
  .option('--speaker-boost', 'Enable speaker boost', true)
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

      // Get voice ID
      let voiceId = options.voice || config.get('defaultVoice');
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

      // Prepare voice settings
      const voiceSettings: TTSVoiceSettings = {
        stability: options.stability,
        similarity: options.similarity,
        style: options.style,
        speakerBoost: options.speakerBoost,
      };

      console.log(`Speaking with ${providerType} voice: ${voiceId}`);

      if (options.stream) {
        // Stream mode
        const stream = await provider.textToSpeechStream(inputText, voiceId, { 
          voiceSettings, 
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
          voiceSettings, 
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

// Voice management commands
const voice = program.command('voice').description('Voice management commands');

// List voices
voice
  .command('list')
  .description('List all available voices')
  .option('-p, --provider <provider>', 'TTS provider (elevenlabs, cartesia)')
  .action(async () => {
    try {
      const providerType = (getProviderFromArgs() || config.get('ttsProvider') || 'elevenlabs') as ProviderType;
      const apiKey = config.getApiKey(providerType);
      
      if (!apiKey) {
        console.error(`Error: API key for ${providerType} is not set. Set ${providerType.toUpperCase()}_API_KEY environment variable.`);
        process.exit(1);
      }

      const provider = await ProviderFactory.createProvider(providerType, { apiKey });
      const voices = await provider.listVoices();

      console.log(`Available voices for ${providerType}:`);
      console.log('─'.repeat(80));
      
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
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

// Create voice (only for providers that support it)
voice
  .command('create')
  .description('Create a custom voice model from audio samples')
  .requiredOption('-n, --name <name>', 'Voice name')
  .option('-d, --description <description>', 'Voice description')
  .option('-s, --samples <files...>', 'Audio sample files')
  .option('-p, --provider <provider>', 'TTS provider (elevenlabs, cartesia)')
  .action(async () => {
    try {
      const providerType = (getProviderFromArgs() || config.get('ttsProvider') || 'elevenlabs') as ProviderType;
      const apiKey = config.getApiKey(providerType);
      
      if (!apiKey) {
        console.error(`Error: API key for ${providerType} is not set.`);
        process.exit(1);
      }

      const provider = await ProviderFactory.createProvider(providerType, { apiKey });
      
      if (!provider.supportsVoiceCloning()) {
        console.error(`Error: ${providerType} does not support voice cloning.`);
        process.exit(1);
      }

      if (!provider.createVoice) {
        console.error(`Error: Voice creation not implemented for ${providerType}.`);
        process.exit(1);
      }

      // Parse command line arguments for create command options
      const args = process.argv;
      const nameIndex = args.indexOf('-n') !== -1 ? args.indexOf('-n') : args.indexOf('--name');
      const name = nameIndex !== -1 && nameIndex + 1 < args.length ? args[nameIndex + 1] : undefined;
      
      const descIndex = args.indexOf('-d') !== -1 ? args.indexOf('-d') : args.indexOf('--description');
      const description = descIndex !== -1 && descIndex + 1 < args.length ? args[descIndex + 1] : undefined;
      
      const samplesIndex = args.indexOf('-s') !== -1 ? args.indexOf('-s') : args.indexOf('--samples');
      let samples: string[] = [];
      if (samplesIndex !== -1) {
        // Collect all arguments after --samples until the next option
        for (let i = samplesIndex + 1; i < args.length; i++) {
          if (args[i].startsWith('-')) break;
          samples.push(args[i]);
        }
      }

      if (!name) {
        console.error('Error: Voice name is required. Use -n or --name option.');
        process.exit(1);
      }

      if (!samples || samples.length === 0) {
        console.error('Error: At least one audio sample file is required.');
        process.exit(1);
      }

      // Read audio samples
      const sampleBuffers: Buffer[] = [];
      for (const filePath of samples) {
        if (!fs.existsSync(filePath)) {
          console.error(`Error: Audio file not found: ${filePath}`);
          process.exit(1);
        }
        sampleBuffers.push(fs.readFileSync(filePath));
      }

      console.log(`Creating voice "${name}" with ${sampleBuffers.length} samples...`);
      const voiceId = await provider.createVoice(name, sampleBuffers, description);
      
      console.log(`Voice created successfully!`);
      console.log(`Voice ID: ${voiceId}`);
      console.log(`You can now use this voice with: saym -v ${voiceId} "Your text"`);
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

// Delete voice
voice
  .command('delete <voiceId>')
  .description('Delete a custom voice')
  .option('-p, --provider <provider>', 'TTS provider (elevenlabs, cartesia)')
  .action(async (voiceId) => {
    try {
      const providerType = (getProviderFromArgs() || config.get('ttsProvider') || 'elevenlabs') as ProviderType;
      const apiKey = config.getApiKey(providerType);
      
      if (!apiKey) {
        console.error(`Error: API key for ${providerType} is not set.`);
        process.exit(1);
      }

      const provider = await ProviderFactory.createProvider(providerType, { apiKey });
      
      if (!provider.deleteVoice) {
        console.error(`Error: Voice deletion not supported for ${providerType}.`);
        process.exit(1);
      }

      await provider.deleteVoice(voiceId);
      console.log(`Voice ${voiceId} deleted successfully.`);
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
      
      config.set(key as any, value);
      console.log(`Configuration updated: ${key} = ${value}`);
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

program.parse();