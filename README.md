# saym - Say iMproved

A powerful text-to-speech command-line tool that extends the traditional `say` command with advanced voice synthesis capabilities using ElevenLabs and Cartesia APIs. Create custom voice models from your own voice and speak in multiple languages with natural-sounding output.

## Live Demo (with Audio)

Here's a video example of saym in action with audio output:

[📹️ saym usage example (click to play with sound)](https://i.gyazo.com/319de9dd7df24aa583ea7972ffd50b3b.mp4)

This video demonstrates saym reading its own command description using ElevenLabs' high-quality voice synthesis engine. Turn on your audio to hear the synthesized speech!

## Features

- 🎤 **Custom Voice Modeling**: Train and use your own voice model through ElevenLabs and Cartesia
- 🌍 **Multi-language Support**: Speak text in various languages with automatic translation
- 🎯 **High-Quality Synthesis**: Leverage advanced AI voice synthesis from multiple providers
- 💬 **Simple CLI Interface**: Easy-to-use command-line interface similar to the native `say` command
- 🔊 **Audio Output Options**: Save to file or play directly through speakers
- 🎛️ **Voice Customization**: Adjust voice parameters like stability, similarity boost, and style
- 🔄 **Multiple Providers**: Support for both ElevenLabs and Cartesia TTS APIs

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/saym.git
cd saym

# Install dependencies
npm install

# Build the project
npm run build

# Set up your API keys (at least one is required)
export ELEVENLABS_API_KEY="your-elevenlabs-api-key"
export CARTESIA_API_KEY="your-cartesia-api-key"
```

### Running saym

#### Option 1: Use npm/node directly (Recommended for development)

```bash
# Run with npm
npm run dev "Hello world"

# Or run the built version
node dist/cli.js "Hello world"
```

#### Option 2: Install globally

```bash
# Install globally
npm install -g .

# Now you can use saym command
saym "Hello world"
```

#### Option 3: Create an alias

```bash
# Add to your ~/.zshrc or ~/.bashrc
alias saym="node /path/to/saym/dist/cli.js"

# Reload shell configuration
source ~/.zshrc

# Now you can use
saym "Hello world"
```

## Usage

### Basic Usage

Note: Replace `saym` with `node dist/cli.js` if you haven't installed globally.

```bash
# Speak text using default voice
saym "Hello, world!"
# Or: node dist/cli.js "Hello, world!"

# Use a specific voice model by ID or name
saym -v "voice-id-or-name" "This is my custom voice"

# Use Cartesia provider instead of default ElevenLabs
saym -p cartesia -v "694f9389-aac1-45b6-b726-9d9369183238" "Hello from Cartesia!"

# Read from file
saym -f input.txt

# Save output to file
saym -o output.mp3 "Save this speech to a file"

# Stream audio for real-time playback
saym -s "Stream this text as it's being synthesized"
```

### Voice Management

```bash
# List all available voices (default provider)
saym voice list

# List voices from a specific provider
saym voice list -p cartesia

# Create a custom voice model from audio samples
saym voice create -n "My Voice" -d "Personal voice model" -s sample1.mp3 sample2.wav sample3.m4a

# Delete a custom voice
saym voice delete <voice-id>
```

### Advanced Options

```bash
# Adjust voice parameters
saym --stability 0.8 --similarity 0.9 --style 0.2 "Fine-tuned voice output"

# Use different audio format
saym --format wav -o output.wav "Save as WAV file"

# Configuration management
saym config show                           # Show current configuration
saym config set defaultVoice <voice-id>    # Set default voice
saym config set ttsProvider cartesia       # Set default TTS provider
saym config reset                          # Reset to defaults

# List supported providers
saym providers
```

### Creating Your Own Voice Model

1. **Prepare Audio Samples**
   - Record at least 30 seconds of clear speech
   - Use high-quality recordings (minimal background noise)
   - Supported formats: MP3, WAV, M4A, OGG, FLAC
   - Maximum 25 files, 10MB per file

2. **Create Voice Model**
   ```bash
   saym voice create \
     --name "My Personal Voice" \
     --description "My custom voice for TTS" \
     --samples voice_sample_*.mp3
   ```

3. **Use Your Voice**
   ```bash
   # Use the voice ID returned from creation
   saym --voice <your-voice-id> "Hello, this is my voice!"
   
   # Or set as default
   saym config set defaultVoice <your-voice-id>
   saym "Now using my voice by default!"
   ```

## Configuration

Create a `.saymrc` file in your home directory for default settings:

```json
{
  "defaultVoice": "your-voice-id",
  "defaultLanguage": "en",
  "autoTranslate": true,
  "outputFormat": "mp3",
  "ttsProvider": "elevenlabs",
  "providers": {
    "elevenlabs": {
      "apiKey": "optional-if-not-in-env"
    },
    "cartesia": {
      "apiKey": "optional-if-not-in-env"
    }
  }
}
```

## Requirements

- Node.js 18+ or Deno
- At least one TTS provider API key:
  - ElevenLabs API account and API key, OR
  - Cartesia API account and API key
- FFmpeg (for audio format conversions)

## API Key Setup

You can use either ElevenLabs or Cartesia (or both). Here's how to set up each:

### ElevenLabs Setup

#### 1. Create an ElevenLabs Account

1. Visit [ElevenLabs](https://elevenlabs.io/) and click "Sign Up"
2. Create an account using email or Google/GitHub authentication
3. Choose a subscription plan (Free tier available with limited usage)

#### 2. Generate ElevenLabs API Key

1. Log in to your ElevenLabs dashboard
2. Click on your profile icon (top right) → "Profile + API Key"
3. In the API section, click "Generate API Key"
4. Copy the generated API key immediately (it won't be shown again)

### Cartesia Setup

#### 1. Create a Cartesia Account

1. Visit [Cartesia](https://cartesia.ai/) and sign up for access
2. Create an account and get API access
3. Cartesia offers ultra-low latency TTS with their Sonic models

#### 2. Generate Cartesia API Key

1. Log in to your Cartesia dashboard
2. Navigate to API keys section
3. Generate and copy your API key

### 3. Verify API Keys

Test your API key setup:

```bash
# Check if environment variables are set
echo $ELEVENLABS_API_KEY
echo $CARTESIA_API_KEY

# Test with saym (ElevenLabs)
saym voice list

# Test with saym (Cartesia)
saym voice list -p cartesia
```

## License

MIT License - see LICENSE file for details
