#!/usr/bin/env python3
"""
Adobe Premiere Pro AI Altyazı Eklentisi - Backend Server
Bu script backend sunucusunu başlatır.
"""

import os
import sys
from app import app

if __name__ == '__main__':
    # Environment variables
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'true').lower() == 'true'
    whisper_model = os.getenv('WHISPER_MODEL', 'base')
    use_faster_whisper = os.getenv('USE_FASTER_WHISPER', 'true').lower() == 'true'
    
    print("=" * 60)
    print("Adobe Premiere Pro AI Altyazı Eklentisi - Backend")
    print("=" * 60)
    print(f"Port: {port}")
    print(f"Debug Mode: {debug}")
    print(f"Whisper Model: {whisper_model}")
    print(f"Faster Whisper: {use_faster_whisper}")
    print("=" * 60)
    print("Sunucu başlatılıyor...")
    print(f"API Endpoint: http://localhost:{port}/transcribe")
    print("Durdurmak için Ctrl+C basın")
    print("=" * 60)
    
    try:
        app.run(host='0.0.0.0', port=port, debug=debug)
    except KeyboardInterrupt:
        print("\nSunucu durduruldu.")
        sys.exit(0)
