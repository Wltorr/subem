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

app = Flask(__name__)
CORS(app)

# Logging ayarları
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Whisper model seçimi (tiny, base, small, medium, large)
WHISPER_MODEL = os.getenv('WHISPER_MODEL', 'base')
USE_FASTER_WHISPER = os.getenv('USE_FASTER_WHISPER', 'true').lower() == 'true'

# Model yükleme
logger.info(f"Whisper model yükleniyor: {WHISPER_MODEL}")
if USE_FASTER_WHISPER:
    model = WhisperModel(WHISPER_MODEL, device="cpu", compute_type="int8")
else:
    model = whisper.load_model(WHISPER_MODEL)
logger.info("Model yüklendi!")

def format_timestamp(seconds):
    """Saniyeyi SRT formatına çevir (00:00:00,000)"""
    td = timedelta(seconds=seconds)
    hours, remainder = divmod(td.total_seconds(), 3600)
    minutes, seconds = divmod(remainder, 60)
    milliseconds = int((seconds % 1) * 1000)
    return f"{int(hours):02d}:{int(minutes):02d}:{int(seconds):02d},{milliseconds:03d}"

def create_srt_subtitles(segments):
    """Whisper segments'lerinden SRT formatında altyazı oluştur"""
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

def create_premiere_xml(segments, sequence_name="AI Generated Subtitles"):
    """Whisper segments'lerinden Premiere Pro XML formatında altyazı oluştur"""
    # Premiere Pro XML yapısı
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
    
    # Video element
    video = ET.SubElement(media, "video")
    
    # Track element
    track = ET.SubElement(video, "track")
    
    # Her segment için clip oluştur
    for i, segment in enumerate(segments):
        clipitem = ET.SubElement(track, "clipitem")
        clipitem.set("id", f"clipitem-{i+1}")
        
        # Name
        name = ET.SubElement(clipitem, "name")
        name.text = f"Subtitle {i+1}"
        
        # Duration
        duration = ET.SubElement(clipitem, "duration")
        duration.text = str(int((segment.end - segment.start) * 254016000000))  # Premiere timebase
        
        # Start
        start = ET.SubElement(clipitem, "start")
        start.text = str(int(segment.start * 254016000000))
        
        # End
        end = ET.SubElement(clipitem, "end")
        end.text = str(int(segment.end * 254016000000))
        
        # In
        in_point = ET.SubElement(clipitem, "in")
        in_point.text = "0"
        
        # Out
        out_point = ET.SubElement(clipitem, "out")
        out_point.text = str(int((segment.end - segment.start) * 254016000000))
        
        # File element
        file_elem = ET.SubElement(clipitem, "file")
        file_elem.set("id", f"file-{i+1}")
        
        # File name
        file_name = ET.SubElement(file_elem, "name")
        file_name.text = f"subtitle_{i+1}.txt"
        
        # Pathurl
        pathurl = ET.SubElement(file_elem, "pathurl")
        pathurl.text = f"file://localhost/C:/temp/subtitle_{i+1}.txt"
        
        # Properties
        properties = ET.SubElement(file_elem, "properties")
        
        # Property
        property_elem = ET.SubElement(properties, "property")
        property_elem.set("id", "text")
        property_elem.text = segment.text.strip()
    
    # XML'i güzel formatla
    rough_string = ET.tostring(root, 'utf-8')
    reparsed = minidom.parseString(rough_string)
    return reparsed.toprettyxml(indent="  ")

@app.route('/health', methods=['GET'])
def health_check():
    """API sağlık kontrolü"""
    return jsonify({
        "status": "healthy",
        "model": WHISPER_MODEL,
        "faster_whisper": USE_FASTER_WHISPER
    })

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    """Ses dosyasını transkribe et ve altyazı oluştur"""
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "Ses dosyası bulunamadı"}), 400
        
        audio_file = request.files['audio']
        output_format = request.form.get('format', 'srt')  # srt veya xml
        
        if audio_file.filename == '':
            return jsonify({"error": "Dosya seçilmedi"}), 400
        
        # Geçici dosya oluştur
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            audio_file.save(temp_file.name)
            temp_audio_path = temp_file.name
        
        try:
            logger.info(f"Ses dosyası transkribe ediliyor: {audio_file.filename}")
            
            # Whisper ile transkribe et
            if USE_FASTER_WHISPER:
                segments, info = model.transcribe(
                    temp_audio_path,
                    language="tr",  # Türkçe
                    beam_size=5,
                    word_timestamps=True
                )
                # Generator'ı listeye çevir
                segments = list(segments)
            else:
                result = model.transcribe(temp_audio_path, language="tr")
                segments = result["segments"]
            
            logger.info(f"Transkripsiyon tamamlandı. {len(segments)} segment bulundu.")
            
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
            
            logger.info(f"Altyazı dosyası oluşturuldu: {filename}")
            
            return send_file(
                output_temp_path,
                as_attachment=True,
                download_name=filename,
                mimetype=mimetype
            )
            
        finally:
            # Geçici dosyaları temizle
            if os.path.exists(temp_audio_path):
                os.unlink(temp_audio_path)
            if 'output_temp_path' in locals() and os.path.exists(output_temp_path):
                os.unlink(output_temp_path)
                
    except Exception as e:
        logger.error(f"Transkripsiyon hatası: {str(e)}")
        return jsonify({"error": f"Transkripsiyon hatası: {str(e)}"}), 500

@app.route('/models', methods=['GET'])
def get_available_models():
    """Kullanılabilir Whisper modellerini listele"""
    models = ["tiny", "base", "small", "medium", "large"]
    return jsonify({
        "current_model": WHISPER_MODEL,
        "available_models": models,
        "faster_whisper": USE_FASTER_WHISPER
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'
    
    logger.info(f"Flask uygulaması başlatılıyor...")
    logger.info(f"Port: {port}")
    logger.info(f"Debug: {debug}")
    logger.info(f"Whisper Model: {WHISPER_MODEL}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
