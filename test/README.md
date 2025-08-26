# Test Dosyaları

Bu klasör, Adobe Premiere Pro AI Altyazı Eklentisi için test dosyalarını içerir.

## Test Scriptleri

### test_api.py
Backend API'sini test etmek için kullanılır.

**Kullanım:**
```bash
# Varsayılan URL ile test
python test_api.py

# Özel URL ile test
python test_api.py http://localhost:5000
```

**Test Edilen Endpoint'ler:**
- `GET /health` - API sağlık kontrolü
- `GET /models` - Kullanılabilir modeller
- `POST /transcribe` - Ses transkripsiyonu (ses dosyası varsa)

### Test Ses Dosyası

`test_audio.wav` - Test için kullanılacak ses dosyası. Bu dosya:
- Kısa süreli olmalı (1-2 dakika)
- Türkçe konuşma içermeli
- WAV formatında olmalı

## Test Senaryoları

### 1. Backend Bağlantı Testi
```bash
cd backend
python run.py
```

Başka terminal'de:
```bash
python test_api.py
```

### 2. CEP Panel Testi
1. Premiere Pro'yu başlatın
2. Panel'i açın: Window > Extensions > AI Türkçe Altyazı
3. API bağlantısını kontrol edin
4. Test sequence oluşturun
5. Altyazı oluşturmayı deneyin

### 3. Entegrasyon Testi
1. Backend çalışıyor olmalı
2. Premiere Pro açık olmalı
3. Aktif sequence olmalı
4. Panel'den altyazı oluşturun

## Sorun Giderme

### API Bağlantı Hatası
- Backend'in çalıştığından emin olun
- Port 5000'in açık olduğundan emin olun
- Firewall ayarlarını kontrol edin

### CEP Panel Hatası
- CEP debug modunun etkin olduğundan emin olun
- Panel dosyalarının doğru konumda olduğundan emin olun
- Premiere Pro'yu yeniden başlatın

### ExtendScript Hatası
- Premiere Pro'da proje açık olduğundan emin olun
- Aktif sequence seçili olduğundan emin olun
- Proje kaydedilmiş olduğundan emin olun
