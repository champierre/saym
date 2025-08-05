#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs';
import dotenv from 'dotenv';
import { VoiceEngine } from './voice-engine';
import { VoiceManager } from './voice-manager';
import { AudioPlayer } from './audio';
import { ConfigManager } from './config';
import { VoiceSettings } from './types';

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
  .option('--format <format>', 'Audio format (mp3, wav, ogg)', 'mp3')
  .option('--stability <value>', 'Voice stability (0.0-1.0)', parseFloat, 0.5)
  .option('--similarity <value>', 'Similarity boost (0.0-1.0)', parseFloat, 0.75)
  .option('--style <value>', 'Style exaggeration (0.0-1.0)', parseFloat, 0.0)
  .option('--speaker-boost', 'Enable speaker boost', true)
  .option('-s, --stream', 'Stream audio playback', false)
  .action(async (text, options) => {
    try {
      const apiKey = config.getApiKey();
      if (!apiKey) {
        console.error('Error: ELEVENLABS_API_KEY environment variable is not set');
        process.exit(1);
      }

      const engine = new VoiceEngine(apiKey);
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
        console.error('Error: No voice specified. Use --voice option or set default voice.');
        process.exit(1);
      }

      // If voice looks like a name instead of ID, try to find it
      // Voice IDs are typically long alphanumeric strings, names are shorter and readable
      if (voiceId.length < 15 && !/^[A-Za-z0-9]{15,}$/.test(voiceId)) {
        const voiceManager = new VoiceManager(apiKey);
        const voices = await voiceManager.listVoices();
        const voice = voices.find(v => v.name.toLowerCase() === voiceId.toLowerCase());
        if (voice) {
          voiceId = voice.voice_id;
        } else {
          console.error(`Error: Voice "${voiceId}" not found.`);
          process.exit(1);
        }
      }

      // Prepare voice settings
      const voiceSettings: VoiceSettings = {
        stability: options.stability,
        similarity_boost: options.similarity,
        style: options.style,
        use_speaker_boost: options.speakerBoost,
      };

      console.log(`Speaking with voice: ${voiceId}`);

      if (options.stream) {
        // Stream mode
        const stream = await engine.textToSpeechStream(inputText, voiceId, { voiceSettings });
        
        if (options.output) {
          await engine.saveStreamToFile(stream, options.output);
          console.log(`Audio saved to: ${options.output}`);
        } else {
          await audioPlayer.playStream(stream, options.format);
        }
      } else {
        // Buffer mode
        const audio = await engine.textToSpeech(inputText, voiceId, { voiceSettings });
        
        if (options.output) {
          await engine.saveAudioToFile(audio, options.output);
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
  .action(async () => {
    try {
      const apiKey = config.getApiKey();
      if (!apiKey) {
        console.error('Error: ELEVENLABS_API_KEY environment variable is not set');
        process.exit(1);
      }

      const voiceManager = new VoiceManager(apiKey);
      const voices = await voiceManager.listVoices();

      console.log('Available voices:');
      console.log('─'.repeat(80));
      
      voices.forEach(voice => {
        console.log(`ID: ${voice.voice_id}`);
        console.log(`Name: ${voice.name}`);
        if (voice.category) console.log(`Category: ${voice.category}`);
        if (voice.description) console.log(`Description: ${voice.description}`);
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

// Create custom voice
voice
  .command('create')
  .description('Create a custom voice model from audio samples')
  .requiredOption('-n, --name <name>', 'Voice name')
  .option('-d, --description <description>', 'Voice description')
  .option('-s, --samples <files...>', 'Audio sample files (mp3, wav, m4a, ogg, flac)')
  .option('-l, --labels <labels>', 'Voice labels as JSON string')
  .action(async (options) => {
    try {
      const apiKey = config.getApiKey();
      if (!apiKey) {
        console.error('Error: ELEVENLABS_API_KEY environment variable is not set');
        process.exit(1);
      }

      if (!options.samples || options.samples.length === 0) {
        console.error('Error: At least one audio sample is required');
        process.exit(1);
      }

      const voiceManager = new VoiceManager(apiKey);
      
      console.log('Creating custom voice model...');
      console.log(`Name: ${options.name}`);
      console.log(`Samples: ${options.samples.length} files`);

      const labels = options.labels ? JSON.parse(options.labels) : undefined;
      
      const voiceId = await voiceManager.createVoiceFromFiles(
        options.name,
        options.samples,
        options.description,
        labels
      );

      console.log('Voice created successfully!');
      console.log(`Voice ID: ${voiceId}`);
      console.log(`\nYou can now use this voice with: saym --voice ${voiceId} "Your text"`);
      
      // Ask if user wants to set as default
      console.log('\nTip: Set as default voice with: saym config set defaultVoice ' + voiceId);
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

// Delete voice
voice
  .command('delete <voiceId>')
  .description('Delete a custom voice')
  .action(async (voiceId) => {
    try {
      const apiKey = config.getApiKey();
      if (!apiKey) {
        console.error('Error: ELEVENLABS_API_KEY environment variable is not set');
        process.exit(1);
      }

      const voiceManager = new VoiceManager(apiKey);
      
      console.log(`Deleting voice: ${voiceId}`);
      await voiceManager.deleteVoice(voiceId);
      
      console.log('Voice deleted successfully!');
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

// Configuration commands
const configCmd = program.command('config').description('Configuration management');

configCmd
  .command('show')
  .description('Show current configuration')
  .action(() => {
    const allConfig = config.getAll();
    console.log('Current configuration:');
    console.log(JSON.stringify(allConfig, null, 2));
  });

configCmd
  .command('set <key> <value>')
  .description('Set configuration value')
  .action((key, value) => {
    try {
      // Parse value if it's JSON
      let parsedValue: any = value;
      if (value.startsWith('{') || value.startsWith('[')) {
        parsedValue = JSON.parse(value);
      } else if (value === 'true') {
        parsedValue = true;
      } else if (value === 'false') {
        parsedValue = false;
      } else if (!isNaN(Number(value))) {
        parsedValue = Number(value);
      }

      config.set(key as any, parsedValue);
      console.log(`Set ${key} = ${JSON.stringify(parsedValue)}`);
    } catch (error) {
      console.error('Error setting configuration:', error);
      process.exit(1);
    }
  });

configCmd
  .command('reset')
  .description('Reset configuration to defaults')
  .action(() => {
    config.reset();
    console.log('Configuration reset to defaults');
  });

// Parse command line arguments
program.parse(process.argv);