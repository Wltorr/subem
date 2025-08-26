# Adobe Premiere Pro AI Türkçe Altyazı Eklentisi

Bu proje, Adobe Premiere Pro için AI destekli Türkçe altyazı oluşturma eklentisidir. OpenAI Whisper modeli kullanarak ses dosyalarını otomatik olarak Türkçe'ye çevirir ve Premiere Pro'ya altyazı olarak import eder.

## 🎯 Özellikler

- **AI Destekli Transkripsiyon**: OpenAI Whisper ile yüksek doğrulukta Türkçe transkripsiyon
- **Otomatik Import**: Altyazıları otomatik olarak Premiere Pro'ya import eder
- **Çoklu Format Desteği**: SRT ve Premiere Pro XML formatında çıktı
- **Modern UI**: Kullanıcı dostu CEP panel arayüzü
- **Gerçek Zamanlı İzleme**: İşlem durumu ve log takibi
- **Türkçe Karakter Desteği**: ğ, ü, ş, ö, ç, İ karakterleri sorunsuz çalışır

## 📁 Proje Yapısı

```
Subem/
├── backend/                 # Flask API Backend
│   ├── app.py              # Ana Flask uygulaması
│   ├── run.py              # Sunucu başlatma scripti
│   ├── requirements.txt    # Python bağımlılıkları
│   └── README.md           # Backend dokümantasyonu
├── cep-panel/              # Adobe CEP Panel
│   ├── CSXS/
│   │   └── manifest.xml    # CEP manifest dosyası
│   ├── js/
│   │   ├── main.js         # Ana panel JavaScript
│   │   ├── api-client.js   # API istemci
│   │   ├── premiere-interface.js # Premiere Pro arayüzü
│   │   └── libs/
│   │       └── CSInterface.js # CEP interface
│   ├── jsx/
│   │   └── hostscript.jsx  # ExtendScript kodları
│   └── index.html          # Panel HTML arayüzü
└── README.md               # Bu dosya
```

## 🚀 Kurulum

### 1. Backend Kurulumu

#### Python Gereksinimleri
- Python 3.8 veya üzeri
- pip (Python paket yöneticisi)

#### Adım Adım Kurulum

1. **Backend dizinine gidin:**
   ```bash
   cd backend
   ```

2. **Virtual environment oluşturun (önerilen):**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Bağımlılıkları yükleyin:**
   ```bash
   pip install -r requirements.txt
   ```

4. **FFmpeg kurulumu:**
   
   **Windows:**
   - [FFmpeg](https://ffmpeg.org/download.html) indirin
   - PATH'e ekleyin
   - Veya Chocolatey ile: `choco install ffmpeg`
   
   **macOS:**
   ```bash
   brew install ffmpeg
   ```
   
   **Linux:**
   ```bash
   sudo apt update
   sudo apt install ffmpeg
   ```

### 2. CEP Panel Kurulumu

#### Adobe CEP Kurulumu

1. **CEP klasörünü oluşturun:**
   
   **Windows:**
   ```
   C:\Users\[KullanıcıAdı]\AppData\Roaming\Adobe\CEP\extensions\
   ```
   
   **macOS:**
   ```
   ~/Library/Application Support/Adobe/CEP/extensions/
   ```

2. **Panel dosyalarını kopyalayın:**
   ```bash
   # CEP panel klasörünü yukarıdaki dizine kopyalayın
   cp -r cep-panel "C:\Users\[KullanıcıAdı]\AppData\Roaming\Adobe\CEP\extensions\AI-Turkce-Altyazi"
   ```

3. **CEP debug modunu etkinleştirin:**
   
   **Windows:**
   ```
   HKEY_CURRENT_USER/Software/Adobe/CSXS.9
   PlayerDebugMode = 1 (DWORD)
   ```
   
   **macOS:**
   ```bash
   defaults write com.adobe.CSXS.9 PlayerDebugMode 1
   ```

## 🎮 Kullanım

### 1. Backend'i Başlatın

```bash
cd backend
python run.py
```

Backend başarıyla başlatıldığında şu mesajı göreceksiniz:
```
============================================================
Adobe Premiere Pro AI Altyazı Eklentisi - Backend
============================================================
Port: 5000
Debug Mode: true
Whisper Model: base
Faster Whisper: true
============================================================
Sunucu başlatılıyor...
API Endpoint: http://localhost:5000/transcribe
Durdurmak için Ctrl+C basın
============================================================
```

### 2. Premiere Pro'da Panel'i Açın

1. **Premiere Pro'yu başlatın**
2. **Window > Extensions > AI Türkçe Altyazı** menüsünden paneli açın
3. **Panel açıldığında:**
   - API bağlantısı otomatik kontrol edilir
   - Yeşil nokta: Bağlantı başarılı
   - Kırmızı nokta: Bağlantı hatası

### 3. Altyazı Oluşturun

1. **Bir sequence seçin** (aktif sequence gerekli)
2. **API endpoint'i kontrol edin** (varsayılan: http://localhost:5000)
3. **Çıktı formatını seçin:**
   - SRT: Standart altyazı formatı
   - XML: Premiere Pro native formatı
4. **"🎯 Türkçe Altyazı Oluştur" butonuna tıklayın**

### 4. İşlem Takibi

Panel'de gerçek zamanlı olarak:
- ✅ Ses dosyası dışa aktarma
- ✅ API'ye gönderme
- ✅ Transkripsiyon işlemi
- ✅ Altyazı import etme
- ✅ İşlem tamamlama

## ⚙️ Yapılandırma

### Backend Yapılandırması

Environment variables ile yapılandırma:

```bash
# Whisper model seçimi
set WHISPER_MODEL=base  # Windows
export WHISPER_MODEL=base  # macOS/Linux

# Faster-Whisper kullanımı
set USE_FASTER_WHISPER=true  # Windows
export USE_FASTER_WHISPER=true  # macOS/Linux

# Port ayarı
set PORT=5000  # Windows
export PORT=5000  # macOS/Linux

# Debug modu
set DEBUG=true  # Windows
export DEBUG=true  # macOS/Linux
```

### Whisper Modelleri

| Model | Boyut | Hız | Doğruluk | Önerilen Kullanım |
|-------|-------|-----|----------|-------------------|
| tiny | ~39 MB | Çok Hızlı | Düşük | Test/Prototip |
| base | ~74 MB | Hızlı | İyi | **Önerilen** |
| small | ~244 MB | Orta | İyi | Kaliteli çıktı |
| medium | ~769 MB | Yavaş | Çok İyi | Profesyonel |
| large | ~1550 MB | Çok Yavaş | En İyi | En yüksek kalite |

## 🔧 Sorun Giderme

### Backend Sorunları

**Model İndirme Hatası:**
```bash
# Manuel model indirme
python -c "import whisper; whisper.load_model('base')"
```

**Memory Hatası:**
- Daha küçük model kullanın (`tiny` veya `base`)
- `USE_FASTER_WHISPER=true` kullanın

**FFmpeg Hatası:**
- FFmpeg'in PATH'te olduğundan emin olun
- `ffmpeg -version` komutu ile test edin

### CEP Panel Sorunları

**Panel Açılmıyor:**
- CEP debug modunu kontrol edin
- Panel dosyalarının doğru konumda olduğundan emin olun
- Premiere Pro'yu yeniden başlatın

**API Bağlantı Hatası:**
- Backend'in çalıştığından emin olun
- Firewall ayarlarını kontrol edin
- API endpoint URL'ini kontrol edin

**ExtendScript Hatası:**
- Premiere Pro'da bir proje açık olduğundan emin olun
- Aktif sequence seçili olduğundan emin olun

## 📊 API Endpoints

### Health Check
```
GET /health
```
API sağlık durumu ve model bilgilerini döndürür.

### Transkripsiyon
```
POST /transcribe
Content-Type: multipart/form-data

Parameters:
- audio: Ses dosyası (WAV, MP3, M4A, vb.)
- format: Çıktı formatı (srt veya xml)
```

### Model Listesi
```
GET /models
```
Kullanılabilir Whisper modellerini listeler.

## 🛠️ Geliştirme

### Backend Geliştirme

```bash
cd backend
# Debug modunda çalıştır
set DEBUG=true
python run.py
```

### CEP Panel Geliştirme

1. **Panel dosyalarını düzenleyin**
2. **Premiere Pro'yu yeniden başlatın**
3. **Panel'i yeniden yükleyin**

### Test

```bash
# Backend test
curl http://localhost:5000/health

# API test
curl -X POST -F "audio=@test.wav" -F "format=srt" http://localhost:5000/transcribe
```

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 Destek

Sorunlar için GitHub Issues kullanın veya iletişime geçin.

---

**Not**: Bu eklenti Adobe Premiere Pro 2020 ve üzeri sürümlerle uyumludur. Windows ve macOS desteklenir.
