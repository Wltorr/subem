@echo off
echo ============================================================
echo AWS EC2 AI Altyazi Backend - Hizli Kurulum
echo ============================================================
echo.

REM EC2 Public IP'yi al
set /p EC2_IP="EC2 Public IP'yi gir: "
set /p KEY_FILE="Key dosyasinin tam yolunu gir (.pem): "

echo.
echo EC2'ye baglaniyor...
ssh -i "%KEY_FILE%" ubuntu@%EC2_IP% "curl -fsSL https://raw.githubusercontent.com/your-repo/ai-subtitles/main/deploy/aws-setup.sh | bash"

echo.
echo ============================================================
echo KURULUM TAMAMLANDI!
echo ============================================================
echo Backend URL: http://%EC2_IP%:5000
echo Health Check: http://%EC2_IP%:5000/health
echo.
echo Panel'de API Endpoint olarak kullan: http://%EC2_IP%:5000
echo ============================================================
pause
