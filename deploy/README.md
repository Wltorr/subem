# Adobe Premiere Pro AI Altyazı Eklentisi - Deployment

Bu dizin, Adobe Premiere Pro AI Altyazı Eklentisini farklı ortamlarda çalıştırmak için gerekli dosyaları içerir.

## 🚀 Hızlı Başlangıç

### Windows (Önerilen)
```bash
# Hızlı kurulum scripti
quick-deploy.bat
```

### Docker ile
```bash
# Docker Compose ile başlat
docker-compose up -d

# Logları izle
docker-compose logs -f

# Durdur
docker-compose down
```

### Manuel Kurulum
```bash
# Backend dizinine git
cd backend

# Virtual environment oluştur
python -m venv venv

# Virtual environment aktifleştir
# Windows
venv\Scripts\activate.bat
# macOS/Linux
source venv/bin/activate

# Bağımlılıkları yükle
pip install -r requirements.txt

# Uygulamayı başlat
python run.py
```

## 📋 Gereksinimler

### Sistem Gereksinimleri
- **Python**: 3.8 veya üzeri
- **FFmpeg**: Ses/video işleme için
- **RAM**: En az 4GB (Whisper modeli için)
- **Disk**: En az 2GB boş alan

### Python Paketleri
- Flask 3.0.0+
- OpenAI Whisper 20231117+
- Faster Whisper 0.10.0+
- PyTorch 2.1.2+
- NumPy 1.26.2+

## 🔧 Yapılandırma

### Environment Variables
```bash
# Whisper model seçimi
WHISPER_MODEL=base          # tiny, base, small, medium, large
USE_FASTER_WHISPER=true     # true/false
DEBUG=true                  # true/false
PORT=5000                   # Port numarası
```

### Whisper Modelleri
| Model | Boyut | Hız | Doğruluk | Önerilen |
|-------|-------|-----|----------|----------|
| tiny  | ~39 MB | Çok Hızlı | Düşük | Test |
| base  | ~74 MB | Hızlı | İyi | **Önerilen** |
| small | ~244 MB | Orta | İyi | Kaliteli |
| medium| ~769 MB | Yavaş | Çok İyi | Profesyonel |
| large | ~1550 MB | Çok Yavaş | En İyi | En yüksek kalite |

## 🐳 Docker Deployment

### Docker Compose
```yaml
version: '3.8'
services:
  ai-subtitles:
    build: .
    ports:
      - "5000:5000"
    environment:
      - WHISPER_MODEL=base
      - USE_FASTER_WHISPER=true
      - DEBUG=false
      - PORT=5000
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    volumes:
      - ./models:/root/.cache/whisper
```

### Docker Build
```bash
# Image oluştur
docker build -t ai-subtitles .

# Container çalıştır
docker run -d -p 5000:5000 --name ai-subtitles ai-subtitles

# Logları izle
docker logs -f ai-subtitles

# Container durdur
docker stop ai-subtitles
```

## 🌐 Production Deployment

### Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Systemd Service
```ini
[Unit]
Description=AI Subtitles Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/backend
Environment=PATH=/path/to/backend/venv/bin
ExecStart=/path/to/backend/venv/bin/python run.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## 🔍 Monitoring & Health Checks

### Health Check Endpoint
```bash
curl http://localhost:5000/health
```

### Response Format
```json
{
  "status": "healthy",
  "model": "base",
  "faster_whisper": true,
  "model_status": "loaded"
}
```

### Log Monitoring
```bash
# Real-time logs
tail -f backend/app.log

# Docker logs
docker-compose logs -f ai-subtitles

# System logs
journalctl -u ai-subtitles -f
```

## 🛠️ Troubleshooting

### Common Issues

#### Model Loading Error
```bash
# Model cache temizle
rm -rf ~/.cache/whisper

# Manuel model indirme
python -c "import whisper; whisper.load_model('base')"
```

#### Memory Issues
```bash
# Daha küçük model kullan
export WHISPER_MODEL=tiny

# Faster Whisper kullan
export USE_FASTER_WHISPER=true
```

#### FFmpeg Error
```bash
# FFmpeg kurulum kontrolü
ffmpeg -version

# PATH kontrolü
which ffmpeg
```

#### Port Already in Use
```bash
# Port kullanımını kontrol et
netstat -tulpn | grep :5000

# Farklı port kullan
export PORT=5001
```

### Performance Optimization

#### Whisper Model Selection
```bash
# Hızlı işlem için
export WHISPER_MODEL=tiny
export USE_FASTER_WHISPER=true

# Kaliteli işlem için
export WHISPER_MODEL=base
export USE_FASTER_WHISPER=true
```

#### System Resources
```bash
# CPU kullanımı
htop

# Memory kullanımı
free -h

# Disk kullanımı
df -h
```

## 📊 Performance Metrics

### Response Times
- **Health Check**: < 100ms
- **Model Info**: < 200ms
- **Transcribe (tiny)**: 2-5 saniye
- **Transcribe (base)**: 5-15 saniye
- **Transcribe (small)**: 15-30 saniye

### Resource Usage
- **Memory**: 500MB - 2GB (model boyutuna göre)
- **CPU**: %20-80 (işlem yoğunluğuna göre)
- **Disk**: 100MB - 1GB (model cache)

## 🔒 Security Considerations

### Firewall Configuration
```bash
# Sadece gerekli portları aç
sudo ufw allow 5000/tcp

# IP kısıtlaması
sudo ufw allow from 192.168.1.0/24 to any port 5000
```

### Environment Security
```bash
# Hassas bilgileri environment variables olarak sakla
export OPENAI_API_KEY="your-api-key"

# Production'da debug modunu kapat
export DEBUG=false
```

## 📞 Support

Sorunlar için:
1. GitHub Issues kullanın
2. Log dosyalarını kontrol edin
3. Health check endpoint'ini test edin
4. System resources'ları kontrol edin

---

**Not**: Bu deployment guide sürekli güncellenmektedir. En güncel bilgiler için GitHub repository'yi kontrol edin.
