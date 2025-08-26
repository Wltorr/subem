# AWS Free Tier Backend Kurulumu

Bu rehber AWS Free Tier (t2.micro) ile backend'i nasıl kuracağınızı gösterir.

## 🚀 Hızlı Kurulum

### 1. AWS EC2 Instance Oluştur

1. **AWS Console'a git**: https://console.aws.amazon.com/ec2/
2. **Launch Instance** tıkla
3. **AMI seç**: Ubuntu Server 22.04 LTS (Free tier eligible)
4. **Instance Type**: t2.micro (Free tier)
5. **Key Pair**: Yeni oluştur veya mevcut olanı seç
6. **Security Group**: 
   - SSH (22) - My IP
   - Custom TCP (5000) - Anywhere (0.0.0.0/0)
7. **Launch Instance**

### 2. EC2'ye Bağlan

**Windows (PowerShell):**
```powershell
# Key dosyasını indir ve şu komutu çalıştır
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

**macOS/Linux:**
```bash
chmod 400 your-key.pem
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

### 3. Backend'i Kur

EC2'de şu komutları çalıştır:

```bash
# Proje dosyalarını yükle
git clone https://github.com/your-repo/ai-subtitles.git
cd ai-subtitles

# Veya manuel olarak dosyaları kopyala
# scp -i "your-key.pem" -r backend/ ubuntu@your-ec2-ip:~/
# scp -i "your-key.pem" -r deploy/ ubuntu@your-ec2-ip:~/

# Kurulum scriptini çalıştır
chmod +x deploy/aws-setup.sh
./deploy/aws-setup.sh
```

### 4. Test Et

```bash
# Health check
curl http://localhost:5000/health

# Public IP ile test
curl http://YOUR-EC2-PUBLIC-IP:5000/health
```

## 🔧 Manuel Kurulum (Alternatif)

Docker olmadan:

```bash
# Python ve FFmpeg kur
sudo apt update
sudo apt install -y python3 python3-pip python3-venv ffmpeg

# Virtual environment
python3 -m venv venv
source venv/bin/activate

# Bağımlılıkları yükle
pip install -r backend/requirements.txt

# Backend'i başlat
cd backend
export WHISPER_MODEL=base
export USE_FASTER_WHISPER=true
export DEBUG=false
python run.py
```

## 🌐 Panel Ayarları

Backend çalıştıktan sonra:

1. **Public IP'yi al**: EC2 Console'dan
2. **Panel'de API URL**: `http://YOUR-EC2-PUBLIC-IP:5000`
3. **Test et**: Premiere Pro'da panel aç, altyazı oluştur

## 💰 Maliyet

- **t2.micro**: 750 saat/ay ücretsiz (1 ay)
- **Storage**: 30 GB EBS ücretsiz
- **Data Transfer**: 1 GB/ay ücretsiz
- **Toplam**: İlk ay tamamen ücretsiz

## 🔒 Güvenlik

- Security Group'da sadece gerekli portları aç
- Key pair'i güvenli tut
- Regular backup al

## 📊 Monitoring

```bash
# Docker logları
sudo docker-compose logs -f

# Sistem kaynakları
htop

# Disk kullanımı
df -h
```

## 🛠️ Sorun Giderme

**Port açık değil:**
```bash
sudo ufw status
sudo ufw allow 5000
```

**Docker çalışmıyor:**
```bash
sudo systemctl status docker
sudo systemctl start docker
```

**Memory hatası:**
- t2.micro sadece 1 GB RAM
- `WHISPER_MODEL=tiny` kullan

**Whisper model indirme:**
```bash
# Manuel model indirme
sudo docker exec -it container_name python -c "import whisper; whisper.load_model('base')"
```

## 🔄 Güncelleme

```bash
# Yeni kod çek
git pull

# Docker rebuild
sudo docker-compose down
sudo docker-compose up -d --build
```

## 📱 Mobil Test

Backend çalıştıktan sonra mobil cihazdan da test edebilirsin:
- `http://YOUR-EC2-PUBLIC-IP:5000/health`
