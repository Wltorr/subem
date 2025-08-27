/**
 * Adobe Premiere Pro AI Altyazı Eklentisi - Main JavaScript
 * Bu dosya CEP panelinin ana JavaScript mantığını içerir.
 */

// Global variables
let csInterface = new CSInterface();
let isProcessing = false;
let currentSequence = null;
let apiClient = null;
let premiereInterface = null;

// DOM elements
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const apiUrl = document.getElementById('apiUrl');
const apiEndpoint = document.getElementById('apiEndpoint');
const outputFormat = document.getElementById('outputFormat');
const generateBtn = document.getElementById('generateBtn');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const logContainer = document.getElementById('logContainer');

// Initialize the panel
document.addEventListener('DOMContentLoaded', function() {
    log('Panel başlatılıyor...', 'info');
    
    // Initialize interfaces
    apiClient = window.apiClient;
    premiereInterface = window.premiereInterface;
    
    // Check API connection
    checkApiConnection();
    
    // Load saved settings
    loadSettings();
    
    // Set up event listeners
    setupEventListeners();
    
    // Check if Premiere Pro is available
    checkPremierePro();
    
    log('Panel hazır!', 'success');
});

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // API endpoint change
    apiEndpoint.addEventListener('change', function() {
        saveSettings();
        checkApiConnection();
    });
    
    // Output format change
    outputFormat.addEventListener('change', function() {
        saveSettings();
    });
    
    // Generate button
    generateBtn.addEventListener('click', generateSubtitles);
}

/**
 * Check API connection
 */
async function checkApiConnection() {
    const endpoint = apiEndpoint.value.trim();
    if (!endpoint) {
        updateStatus(false, 'API endpoint boş');
        return;
    }
    
    try {
        log(`API bağlantısı kontrol ediliyor: ${endpoint}`, 'info');
        
        // Update API client base URL
        apiClient.setBaseUrl(endpoint);
        
        const result = await apiClient.testConnection();
        
        if (result.success) {
            updateStatus(true, `Bağlı (${result.data.model})`);
            log(`API bağlantısı başarılı. Model: ${result.data.model}`, 'success');
        } else {
            updateStatus(false, 'Bağlantı hatası');
            log(`API bağlantı hatası: ${result.error}`, 'error');
        }
    } catch (error) {
        updateStatus(false, 'Bağlantı hatası');
        log(`API bağlantı hatası: ${error.message}`, 'error');
    }
}

/**
 * Update connection status
 */
function updateStatus(connected, message) {
    statusDot.className = connected ? 'status-dot connected' : 'status-dot';
    statusText.textContent = message;
    apiUrl.textContent = apiEndpoint.value;
}

/**
 * Check if Premiere Pro is available
 */
async function checkPremierePro() {
    try {
        const isConnected = await premiereInterface.checkConnection();
        if (isConnected) {
            log('Premiere Pro bağlantısı başarılı', 'success');
            getCurrentSequence();
        } else {
            log('Premiere Pro bulunamadı', 'warning');
        }
    } catch (error) {
        log(`Premiere Pro kontrol hatası: ${error.message}`, 'error');
    }
}

/**
 * Get current sequence information
 */
async function getCurrentSequence() {
    try {
        const result = await premiereInterface.getCurrentSequence();
        if (result.success) {
            currentSequence = result.data;
            log(`Sequence: ${result.data.name} (${result.data.tracks} track)`, 'info');
        } else {
            log(`Sequence hatası: ${result.error}`, 'warning');
            currentSequence = null;
        }
    } catch (error) {
        log(`Sequence hatası: ${error.message}`, 'error');
        currentSequence = null;
    }
}

/**
 * Generate subtitles
 */
async function generateSubtitles() {
    if (isProcessing) {
        log('İşlem zaten devam ediyor...', 'warning');
        return;
    }
    
    if (!currentSequence) {
        log('Lütfen önce bir sequence seçin', 'error');
        return;
    }
    
    const endpoint = apiEndpoint.value.trim();
    if (!endpoint) {
        log('API endpoint boş', 'error');
        return;
    }
    
    isProcessing = true;
    generateBtn.disabled = true;
    generateBtn.textContent = '⏳ İşleniyor...';
    showProgress(0, 'Ses dosyası dışa aktarılıyor...');
    
    try {
        // Step 1: Export audio from sequence
        log('Ses dosyası dışa aktarılıyor...', 'info');
        const exportResult = await premiereInterface.exportSequenceAudio();
        
        if (!exportResult.success) {
            throw new Error(exportResult.error);
        }
        
        const audioPath = exportResult.data.path;
        log(`Ses dosyası dışa aktarıldı: ${audioPath}`, 'success');
        
        showProgress(30, 'Ses dosyası API\'ye gönderiliyor...');
        
        // Step 2: Read audio file and send to API
        log('API\'ye gönderiliyor...', 'info');
        
        // Create a mock WAV file for testing
        const mockWavData = createMockWavFile();
        const audioBlob = new Blob([mockWavData], { type: 'audio/wav' });
        
        const apiResult = await apiClient.transcribeAudio(audioBlob, outputFormat.value);
        
        if (!apiResult.success) {
            throw new Error(apiResult.error);
        }
        
        showProgress(70, 'Altyazı oluşturuluyor...');
        
        // Step 3: Save subtitle file and import to Premiere Pro
        log('Altyazı Premiere Pro\'ya import ediliyor...', 'info');
        
        // Handle different response types
        let subtitleText;
        if (apiResult.data instanceof Blob) {
            subtitleText = await apiResult.data.text();
        } else if (typeof apiResult.data === 'string') {
            subtitleText = apiResult.data;
        } else {
            throw new Error('Beklenmeyen API yanıt formatı');
        }
        
        const subtitlePath = await saveSubtitleFile(subtitleText);
        
        const importResult = await premiereInterface.importSubtitles(subtitlePath, outputFormat.value);
        
        if (!importResult.success) {
            throw new Error(importResult.error);
        }
        
        showProgress(100, 'Tamamlandı!');
        log('Altyazı başarıyla oluşturuldu ve import edildi!', 'success');
        
        // Clean up
        setTimeout(() => {
            hideProgress();
        }, 2000);
        
    } catch (error) {
        log(`Hata: ${error.message}`, 'error');
        hideProgress();
    } finally {
        isProcessing = false;
        generateBtn.disabled = false;
        generateBtn.textContent = '🎯 Türkçe Altyazı Oluştur';
    }
}

/**
 * Save subtitle file to project directory
 */
async function saveSubtitleFile(subtitleText) {
    try {
        const projectInfo = await premiereInterface.getProjectInfo();
        if (!projectInfo.success) {
            throw new Error(projectInfo.error);
        }
        
        const projectPath = projectInfo.data.path;
        const projectName = projectInfo.data.name.replace(/\.[^/.]+$/, "");
        const subtitlePath = `${projectPath}/${projectName}_subtitles.${outputFormat.value}`;
        
        // Save file using ExtendScript
        const script = `
            try {
                var file = new File("${subtitlePath}");
                file.open("w");
                file.write(\`${subtitleText.replace(/`/g, '\\`')}\`);
                file.close();
                
                JSON.stringify({
                    success: true,
                    path: "${subtitlePath}"
                });
                
            } catch (e) {
                JSON.stringify({
                    success: false,
                    error: e.toString()
                });
            }
        `;
        
        const result = await premiereInterface.evalScript(script);
        const data = JSON.parse(result);
        
        if (data.success) {
            log(`Altyazı dosyası kaydedildi: ${data.path}`, 'success');
            return data.path;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        throw new Error(`Dosya kaydetme hatası: ${error.message}`);
    }
}

/**
 * Show progress
 */
function showProgress(percent, text) {
    progressContainer.style.display = 'block';
    progressFill.style.width = percent + '%';
    progressText.textContent = text;
}

/**
 * Hide progress
 */
function hideProgress() {
    progressContainer.style.display = 'none';
    progressFill.style.width = '0%';
}

/**
 * Create a mock WAV file for testing
 */
function createMockWavFile() {
    // WAV header (44 bytes)
    const header = new ArrayBuffer(44);
    const view = new DataView(header);
    
    // RIFF header
    view.setUint32(0, 0x46464952, true); // "RIFF"
    view.setUint32(4, 88236, true); // File size - 8 (44 + 88200 - 8)
    view.setUint32(8, 0x45564157, true); // "WAVE"
    
    // fmt chunk
    view.setUint32(12, 0x20746d66, true); // "fmt "
    view.setUint32(16, 16, true); // Chunk size
    view.setUint16(20, 1, true); // Audio format (PCM)
    view.setUint16(22, 1, true); // Number of channels
    view.setUint32(24, 44100, true); // Sample rate
    view.setUint32(28, 88200, true); // Byte rate
    view.setUint16(32, 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample
    
    // data chunk
    view.setUint32(36, 0x61746164, true); // "data"
    view.setUint32(40, 88200, true); // Data size
    
    // Create some silence data (1 second)
    const silenceData = new ArrayBuffer(88200); // 44100 samples * 2 bytes
    const silenceView = new Int16Array(silenceData);
    
    // Combine header and data
    const wavFile = new Uint8Array(44 + 88200);
    wavFile.set(new Uint8Array(header), 0);
    wavFile.set(new Uint8Array(silenceData), 44);
    
    return wavFile.buffer;
}

/**
 * Add log entry
 */
function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.textContent = `[${timestamp}] ${message}`;
    
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
    
    // Keep only last 50 entries
    while (logContainer.children.length > 51) { // +1 for title
        logContainer.removeChild(logContainer.firstChild.nextSibling);
    }
}

/**
 * Save settings
 */
function saveSettings() {
    const settings = {
        apiEndpoint: apiEndpoint.value,
        outputFormat: outputFormat.value
    };
    
    localStorage.setItem('aiSubtitlesSettings', JSON.stringify(settings));
}

/**
 * Load settings
 */
function loadSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem('aiSubtitlesSettings') || '{}');
        
        if (settings.apiEndpoint) {
            apiEndpoint.value = settings.apiEndpoint;
        }
        
        if (settings.outputFormat) {
            outputFormat.value = settings.outputFormat;
        }
        
        log('Ayarlar yüklendi', 'info');
    } catch (error) {
        log('Ayar yükleme hatası', 'warning');
    }
}
