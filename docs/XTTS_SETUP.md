# XTTS v2 Setup Guide

XTTS v2 is a high-quality multilingual text-to-speech system developed by Coqui AI. It can run on your own server and is available at no API cost.

## Verified Method (macOS/Linux)

```bash
# 1. Create and activate Python virtual environment
python3 -m venv ~/python/xtts-env
source ~/python/xtts-env/bin/activate

# 2. Install required packages
pip install TTS flask flask-cors

# 3. For Japanese language support (optional)
pip install "fugashi[unidic]"
python -m unidic download

# 4. Download custom server script
curl -o ~/python/xtts_server.py https://raw.githubusercontent.com/champierre/saym/main/scripts/xtts_server.py
# Or use the xtts_server.py created above

# 5. Start server (downloads model automatically on first run)
python3 ~/python/xtts_server.py --port 8020

# Check server health in another terminal
curl http://localhost:8020/health
```

## 2. Voice Sample Preparation

XTTS v2 requires a 6-10 second voice sample to clone your voice. Record using one of the following methods:

```bash
# macOS (command-line recording)
# 1. Record with QuickTime Player
open -a "QuickTime Player"
# New Audio Recording > Record > Speak for 6-10 seconds > Stop > Save as voice.m4a
# Convert m4a to wav
ffmpeg -i voice.m4a -ar 22050 -ac 1 voice.wav

# 2. Or record with sox command (requires: brew install sox)
sox -d -r 22050 -c 1 voice.wav trim 0 10

# Linux (using arecord)
arecord -f cd -t wav -d 10 voice.wav

# Convert existing audio file to proper format
ffmpeg -i your_voice_file.mp3 -ar 22050 -ac 1 voice.wav
```

**Recording Tips:**
- Speak clearly (6-10 seconds duration)
- Avoid background noise
- Use natural tone

## 3. Using with saym

```bash
# Set environment variables
export XTTS_SERVER_URL="http://localhost:8020"

# Synthesize speech with XTTS
saym -p xtts -v "voice.wav" "Hello, this is XTTS v2 test"

# For Japanese text
saym -p xtts -v "voice.wav" -l ja "こんにちは、これはXTTS v2のテストです"

# Set as default and use
saym use xtts
saym default-voice "voice.wav"
saym "Now it's easy to use"
```

## Troubleshooting

### Japanese Text Processing Issues

If you encounter errors when using Japanese text with XTTS, install the required Japanese processing libraries:

```bash
# Install Japanese text processing libraries
pip install "fugashi[unidic]"
python -m unidic download

# For macOS users, you may also need MeCab
brew install mecab mecab-ipadic

# Set MeCab environment variable if needed
export MECABRC=/usr/local/etc/mecabrc
```

Common error messages and solutions:
- `No module named 'cutlet'` → Install: `pip install cutlet`
- `No module named 'fugashi'` → Install: `pip install "fugashi[unidic]"`
- `Failed initializing MeCab` → Install MeCab via Homebrew as shown above

### Supported Languages

XTTS v2 supports the following language codes:
- `en` (English), `ja` (Japanese), `es` (Spanish), `fr` (French)
- `de` (German), `it` (Italian), `pt` (Portuguese), `pl` (Polish)
- `tr` (Turkish), `ru` (Russian), `nl` (Dutch), `cs` (Czech)
- `ar` (Arabic), `zh-cn` (Chinese), `hu` (Hungarian), `ko` (Korean), `hi` (Hindi)