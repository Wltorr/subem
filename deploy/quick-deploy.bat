@echo off
echo ============================================================
echo Adobe Premiere Pro AI Altyazi Eklentisi - Hizli Kurulum
echo ============================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo HATA: Python bulunamadi! Lutfen Python 3.8+ yukleyin.
    echo https://www.python.org/downloads/
    pause
    exit /b 1
)

echo Python bulundu!
python --version

REM Check if pip is available
pip --version >nul 2>&1
if errorlevel 1 (
    echo HATA: pip bulunamadi! Python kurulumunu kontrol edin.
    pause
    exit /b 1
)

echo pip bulundu!

REM Create virtual environment if it doesn't exist
if not exist "..\backend\venv" (
    echo.
    echo Virtual environment olusturuluyor...
    cd ..\backend
    python -m venv venv
    if errorlevel 1 (
        echo HATA: Virtual environment olusturulamadi!
        pause
        exit /b 1
    )
    echo Virtual environment olusturuldu!
) else (
    echo Virtual environment zaten mevcut.
)

REM Activate virtual environment
echo Virtual environment aktiflestiriliyor...
cd ..\backend
call venv\Scripts\activate.bat

REM Install/upgrade requirements
echo.
echo Python paketleri yukleniyor/guncelleniyor...
pip install --upgrade pip
pip install -r requirements.txt
if errorlevel 1 (
    echo HATA: Paketler yuklenemedi!
    pause
    exit /b 1
)

echo.
echo Python paketleri basariyla yuklendi!

REM Check FFmpeg
echo.
echo FFmpeg kontrol ediliyor...
ffmpeg -version >nul 2>&1
if errorlevel 1 (
    echo UYARI: FFmpeg bulunamadi!
    echo Lutfen FFmpeg yukleyin: https://ffmpeg.org/download.html
    echo Veya Chocolatey ile: choco install ffmpeg
    echo.
) else (
    echo FFmpeg bulundu!
)

REM Set environment variables
echo.
echo Environment variables ayarlaniyor...
set WHISPER_MODEL=base
set USE_FASTER_WHISPER=true
set DEBUG=true
set PORT=5000

echo WHISPER_MODEL=%WHISPER_MODEL%
echo USE_FASTER_WHISPER=%USE_FASTER_WHISPER%
echo DEBUG=%DEBUG%
echo PORT=%PORT%

REM Start the backend
echo.
echo ============================================================
echo BACKEND BASLATILIYOR!
echo ============================================================
echo.
echo Backend baslatildi: http://localhost:%PORT%
echo Durdurmak icin Ctrl+C basin
echo.
echo CEP paneli icin:
echo 1. Premiere Pro'yu baslatin
echo 2. Window > Extensions > AI Turkce Altyazi panelini acin
echo.
echo ============================================================

python run.py

pause

