#!/usr/bin/env python3
"""
API Test Script
Bu script backend API'sini test etmek için kullanılır.
"""

import requests
import json
import os
import sys

def test_health_endpoint(base_url):
    """Health endpoint'ini test et"""
    print("🔍 Health endpoint test ediliyor...")
    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check başarılı!")
            print(f"   Model: {data.get('model', 'N/A')}")
            print(f"   Faster Whisper: {data.get('faster_whisper', 'N/A')}")
            return True
        else:
            print(f"❌ Health check başarısız: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check hatası: {e}")
        return False

def test_models_endpoint(base_url):
    """Models endpoint'ini test et"""
    print("\n🔍 Models endpoint test ediliyor...")
    try:
        response = requests.get(f"{base_url}/models", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Models endpoint başarılı!")
            print(f"   Mevcut model: {data.get('current_model', 'N/A')}")
            print(f"   Kullanılabilir modeller: {', '.join(data.get('available_models', []))}")
            return True
        else:
            print(f"❌ Models endpoint başarısız: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Models endpoint hatası: {e}")
        return False

def test_transcribe_endpoint(base_url, audio_file):
    """Transcribe endpoint'ini test et"""
    print(f"\n🔍 Transcribe endpoint test ediliyor...")
    
    if not os.path.exists(audio_file):
        print(f"❌ Test ses dosyası bulunamadı: {audio_file}")
        return False
    
    try:
        with open(audio_file, 'rb') as f:
            files = {'audio': f}
            data = {'format': 'srt'}
            
            print(f"   Ses dosyası gönderiliyor: {audio_file}")
            response = requests.post(f"{base_url}/transcribe", files=files, data=data, timeout=60)
            
            if response.status_code == 200:
                # Response'u dosyaya kaydet
                output_file = "test_output.srt"
                with open(output_file, 'wb') as out_f:
                    out_f.write(response.content)
                
                print(f"✅ Transcribe başarılı!")
                print(f"   Çıktı dosyası: {output_file}")
                print(f"   Dosya boyutu: {len(response.content)} bytes")
                return True
            else:
                print(f"❌ Transcribe başarısız: {response.status_code}")
                print(f"   Hata: {response.text}")
                return False
    except Exception as e:
        print(f"❌ Transcribe hatası: {e}")
        return False

def main():
    """Ana test fonksiyonu"""
    print("=" * 60)
    print("Adobe Premiere Pro AI Altyazı Eklentisi - API Test")
    print("=" * 60)
    
    # Varsayılan URL
    base_url = "http://localhost:5000"
    
    # Komut satırı argümanları
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    
    print(f"Test URL: {base_url}")
    print()
    
    # Testleri çalıştır
    tests_passed = 0
    total_tests = 3
    
    # Health check
    if test_health_endpoint(base_url):
        tests_passed += 1
    
    # Models endpoint
    if test_models_endpoint(base_url):
        tests_passed += 1
    
    # Transcribe endpoint (opsiyonel)
    test_audio_file = "test_audio.wav"
    if os.path.exists(test_audio_file):
        if test_transcribe_endpoint(base_url, test_audio_file):
            tests_passed += 1
    else:
        print(f"\n⚠️  Test ses dosyası bulunamadı: {test_audio_file}")
        print("   Transcribe testi atlanıyor...")
        total_tests = 2
    
    # Sonuçları göster
    print("\n" + "=" * 60)
    print("TEST SONUÇLARI")
    print("=" * 60)
    print(f"Başarılı testler: {tests_passed}/{total_tests}")
    
    if tests_passed == total_tests:
        print("🎉 Tüm testler başarılı!")
        return 0
    else:
        print("❌ Bazı testler başarısız!")
        return 1

if __name__ == "__main__":
    sys.exit(main())
