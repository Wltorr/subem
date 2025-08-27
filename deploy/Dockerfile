FROM python:3.10-slim

# Sistem güncellemeleri ve FFmpeg kurulumu
RUN apt-get update && apt-get install -y \
    ffmpeg \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Çalışma dizini
WORKDIR /app

# Python bağımlılıkları
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Uygulama dosyaları
COPY app.py .
COPY run.py .

# Port
EXPOSE 5000

# Environment variables
ENV WHISPER_MODEL=base
ENV USE_FASTER_WHISPER=true
ENV DEBUG=false
ENV PORT=5000

# Uygulamayı başlat
CMD ["python", "run.py"]

