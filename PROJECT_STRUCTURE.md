# Proje Yapısı

```
Subem/
├── 📁 backend/                    # Flask API Backend
│   ├── 📄 app.py                 # Ana Flask uygulaması
│   ├── 📄 run.py                 # Sunucu başlatma scripti
│   ├── 📄 requirements.txt       # Python bağımlılıkları
│   └── 📄 README.md              # Backend dokümantasyonu
│
├── 📁 cep-panel/                 # Adobe CEP Panel
│   ├── 📁 CSXS/
│   │   └── 📄 manifest.xml       # CEP manifest dosyası
│   ├── 📁 js/
│   │   ├── 📄 main.js            # Ana panel JavaScript
│   │   ├── 📄 api-client.js      # API istemci
│   │   ├── 📄 premiere-interface.js # Premiere Pro arayüzü
│   │   └── 📁 libs/
│   │       └── 📄 CSInterface.js # CEP interface
│   ├── 📁 jsx/
│   │   └── 📄 hostscript.jsx     # ExtendScript kodları
│   ├── 📄 index.html             # Panel HTML arayüzü
│   └── 📁 icons/                 # Panel ikonları (opsiyonel)
│
├── 📁 test/                      # Test dosyaları
│   ├── 📄 test_api.py            # API test scripti
│   ├── 📄 test_audio.wav         # Test ses dosyası
│   └── 📄 README.md              # Test dokümantasyonu
│
├── 📄 install.bat                # Windows kurulum scripti
├── 📄 install.sh                 # macOS/Linux kurulum scripti
├── 📄 README.md                  # Ana proje dokümantasyonu
└── 📄 PROJECT_STRUCTURE.md       # Bu dosya
```

## Dosya Açıklamaları

### Backend Dosyaları

- **`app.py`**: Flask uygulamasının ana dosyası. Whisper entegrasyonu, API endpoint'leri ve altyazı oluşturma mantığını içerir.
- **`run.py`**: Backend sunucusunu başlatmak için kullanılan script.
- **`requirements.txt`**: Python bağımlılıklarının listesi.
- **`README.md`**: Backend kurulum ve kullanım rehberi.

### CEP Panel Dosyaları

- **`manifest.xml`**: Adobe CEP için gerekli manifest dosyası. Panel özelliklerini, boyutlarını ve izinlerini tanımlar.
- **`index.html`**: Panel'in HTML arayüzü. Modern ve kullanıcı dostu tasarım.
- **`main.js`**: Panel'in ana JavaScript mantığı. Kullanıcı etkileşimleri ve işlem akışını yönetir.
- **`api-client.js`**: Flask API ile iletişim kurmak için özel istemci sınıfı.
- **`premiere-interface.js`**: Premiere Pro ile ExtendScript üzerinden iletişim kurmak için arayüz.
- **`CSInterface.js`**: Adobe CEP için gerekli interface dosyası.
- **`hostscript.jsx`**: Premiere Pro'da çalışacak ExtendScript kodları.

### Test Dosyaları

- **`test_api.py`**: Backend API'sini test etmek için Python scripti.
- **`test_audio.wav`**: Test için kullanılacak ses dosyası.
- **`README.md`**: Test süreçleri ve sorun giderme rehberi.

### Kurulum Dosyaları

- **`install.bat`**: Windows için otomatik kurulum scripti.
- **`install.sh`**: macOS/Linux için otomatik kurulum scripti.

## Teknoloji Stack

### Backend
- **Python 3.8+**: Ana programlama dili
- **Flask**: Web framework
- **OpenAI Whisper**: AI transkripsiyon modeli
- **Faster-Whisper**: Optimized Whisper implementasyonu
- **FFmpeg**: Ses dosyası işleme

### Frontend (CEP Panel)
- **HTML5**: Panel arayüzü
- **CSS3**: Modern styling
- **JavaScript ES6+**: Panel mantığı
- **Adobe CEP**: Extensibility platform
- **ExtendScript**: Premiere Pro ile iletişim

### API İletişimi
- **REST API**: HTTP tabanlı iletişim
- **FormData**: Dosya upload
- **JSON**: Veri formatı
- **CORS**: Cross-origin resource sharing

## Geliştirme Notları

### Backend Geliştirme
- Virtual environment kullanın
- Debug modunda çalıştırın
- Log seviyesini ayarlayın
- Model seçimini optimize edin

### CEP Panel Geliştirme
- CEP debug modunu etkinleştirin
- Premiere Pro'yu yeniden başlatın
- Browser developer tools kullanın
- ExtendScript hatalarını kontrol edin

### Test Geliştirme
- API endpoint'lerini test edin
- Farklı ses formatlarını deneyin
- Hata senaryolarını test edin
- Performance testleri yapın
