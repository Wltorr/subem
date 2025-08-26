@echo off
echo ============================================================
echo Adobe Premiere Pro AI Altyazi Eklentisi - Kurulum
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

REM Create virtual environment
echo.
echo Virtual environment olusturuluyor...
cd backend
python -m venv venv
if errorlevel 1 (
    echo HATA: Virtual environment olusturulamadi!
    pause
    exit /b 1
)

REM Activate virtual environment
echo Virtual environment aktiflestiriliyor...
call venv\Scripts\activate.bat

REM Install requirements
echo.
echo Python paketleri yukleniyor...
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

REM Create CEP directory
echo.
echo CEP klasoru olusturuluyor...
set CEP_DIR=%APPDATA%\Adobe\CEP\extensions\AI-Turkce-Altyazi
if not exist "%CEP_DIR%" (
    mkdir "%CEP_DIR%"
    echo CEP klasoru olusturuldu: %CEP_DIR%
) else (
    echo CEP klasoru zaten mevcut: %CEP_DIR%
)

REM Copy CEP panel files
echo.
echo CEP panel dosyalari kopyalaniyor...
xcopy /E /I /Y "..\cep-panel\*" "%CEP_DIR%"
if errorlevel 1 (
    echo HATA: CEP panel dosyalari kopyalanamadi!
    pause
    exit /b 1
)

echo CEP panel dosyalari basariyla kopyalandi!

REM Enable CEP debug mode
echo.
echo CEP debug modu etkinlestiriliyor...
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.9" /v PlayerDebugMode /t REG_DWORD /d 1 /f >nul 2>&1
if errorlevel 1 (
    echo UYARI: CEP debug modu etkinlestirilemedi!
    echo Manuel olarak etkinlestirin:
    echo HKEY_CURRENT_USER\Software\Adobe\CSXS.9
    echo PlayerDebugMode = 1
) else (
    echo CEP debug modu etkinlestirildi!
)

echo.
echo ============================================================
echo KURULUM TAMAMLANDI!
echo ============================================================
echo.
echo Sonraki adimlar:
echo 1. Backend'i baslatmak icin: cd backend && python run.py
echo 2. Premiere Pro'yu baslatin
echo 3. Window ^> Extensions ^> AI Turkce Altyazi panelini acin
echo.
echo Sorun yasarsaniz README.md dosyasini kontrol edin.
echo.
pause
