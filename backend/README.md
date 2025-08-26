# Adobe Premiere Pro AI Altyazı Eklentisi - Backend

Bu backend, Adobe Premiere Pro eklentisi için AI destekli Türkçe altyazı oluşturma servisi sağlar.

## Özellikler

- OpenAI Whisper ile ses transkripsiyonu
- Türkçe dil desteği
- SRT ve Premiere Pro XML formatında çıktı
- Faster-Whisper desteği (daha hızlı)
- RESTful API

## Kurulum

### 1. Python Gereksinimleri

```bash
# Python 3.8+ gerekli
python --version

# Virtual environment oluştur (önerilen)
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 2. Bağımlılıkları Yükle

```bash
pip install -r requirements.txt
```

### 3. FFmpeg Kurulumu

**Windows:**
- [FFmpeg](https://ffmpeg.org/download.html) indir ve PATH'e ekle
- Veya: `choco install ffmpeg` (Chocolatey ile)

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt update
sudo apt install ffmpeg
```

## Kullanım

### Backend'i Başlat

```bash
python run.py
```

Veya environment variables ile:

```bash
# Model seçimi
set WHISPER_MODEL=base  # Windows
export WHISPER_MODEL=base  # macOS/Linux

# Faster-Whisper kullanımı
set USE_FASTER_WHISPER=true  # Windows
export USE_FASTER_WHISPER=true  # macOS/Linux

# Port ayarı
set PORT=5000  # Windows
export PORT=5000  # macOS/Linux

python run.py
```

### API Endpoints

#### Health Check
```
GET http://localhost:5000/health
```

#### Transkripsiyon
```
POST http://localhost:5000/transcribe
Content-Type: multipart/form-data

Parameters:
- audio: Ses dosyası (WAV, MP3, M4A, vb.)
- format: Çıktı formatı (srt veya xml)
```

#### Model Listesi
```
GET http://localhost:5000/models
```

## Whisper Modelleri

- `tiny`: En hızlı, en az doğru (~39 MB)
- `base`: Hızlı ve doğru (~74 MB) - **Önerilen**
- `small`: Orta hız, iyi doğruluk (~244 MB)
- `medium`: Yavaş, çok iyi doğruluk (~769 MB)
- `large`: En yavaş, en doğru (~1550 MB)

## Sorun Giderme

### Model İndirme Sorunu
```bash
# Manuel model indirme
python -c "import whisper; whisper.load_model('base')"
```

### Memory Hatası
- Daha küçük model kullanın (`tiny` veya `base`)
- `USE_FASTER_WHISPER=true` kullanın

### FFmpeg Hatası
- FFmpeg'in PATH'te olduğundan emin olun
- `ffmpeg -version` komutu ile test edin

## Geliştirme

### Debug Mode
```bash
set DEBUG=true
python run.py
```

### Log Seviyesi
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```
