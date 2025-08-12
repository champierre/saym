#!/usr/bin/env python3
"""
XTTS v2 API Server for saym
Simple Flask server that provides REST API for XTTS v2 TTS
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import torch
from TTS.api import TTS
import tempfile
import os
import io
import base64
import wave
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize XTTS v2 model
logger.info("Loading XTTS v2 model...")
device = "cuda" if torch.cuda.is_available() else "cpu"
logger.info(f"Using device: {device}")

tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)
logger.info("XTTS v2 model loaded successfully!")

# Store default speaker wav path
DEFAULT_SPEAKER_WAV = None

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "model": "xtts_v2", "device": device})

@app.route('/docs', methods=['GET'])
def docs():
    return jsonify({
        "endpoints": {
            "/health": "GET - Health check",
            "/docs": "GET - API documentation",
            "/api/tts": "POST - Generate speech",
            "/set_speaker": "POST - Set default speaker wav"
        },
        "tts_params": {
            "text": "Text to synthesize (required)",
            "speaker_wav": "Path to speaker WAV file (optional if default is set)",
            "language": "Language code (default: 'en')"
        }
    })

@app.route('/set_speaker', methods=['POST'])
def set_speaker():
    global DEFAULT_SPEAKER_WAV
    data = request.json
    speaker_wav = data.get('speaker_wav')
    
    if not speaker_wav or not os.path.exists(speaker_wav):
        return jsonify({"error": "Invalid speaker_wav path"}), 400
    
    DEFAULT_SPEAKER_WAV = speaker_wav
    return jsonify({"message": f"Default speaker set to: {speaker_wav}"})

@app.route('/api/tts', methods=['POST'])
def synthesize():
    try:
        data = request.json
        text = data.get('text')
        speaker_wav = data.get('speaker_wav', DEFAULT_SPEAKER_WAV)
        language = data.get('language', 'en')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        if not speaker_wav:
            return jsonify({"error": "No speaker_wav provided and no default set"}), 400
        
        # Check if speaker_wav exists
        if not os.path.exists(speaker_wav):
            # Try to decode if it's base64 audio data
            try:
                audio_data = base64.b64decode(speaker_wav)
                with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_speaker:
                    tmp_speaker.write(audio_data)
                    speaker_wav = tmp_speaker.name
            except:
                return jsonify({"error": f"Speaker file not found: {speaker_wav}"}), 400
        
        logger.info(f"Generating speech: language={language}, text_length={len(text)}")
        
        # Generate speech
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
            output_path = tmp_file.name
        
        # Use the correct method for XTTS v2
        # The tts_to_file method handles the generation internally
        tts.tts_to_file(
            text=text,
            speaker_wav=speaker_wav,
            language=language,
            file_path=output_path,
            split_sentences=True  # Handle longer texts properly
        )
        
        # Read the file and return it
        with open(output_path, 'rb') as f:
            audio_data = f.read()
        
        # Clean up temp file
        os.unlink(output_path)
        
        return send_file(
            io.BytesIO(audio_data),
            mimetype='audio/wav',
            as_attachment=True,
            download_name='output.wav'
        )
        
    except Exception as e:
        logger.error(f"Error generating speech: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/tts', methods=['GET'])
def tts_info():
    """Compatibility endpoint for checking if server is running"""
    return jsonify({
        "message": "XTTS v2 server is running",
        "usage": "POST /api/tts with JSON body containing 'text', 'speaker_wav', and 'language'"
    })

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='XTTS v2 API Server')
    parser.add_argument('--port', type=int, default=8020, help='Port to run server on')
    parser.add_argument('--host', default='0.0.0.0', help='Host to bind to')
    parser.add_argument('--speaker', help='Default speaker WAV file path')
    args = parser.parse_args()
    
    if args.speaker:
        DEFAULT_SPEAKER_WAV = args.speaker
        logger.info(f"Default speaker set to: {args.speaker}")
    
    logger.info(f"Starting XTTS v2 server on {args.host}:{args.port}")
    app.run(host=args.host, port=args.port, debug=False)