from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import tempfile
import whisper
from faster_whisper import WhisperModel
import srt
from datetime import timedelta
import xml.etree.ElementTree as ET
from xml.dom import minidom
import logging
import traceback
from logging.handlers import RotatingFileHandler

app = Flask(__name__)
CORS(app)

# Logging ayarları
if not os.path.exists('logs'):
    os.makedirs('logs')

# File handler for rotating logs
file_handler = RotatingFileHandler('logs/app.log', maxBytes=10240000, backupCount=10)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
))
file_handler.setLevel(logging.INFO)

# Console handler
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(logging.Formatter('%(levelname)s: %(message)s'))

# Root logger configuration
app.logger.addHandler(file_handler)
app.logger.addHandler(console_handler)
app.logger.setLevel(logging.INFO)

# Application logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Whisper model seçimi (tiny, base, small, medium, large)
WHISPER_MODEL = os.getenv('WHISPER_MODEL', 'base')
USE_FASTER_WHISPER = os.getenv('USE_FASTER_WHISPER', 'true').lower() == 'true'

# Model yükleme
model = None
try:
    logger.info(f"Whisper model yükleniyor: {WHISPER_MODEL}")
    if USE_FASTER_WHISPER:
        model = WhisperModel(WHISPER_MODEL, device="cpu", compute_type="int8")
        logger.info(f"Faster Whisper model yüklendi: {WHISPER_MODEL}")
    else:
        model = whisper.load_model(WHISPER_MODEL)
        logger.info(f"OpenAI Whisper model yüklendi: {WHISPER_MODEL}")
    logger.info("Model başarıyla yüklendi!")
except Exception as e:
    logger.error(f"Model yükleme hatası: {str(e)}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    logger.error("Lütfen model dosyalarının doğru konumda olduğundan emin olun.")
    logger.error("Faster Whisper kullanmayı deneyin: USE_FASTER_WHISPER=true")

def format_timestamp(seconds):
    """Saniyeyi SRT formatına çevir (00:00:00,000)"""
    try:
        td = timedelta(seconds=seconds)
        hours, remainder = divmod(td.total_seconds(), 3600)
        minutes, seconds = divmod(remainder, 60)
        milliseconds = int((seconds % 1) * 1000)
        return f"{int(hours):02d}:{int(minutes):02d}:{int(seconds):02d},{milliseconds:03d}"
    except Exception as e:
        logger.error(f"Timestamp format hatası: {e}")
        return "00:00:00,000"

def create_srt_subtitles(segments):
    """Whisper segments'lerinden SRT formatında altyazı oluştur"""
    try:
        subtitles = []
        for i, segment in enumerate(segments, 1):
            start_time = format_timestamp(segment.start)
            end_time = format_timestamp(segment.end)
            text = segment.text.strip()
            
            subtitle = srt.Subtitle(
                index=i,
                start=timedelta(seconds=segment.start),
                end=timedelta(seconds=segment.end),
                content=text
            )
            subtitles.append(subtitle)
        
        return srt.compose(subtitles)
    except Exception as e:
        logger.error(f"SRT oluşturma hatası: {e}")
        raise

def create_premiere_xml(segments, sequence_name="AI Generated Subtitles"):
    """Whisper segments'lerinden Premiere Pro XML formatında altyazı oluştur"""
    try:
        # Premiere Pro XML yapısı - Caption track olarak
        root = ET.Element("xmeml")
        root.set("version", "4")
        
        # Project element
        project = ET.SubElement(root, "project")
        
        # Sequence element
        sequence = ET.SubElement(project, "sequence")
        sequence.set("id", "sequence-1")
        
        # Sequence name
        name = ET.SubElement(sequence, "name")
        name.text = sequence_name
        
        # Media element
        media = ET.SubElement(sequence, "media")
        
        # Caption tracks
        captions = ET.SubElement(media, "captions")
        
        # Caption track
        caption_track = ET.SubElement(captions, "caption_track")
        caption_track.set("id", "caption-track-1")
        
        # Her segment için caption oluştur
        for i, segment in enumerate(segments):
            caption = ET.SubElement(caption_track, "caption")
            caption.set("id", f"caption-{i+1}")
            
            # Start time (Premiere timebase: 254016000000 ticks per second)
            start = ET.SubElement(caption, "start")
            start.text = str(int(segment.start * 254016000000))
            
            # End time
            end = ET.SubElement(caption, "end")
            end.text = str(int(segment.end * 254016000000))
            
            # Text content
            text = ET.SubElement(caption, "text")
            text.text = segment.text.strip()
            
            # Caption properties
            properties = ET.SubElement(caption, "properties")
            
            # Font properties
            font_prop = ET.SubElement(properties, "property")
            font_prop.set("id", "font")
            font_prop.text = "Arial"
            
            # Size properties
            size_prop = ET.SubElement(properties, "property")
            size_prop.set("id", "size")
            size_prop.text = "24"
            
            # Color properties
            color_prop = ET.SubElement(properties, "property")
            color_prop.set("id", "color")
            color_prop.text = "FFFFFF"
        
        # XML'i güzel formatla
        rough_string = ET.tostring(root, 'utf-8')
        reparsed = minidom.parseString(rough_string)
        return reparsed.toprettyxml(indent="  ")
    except Exception as e:
        logger.error(f"XML oluşturma hatası: {e}")
        raise

@app.route('/health', methods=['GET'])
def health_check():
    """API sağlık kontrolü"""
    try:
        model_status = "loaded" if model else "error"
        status = "healthy" if model else "error"
        
        response_data = {
            "status": status,
            "model": WHISPER_MODEL,
            "faster_whisper": USE_FASTER_WHISPER,
            "model_status": model_status,
            "timestamp": str(timedelta())
        }
        
        logger.info(f"Health check: {status}")
        return jsonify(response_data)
    except Exception as e:
        logger.error(f"Health check hatası: {e}")
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    """Ses dosyasını transkribe et ve altyazı oluştur"""
    if not model:
        logger.error("Transcribe isteği reddedildi: Model yüklenemedi")
        return jsonify({"error": "Whisper modeli yüklenemedi"}), 500
    
    temp_audio_path = None
    output_temp_path = None
    
    try:
        if 'audio' not in request.files:
            logger.warning("Transcribe isteği: Ses dosyası bulunamadı")
            return jsonify({"error": "Ses dosyası bulunamadı"}), 400
        
        audio_file = request.files['audio']
        output_format = request.form.get('format', 'srt')  # srt veya xml
        
        if audio_file.filename == '':
            logger.warning("Transcribe isteği: Dosya seçilmedi")
            return jsonify({"error": "Dosya seçilmedi"}), 400
        
        logger.info(f"Transcribe başlatılıyor: {audio_file.filename}, format: {output_format}")
        
        # Geçici dosya oluştur
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            audio_file.save(temp_file.name)
            temp_audio_path = temp_file.name
        
        logger.info(f"Ses dosyası kaydedildi: {temp_audio_path}")
        
        # Whisper ile transkribe et
        logger.info("Transkripsiyon başlatılıyor...")
        
        if USE_FASTER_WHISPER:
            segments, info = model.transcribe(
                temp_audio_path,
                language="tr",  # Türkçe
                beam_size=5,
                word_timestamps=True
            )
            # Generator'ı listeye çevir
            segments = list(segments)
            logger.info(f"Faster Whisper transkripsiyon tamamlandı: {len(segments)} segment")
        else:
            result = model.transcribe(temp_audio_path, language="tr")
            segments = result["segments"]
            logger.info(f"OpenAI Whisper transkripsiyon tamamlandı: {len(segments)} segment")
        
        # Format'a göre çıktı oluştur
        if output_format.lower() == 'xml':
            output_content = create_premiere_xml(segments)
            filename = "subtitles.xml"
            mimetype = "application/xml"
        else:  # SRT format
            output_content = create_srt_subtitles(segments)
            filename = "subtitles.srt"
            mimetype = "text/plain"
        
        # Geçici dosya oluştur
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix=f'.{output_format}', encoding='utf-8') as output_file:
            output_file.write(output_content)
            output_temp_path = output_file.name
        
        logger.info(f"Altyazı dosyası oluşturuldu: {filename} ({len(output_content)} karakter)")
        
        return send_file(
            output_temp_path,
            as_attachment=True,
            download_name=filename,
            mimetype=mimetype
        )
        
    except Exception as e:
        logger.error(f"Transkripsiyon hatası: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": f"Transkripsiyon hatası: {str(e)}"}), 500
        
    finally:
        # Geçici dosyaları temizle
        try:
            if temp_audio_path and os.path.exists(temp_audio_path):
                os.unlink(temp_audio_path)
                logger.debug(f"Geçici ses dosyası silindi: {temp_audio_path}")
            
            if output_temp_path and os.path.exists(output_temp_path):
                os.unlink(output_temp_path)
                logger.debug(f"Geçici çıktı dosyası silindi: {output_temp_path}")
        except Exception as cleanup_error:
            logger.warning(f"Geçici dosya temizleme hatası: {cleanup_error}")

@app.route('/models', methods=['GET'])
def get_available_models():
    """Kullanılabilir Whisper modellerini listele"""
    try:
        models = ["tiny", "base", "small", "medium", "large"]
        
        response_data = {
            "current_model": WHISPER_MODEL,
            "available_models": models,
            "faster_whisper": USE_FASTER_WHISPER,
            "model_loaded": model is not None,
            "recommended_model": "base"
        }
        
        logger.info(f"Models endpoint çağrıldı: {WHISPER_MODEL}")
        return jsonify(response_data)
    except Exception as e:
        logger.error(f"Models endpoint hatası: {e}")
        return jsonify({"error": str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    """404 hata sayfası"""
    logger.warning(f"404 hatası: {request.url}")
    return jsonify({"error": "Endpoint bulunamadı"}), 404

@app.errorhandler(500)
def internal_error(error):
    """500 hata sayfası"""
    logger.error(f"500 hatası: {error}")
    return jsonify({"error": "Sunucu hatası"}), 500

@app.errorhandler(Exception)
def handle_exception(e):
    """Genel hata yakalayıcı"""
    logger.error(f"Beklenmeyen hata: {e}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    return jsonify({"error": "Beklenmeyen hata oluştu"}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'
    
    logger.info("=" * 60)
    logger.info("Adobe Premiere Pro AI Altyazı Eklentisi - Backend")
    logger.info("=" * 60)
    logger.info(f"Port: {port}")
    logger.info(f"Debug: {debug}")
    logger.info(f"Whisper Model: {WHISPER_MODEL}")
    logger.info(f"Faster Whisper: {USE_FASTER_WHISPER}")
    logger.info(f"Model Durumu: {'Yüklendi' if model else 'Hata'}")
    logger.info("=" * 60)
    
    try:
        app.run(host='0.0.0.0', port=port, debug=debug)
    except Exception as e:
        logger.error(f"Sunucu başlatma hatası: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
