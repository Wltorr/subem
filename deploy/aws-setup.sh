#!/bin/bash

# AWS EC2 Free Tier Kurulum Scripti
# Bu script AWS EC2 t2.micro instance'ında backend'i kurar

echo "============================================================"
echo "AWS EC2 AI Altyazı Backend Kurulumu"
echo "============================================================"

# Sistem güncellemeleri
echo "Sistem güncelleniyor..."
sudo apt update && sudo apt upgrade -y

# Docker kurulumu
echo "Docker kuruluyor..."
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Docker Compose kurulumu
echo "Docker Compose kuruluyor..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Docker servisini başlat
sudo systemctl start docker
sudo systemctl enable docker

# Kullanıcıyı docker grubuna ekle
sudo usermod -aG docker $USER

# Proje dosyalarını kopyala (manuel olarak yapılacak)
echo "Proje dosyaları kopyalanıyor..."
# Bu kısım manuel olarak yapılacak veya git clone ile

# Firewall ayarları
echo "Firewall ayarlanıyor..."
sudo ufw allow 22
sudo ufw allow 5000
sudo ufw --force enable

# Docker Compose ile uygulamayı başlat
echo "Uygulama başlatılıyor..."
sudo docker-compose up -d

echo "============================================================"
echo "KURULUM TAMAMLANDI!"
echo "============================================================"
echo "Backend URL: http://$(curl -s ifconfig.me):5000"
echo "Health Check: http://$(curl -s ifconfig.me):5000/health"
echo "============================================================"
echo "Docker logları: sudo docker-compose logs -f"
echo "Durdurmak için: sudo docker-compose down"
echo "============================================================"
