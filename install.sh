#!/bin/bash

echo "============================================================"
echo "Adobe Premiere Pro AI Altyazi Eklentisi - Kurulum"
echo "============================================================"
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "HATA: Python3 bulunamadi! Lutfen Python 3.8+ yukleyin."
    echo "https://www.python.org/downloads/"
    exit 1
fi

echo "Python bulundu!"
python3 --version

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo "HATA: pip3 bulunamadi! Python kurulumunu kontrol edin."
    exit 1
fi

echo "pip3 bulundu!"

# Create virtual environment
echo
echo "Virtual environment olusturuluyor..."
cd backend
python3 -m venv venv
if [ $? -ne 0 ]; then
    echo "HATA: Virtual environment olusturulamadi!"
    exit 1
fi

# Activate virtual environment
echo "Virtual environment aktiflestiriliyor..."
source venv/bin/activate

# Install requirements
echo
echo "Python paketleri yukleniyor..."
pip3 install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "HATA: Paketler yuklenemedi!"
    exit 1
fi

echo
echo "Python paketleri basariyla yuklendi!"

# Check FFmpeg
echo
echo "FFmpeg kontrol ediliyor..."
if ! command -v ffmpeg &> /dev/null; then
    echo "UYARI: FFmpeg bulunamadi!"
    echo "Lutfen FFmpeg yukleyin:"
    echo "macOS: brew install ffmpeg"
    echo "Linux: sudo apt install ffmpeg"
    echo
else
    echo "FFmpeg bulundu!"
fi

# Create CEP directory
echo
echo "CEP klasoru olusturuluyor..."
CEP_DIR="$HOME/Library/Application Support/Adobe/CEP/extensions/AI-Turkce-Altyazi"
mkdir -p "$CEP_DIR"
echo "CEP klasoru olusturuldu: $CEP_DIR"

# Copy CEP panel files
echo
echo "CEP panel dosyalari kopyalaniyor..."
cp -r "../cep-panel/"* "$CEP_DIR/"
if [ $? -ne 0 ]; then
    echo "HATA: CEP panel dosyalari kopyalanamadi!"
    exit 1
fi

echo "CEP panel dosyalari basariyla kopyalandi!"

# Enable CEP debug mode (macOS)
echo
echo "CEP debug modu etkinlestiriliyor..."
defaults write com.adobe.CSXS.9 PlayerDebugMode 1
if [ $? -ne 0 ]; then
    echo "UYARI: CEP debug modu etkinlestirilemedi!"
    echo "Manuel olarak etkinlestirin:"
    echo "defaults write com.adobe.CSXS.9 PlayerDebugMode 1"
else
    echo "CEP debug modu etkinlestirildi!"
fi

echo
echo "============================================================"
echo "KURULUM TAMAMLANDI!"
echo "============================================================"
echo
echo "Sonraki adimlar:"
echo "1. Backend'i baslatmak icin: cd backend && python3 run.py"
echo "2. Premiere Pro'yu baslatin"
echo "3. Window > Extensions > AI Turkce Altyazi panelini acin"
echo
echo "Sorun yasarsaniz README.md dosyasini kontrol edin."
echo
