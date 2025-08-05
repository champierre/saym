# saym - Say iMproved

A powerful text-to-speech command-line tool that extends the traditional `say` command with advanced voice synthesis capabilities using ElevenLabs API. Create custom voice models from your own voice and speak in multiple languages with natural-sounding output.

## Live Demo

Here's an example of saym in action:

![saym usage example](https://gyazo.com/b8b46d3b777ec97618d920183a1889fa)

This example shows saym reading its own command description using ElevenLabs' high-quality voice synthesis engine.

## Features

- 🎤 **Custom Voice Modeling**: Train and use your own voice model through ElevenLabs
- 🌍 **Multi-language Support**: Speak text in various languages with automatic translation
- 🎯 **High-Quality Synthesis**: Leverage ElevenLabs' advanced AI voice synthesis
- 💬 **Simple CLI Interface**: Easy-to-use command-line interface similar to the native `say` command
- 🔊 **Audio Output Options**: Save to file or play directly through speakers
- 🎛️ **Voice Customization**: Adjust voice parameters like stability, similarity boost, and style

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/saym.git
cd saym

# Install dependencies
npm install

# Build the project
npm run build

# Set up your ElevenLabs API key
export ELEVENLABS_API_KEY="your-api-key-here"
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

# Read from file
saym -f input.txt

# Save output to file
saym -o output.mp3 "Save this speech to a file"

# Stream audio for real-time playback
saym -s "Stream this text as it's being synthesized"
```

### Voice Management

```bash
# List all available voices
saym voice list

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
saym config reset                          # Reset to defaults
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
  "outputFormat": "mp3"
}
```

## Requirements

- Node.js 18+ or Deno
- ElevenLabs API account and API key
- FFmpeg (for audio format conversions)

## API Key Setup

### 1. Create an ElevenLabs Account

1. Visit [ElevenLabs](https://elevenlabs.io/) and click "Sign Up"
2. Create an account using email or Google/GitHub authentication
3. Choose a subscription plan (Free tier available with limited usage)

### 2. Generate API Key

1. Log in to your ElevenLabs dashboard
2. Click on your profile icon (top right) → "Profile + API Key"
3. In the API section, click "Generate API Key"
4. Copy the generated API key immediately (it won't be shown again)

### 3. Verify API Key

Test your API key setup:

```bash
# Check if environment variable is set
echo $ELEVENLABS_API_KEY

# Test with saym
saym voice list
```

## License

MIT License - see LICENSE file for details