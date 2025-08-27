#!/usr/bin/env python3
"""
API Test Script
Bu script backend API'sini test etmek için kullanılır.
"""

import requests
import json
import os
import sys
import time

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
            print(f"   Model Status: {data.get('model_status', 'N/A')}")
            return True
        else:
            print(f"❌ Health check başarısız: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"❌ Bağlantı hatası: {base_url} erişilemiyor")
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
            print(f"   Model yüklendi: {data.get('model_loaded', 'N/A')}")
            return True
        else:
            print(f"❌ Models endpoint başarısız: {response.status_code}")
            print(f"   Hata: {response.text}")
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
            print(f"   Dosya boyutu: {os.path.getsize(audio_file)} bytes")
            
            start_time = time.time()
            response = requests.post(f"{base_url}/transcribe", files=files, data=data, timeout=120)
            end_time = time.time()
            
            if response.status_code == 200:
                # Response'u dosyaya kaydet
                output_file = "test_output.srt"
                with open(output_file, 'wb') as out_f:
                    out_f.write(response.content)
                
                print(f"✅ Transcribe başarılı!")
                print(f"   Çıktı dosyası: {output_file}")
                print(f"   Dosya boyutu: {len(response.content)} bytes")
                print(f"   İşlem süresi: {end_time - start_time:.2f} saniye")
                return True
            else:
                print(f"❌ Transcribe başarısız: {response.status_code}")
                print(f"   Hata: {response.text}")
                return False
    except requests.exceptions.Timeout:
        print(f"❌ Transcribe zaman aşımı (120s)")
        return False
    except Exception as e:
        print(f"❌ Transcribe hatası: {e}")
        return False

def test_transcribe_xml_endpoint(base_url, audio_file):
    """XML formatında transcribe endpoint'ini test et"""
    print(f"\n🔍 XML Transcribe endpoint test ediliyor...")
    
    if not os.path.exists(audio_file):
        print(f"❌ Test ses dosyası bulunamadı: {audio_file}")
        return False
    
    try:
        with open(audio_file, 'rb') as f:
            files = {'audio': f}
            data = {'format': 'xml'}
            
            print(f"   Ses dosyası XML formatında gönderiliyor: {audio_file}")
            
            start_time = time.time()
            response = requests.post(f"{base_url}/transcribe", files=files, data=data, timeout=120)
            end_time = time.time()
            
            if response.status_code == 200:
                # Response'u dosyaya kaydet
                output_file = "test_output.xml"
                with open(output_file, 'wb') as out_f:
                    out_f.write(response.content)
                
                print(f"✅ XML Transcribe başarılı!")
                print(f"   Çıktı dosyası: {output_file}")
                print(f"   Dosya boyutu: {len(response.content)} bytes")
                print(f"   İşlem süresi: {end_time - start_time:.2f} saniye")
                return True
            else:
                print(f"❌ XML Transcribe başarısız: {response.status_code}")
                print(f"   Hata: {response.text}")
                return False
    except requests.exceptions.Timeout:
        print(f"❌ XML Transcribe zaman aşımı (120s)")
        return False
    except Exception as e:
        print(f"❌ XML Transcribe hatası: {e}")
        return False

def create_test_audio():
    """Test için basit bir WAV dosyası oluştur"""
    try:
        import wave
        import struct
        
        # 1 saniye 440Hz sine wave
        sample_rate = 44100
        duration = 1.0
        frequency = 440.0
        
        num_samples = int(sample_rate * duration)
        wav_file = wave.open("test_audio.wav", "w")
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        
        for i in range(num_samples):
            value = int(32767.0 * math.sin(2.0 * math.pi * frequency * i / sample_rate))
            data = struct.pack('<h', value)
            wav_file.writeframes(data)
        
        wav_file.close()
        print("✅ Test ses dosyası oluşturuldu: test_audio.wav")
        return True
    except ImportError:
        print("⚠️  wave modülü bulunamadı, test ses dosyası oluşturulamadı")
        return False
    except Exception as e:
        print(f"❌ Test ses dosyası oluşturma hatası: {e}")
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
    total_tests = 4  # health, models, srt transcribe, xml transcribe
    
    # Health check
    if test_health_endpoint(base_url):
        tests_passed += 1
    
    # Models endpoint
    if test_models_endpoint(base_url):
        tests_passed += 1
    
    # Test ses dosyası kontrolü
    test_audio_file = "test_audio.wav"
    if not os.path.exists(test_audio_file):
        print(f"\n⚠️  Test ses dosyası bulunamadı: {test_audio_file}")
        print("   Test ses dosyası oluşturuluyor...")
        if create_test_audio():
            test_audio_file = "test_audio.wav"
        else:
            print("   Test ses dosyası oluşturulamadı, transcribe testleri atlanıyor...")
            total_tests = 2
    
    # SRT Transcribe endpoint
    if os.path.exists(test_audio_file):
        if test_transcribe_endpoint(base_url, test_audio_file):
            tests_passed += 1
        
        # XML Transcribe endpoint
        if test_transcribe_xml_endpoint(base_url, test_audio_file):
            tests_passed += 1
    
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
    try:
        import math
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\n⚠️  Test kullanıcı tarafından durduruldu")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Beklenmeyen hata: {e}")
        sys.exit(1)
