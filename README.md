# saym - Say iMproved

A powerful text-to-speech command-line tool that extends the traditional `say` command with advanced voice synthesis capabilities using ElevenLabs, Cartesia, and XTTS v2 APIs. Create custom voice models from your own voice and speak in multiple languages with natural-sounding output.

## Live Demo (with Audio)

Here's a video example of saym in action with audio output:

[📹️ saym usage example (click to play with sound)](https://i.gyazo.com/319de9dd7df24aa583ea7972ffd50b3b.mp4)

This video demonstrates saym reading its own command description using ElevenLabs' high-quality voice synthesis engine. Turn on your audio to hear the synthesized speech!

## 📚 Documentation

- [📖 XTTS v2 Setup Guide](./docs/XTTS_SETUP.md) - Complete XTTS v2 installation and setup

## Features

- 🎯 **High-Quality Synthesis**: Leverage advanced AI voice synthesis from multiple providers
- 💬 **Simple CLI Interface**: Easy-to-use command-line interface similar to the native `say` command
- 🔊 **Audio Output Options**: Save to file or play directly through speakers
- 🎛️ **Voice Customization**: High-quality voice synthesis with provider-optimized settings
- 🔄 **Multiple Providers**: Support for ElevenLabs, Cartesia, and XTTS v2 TTS APIs

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
# For XTTS v2 (optional)
export XTTS_SERVER_URL="http://localhost:8020"  # Optional, defaults to localhost:8020
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

# Specify language for accurate pronunciation (important for non-English)
saym -v "voice-id" -l ja "今日は良い天気ですね"

# Use Cartesia provider instead of default ElevenLabs
saym -p cartesia -v "694f9389-aac1-45b6-b726-9d9369183238" "Hello from Cartesia!"

# Use XTTS v2 provider (requires XTTS server running)
saym -p xtts -v "voice.wav" "Hello from XTTS v2!"

# Read from file
saym -f input.txt

# Save output to file
saym -o output.mp3 "Save this speech to a file"

# Stream audio for real-time playback
saym -s "Stream this text as it's being synthesized"
```

### Voice Management

```bash
# List available voices for current provider (owned voices only)
saym voices

# List voices from a specific provider
saym voices -p cartesia
saym voices -p xtts

# List all public voices (including pre-made voices)
saym voices --all
```

### Language Support

```bash
# Japanese with ElevenLabs (recommended for accurate pronunciation)
saym -v "japanese-voice-id" -l ja "今日は良い天気ですね"

# Spanish with explicit language
saym -v "spanish-voice-id" -l es "Hola, ¿cómo estás?"

# Cartesia (automatic language detection)
saym -p cartesia -v "voice-id" "今日は"
```

### Advanced Options

```bash
# Use different audio format
saym --format wav -o output.wav "Save as WAV file"

# Configuration management
saym config show                        # Show current configuration
saym use elevenlabs                     # Switch to ElevenLabs (simple!)
saym use cartesia                       # Switch to Cartesia (simple!)
saym use xtts                          # Switch to XTTS v2 (simple!)
saym default-voice <voice-id>           # Set default voice for current provider
saym default-voice <voice-id> -p cartesia # Set default voice for specific provider

# Advanced configuration (for power users)
saym config provider elevenlabs         # Alternative way to set provider
saym config voice <voice-id>            # Alternative way to set voice
saym config reset                       # Reset to defaults

# List supported providers
saym providers
```

### Using Custom Voice Models

To create custom voice models, use the respective web interfaces:

- **ElevenLabs**: Visit [ElevenLabs Voice Lab](https://elevenlabs.io/voice-lab) to create and train custom voices
- **Cartesia**: Visit [Cartesia](https://cartesia.ai/) to access voice cloning features
- **XTTS v2**: Use your own voice samples (.wav files) directly with the XTTS server

Once you have created a custom voice through these services, you can use it with saym:

```bash
# Use your custom voice ID
saym --voice <your-voice-id> "Hello, this is my voice!"

# Or set as default (see Configuration section below for details)
saym config set-default-voice elevenlabs <your-voice-id>
saym "Now using my voice by default!"
```

## Configuration

Create a `.saymrc` file in your home directory for default settings:

```json
{
  "defaultVoice": "global-fallback-voice-id",
  "defaultLanguage": "en",
  "outputFormat": "mp3",
  "ttsProvider": "elevenlabs",
  "providers": {
    "elevenlabs": {
      "apiKey": "optional-if-not-in-env",
      "defaultVoice": "elevenlabs-specific-voice-id"
    },
    "cartesia": {
      "apiKey": "optional-if-not-in-env",
      "defaultVoice": "cartesia-specific-voice-id"
    },
    "xtts": {
      "apiKey": "optional-if-not-in-env",
      "serverUrl": "http://localhost:8020",
      "defaultVoice": "voice.wav"
    }
  }
}
```

### Setting Up Default Provider and Voices

saym uses a priority system for selecting voices:
1. **Command line voice** (`-v voice-id`) - highest priority
2. **Provider-specific default voice** - per-provider defaults
3. **Global default voice** - fallback for all providers

#### Step 1: Choose Your Default TTS Provider

```bash
# Set ElevenLabs as default (high quality, more expensive)
saym use elevenlabs

# Or set Cartesia as default (ultra-low latency, cost-effective)
saym use cartesia

# Or set XTTS v2 as default (self-hosted, no API costs)
saym use xtts
```

#### Step 2: Find Available Voices

```bash
# List voices for your default provider
saym voices

# List voices for a specific provider
saym voices -p elevenlabs
saym voices -p cartesia
saym voices -p xtts

# List ALL voices (including public ones)
saym voices --all
saym voices -p cartesia --all
```

#### Step 3: Set Provider-Specific Default Voices

```bash
# Set default voice for current provider
saym default-voice "21m00Tcm4TlvDq8ikWAM"

# Or set for specific provider
saym default-voice "694f9389-aac1-45b6-b726-9d9369183238" -p cartesia
saym default-voice "21m00Tcm4TlvDq8ikWAM" -p elevenlabs
saym default-voice "voice.wav" -p xtts

# Optional: Set global fallback voice (advanced)
saym config set defaultVoice "some-voice-id"
```

#### Step 4: Test Your Configuration

```bash
# Use default provider and its default voice
saym "Hello world"

# Use specific provider with its default voice
saym -p elevenlabs "Hello from ElevenLabs"
saym -p cartesia "Hello from Cartesia"

# Override with specific voice
saym -p elevenlabs -v "different-voice-id" "Hello with specific voice"
```

#### Step 5: View Your Configuration

```bash
# Show all current settings
saym config show

# Show supported providers
saym providers
```

### Quick Setup Examples

**For ElevenLabs users (super simple!):**
```bash
# 1. Switch to ElevenLabs
saym use elevenlabs

# 2. Find your preferred voice
saym voices

# 3. Set it as default
saym default-voice "your-voice-id"

# 4. Test
saym "This uses my ElevenLabs default voice"
```

**For Cartesia users (super simple!):**
```bash
# 1. Switch to Cartesia
saym use cartesia

# 2. Find your preferred voice (owned voices only by default)
saym voices

# 3. Set it as default
saym default-voice "your-voice-id"

# 4. Test
saym "This uses my Cartesia default voice"
```

**For XTTS v2 users (self-hosted):**
```bash
# 1. Switch to XTTS v2
saym use xtts

# 2. List available voice files
saym voices

# 3. Set your voice file as default
saym default-voice "voice.wav"

# 4. Test
saym "This uses my XTTS v2 voice"
```

**For users with both providers:**
```bash
# Set default provider
saym use cartesia

# Set default voices for both providers  
saym default-voice "cartesia-voice-id"              # For current (cartesia)
saym default-voice "elevenlabs-voice-id" -p elevenlabs  # For elevenlabs

# Now you can easily switch:
saym "Uses Cartesia (default provider)"
saym -p elevenlabs "Uses ElevenLabs with its default voice"
```

## Requirements

- Node.js 18+ or Deno
- At least one TTS provider:
  - ElevenLabs API account and API key, OR
  - Cartesia API account and API key, OR
  - XTTS v2 server running locally or remotely
- FFmpeg (for audio format conversions)

## API Key Setup

You can use ElevenLabs, Cartesia, or XTTS v2 (or all). Here's how to set up each:

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

### XTTS v2 Setup

XTTS v2 is a self-hosted TTS system with voice cloning capabilities.

Please follow the [📖 XTTS v2 Setup Guide](./docs/XTTS_SETUP.md) for complete installation and configuration instructions.

### 3. Verify API Keys

Test your API key setup:

```bash
# Check if environment variables are set
echo $ELEVENLABS_API_KEY
echo $CARTESIA_API_KEY
echo $XTTS_SERVER_URL

# Test with saym (ElevenLabs)
saym voices

# Test with saym (Cartesia)
saym voices -p cartesia

# Test with saym (XTTS v2)
saym voices -p xtts
```

## License

MIT License - see LICENSE file for details
