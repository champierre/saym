# saym - Say iMproved

A powerful text-to-speech command-line tool that extends the traditional `say` command with advanced voice synthesis capabilities using ElevenLabs API. Create custom voice models from your own voice and speak in multiple languages with natural-sounding output.

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

# Set up your ElevenLabs API key
export ELEVENLABS_API_KEY="your-api-key-here"
```

## Usage

### Basic Usage

```bash
# Speak text using default voice
saym "Hello, world!"

# Speak text in Japanese
saym -l ja "Hello, world!"

# Use a specific voice model
saym -v "your-voice-id" "This is my custom voice"

# Save output to file
saym -o output.mp3 "Save this speech to a file"
```

### Advanced Options

```bash
# Translate and speak in Spanish
saym -l es --translate "Good morning, how are you?"

# Adjust voice parameters
saym --stability 0.8 --similarity 0.9 "Fine-tuned voice output"

# List available voices
saym --list-voices

# Train a new voice model
saym --train-voice /path/to/voice/samples
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

1. Sign up for an account at [ElevenLabs](https://elevenlabs.io/)
2. Generate an API key from your dashboard
3. Set the environment variable:
   ```bash
   export ELEVENLABS_API_KEY="your-api-key-here"
   ```

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## License

MIT License - see LICENSE file for details