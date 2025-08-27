/**
 * Adobe Premiere Pro AI Altyazı Eklentisi - ExtendScript
 * Bu dosya Premiere Pro ile iletişim kurmak için ExtendScript kodlarını içerir.
 */

// Global variables
var project = app.project;
var sequence = project ? project.activeSequence : null;

/**
 * Get current sequence information
 */
function getCurrentSequence() {
    try {
        if (!project) {
            return JSON.stringify({
                success: false,
                error: "Proje bulunamadı"
            });
        }
        
        if (!project.activeSequence) {
            return JSON.stringify({
                success: false,
                error: "Aktif sequence bulunamadı"
            });
        }
        
        var seq = project.activeSequence;
        return JSON.stringify({
            success: true,
            name: seq.name,
            duration: seq.end.ticks,
            tracks: seq.videoTracks.numTracks + seq.audioTracks.numTracks,
            videoTracks: seq.videoTracks.numTracks,
            audioTracks: seq.audioTracks.numTracks
        });
        
    } catch (e) {
        return JSON.stringify({
            success: false,
            error: e.toString()
        });
    }
}

/**
 * Export audio from current sequence
 */
function exportSequenceAudio() {
    try {
        if (!project || !project.activeSequence) {
            return JSON.stringify({
                success: false,
                error: "Aktif sequence bulunamadı"
            });
        }
        
        var sequence = project.activeSequence;
        var projectPath = project.path;
        var projectName = project.name.replace(/\.[^/.]+$/, "");
        
        // Create export path
        var exportPath = projectPath + "/" + projectName + "_audio_export.wav";
        
        // Export settings
        var exportSettings = new ExportWaveSettings();
        exportSettings.sampleRate = 44100;
        exportSettings.channels = 2;
        exportSettings.bitDepth = 16;
        
        // Create encoder
        var encoder = new WaveEncoder(exportSettings);
        
        // Export the sequence
        sequence.exportAsMedia(exportPath, encoder, 1, 1);
        
        return JSON.stringify({
            success: true,
            path: exportPath
        });
        
    } catch (e) {
        return JSON.stringify({
            success: false,
            error: e.toString()
        });
    }
}

/**
 * Import subtitles to sequence
 */
function importSubtitles(subtitlePath, format) {
    try {
        if (!project || !project.activeSequence) {
            return JSON.stringify({
                success: false,
                error: "Aktif sequence bulunamadı"
            });
        }
        
        var sequence = project.activeSequence;
        
        // Import subtitle file to project
        project.importFiles([subtitlePath], true, project.getInsertionBin(), false);
        
        if (format === "srt") {
            // For SRT files, create caption track
            if (sequence.captionTracks.numTracks === 0) {
                sequence.captionTracks.addTrack();
            }
            
            var captionTrack = sequence.captionTracks[0];
            captionTrack.importCaptions(subtitlePath, 1, 1);
            
        } else if (format === "xml") {
            // For XML files, import as sequence
            var importedSequence = project.importSequence(subtitlePath, project.getInsertionBin());
            if (importedSequence) {
                // Copy captions from imported sequence to current sequence
                if (importedSequence.captionTracks.numTracks > 0) {
                    if (sequence.captionTracks.numTracks === 0) {
                        sequence.captionTracks.addTrack();
                    }
                    
                    var sourceCaptionTrack = importedSequence.captionTracks[0];
                    var targetCaptionTrack = sequence.captionTracks[0];
                    
                    // Copy captions
                    for (var i = 0; i < sourceCaptionTrack.captions.numItems; i++) {
                        var caption = sourceCaptionTrack.captions[i];
                        targetCaptionTrack.captions.addCaption(caption.start, caption.end, caption.text);
                    }
                }
                
                // Remove imported sequence
                importedSequence.remove();
            }
        }
        
        return JSON.stringify({
            success: true,
            path: subtitlePath
        });
        
    } catch (e) {
        return JSON.stringify({
            success: false,
            error: e.toString()
        });
    }
}

/**
 * Create caption track if it doesn't exist
 */
function ensureCaptionTrack() {
    try {
        if (!project || !project.activeSequence) {
            return JSON.stringify({
                success: false,
                error: "Aktif sequence bulunamadı"
            });
        }
        
        var sequence = project.activeSequence;
        
        if (sequence.captionTracks.numTracks === 0) {
            sequence.captionTracks.addTrack();
        }
        
        return JSON.stringify({
            success: true,
            tracks: sequence.captionTracks.numTracks
        });
        
    } catch (e) {
        return JSON.stringify({
            success: false,
            error: e.toString()
        });
    }
}

/**
 * Get project information
 */
function getProjectInfo() {
    try {
        if (!project) {
            return JSON.stringify({
                success: false,
                error: "Proje bulunamadı"
            });
        }
        
        return JSON.stringify({
            success: true,
            name: project.name,
            path: project.path,
            sequences: project.sequences.numSequences,
            activeSequence: project.activeSequence ? project.activeSequence.name : null
        });
        
    } catch (e) {
        return JSON.stringify({
            success: false,
            error: e.toString()
        });
    }
}

/**
 * Save project
 */
function saveProject() {
    try {
        if (!project) {
            return JSON.stringify({
                success: false,
                error: "Proje bulunamadı"
            });
        }
        
        project.save();
        
        return JSON.stringify({
            success: true,
            message: "Proje kaydedildi"
        });
        
    } catch (e) {
        return JSON.stringify({
            success: false,
            error: e.toString()
        });
    }
}

/**
 * Get sequence tracks information
 */
function getSequenceTracks() {
    try {
        if (!project || !project.activeSequence) {
            return JSON.stringify({
                success: false,
                error: "Aktif sequence bulunamadı"
            });
        }
        
        var sequence = project.activeSequence;
        var tracks = {
            video: sequence.videoTracks.numTracks,
            audio: sequence.audioTracks.numTracks,
            captions: sequence.captionTracks.numTracks
        };
        
        return JSON.stringify({
            success: true,
            tracks: tracks
        });
        
    } catch (e) {
        return JSON.stringify({
            success: false,
            error: e.toString()
        });
    }
}

/**
 * Main function dispatcher
 */
function main() {
    try {
        var args = arguments[0];
        var functionName = args.function;
        var params = args.params || {};
        
        switch (functionName) {
            case 'getCurrentSequence':
                return getCurrentSequence();
            case 'exportSequenceAudio':
                return exportSequenceAudio();
            case 'importSubtitles':
                return importSubtitles(params.path, params.format);
            case 'ensureCaptionTrack':
                return ensureCaptionTrack();
            case 'getProjectInfo':
                return getProjectInfo();
            case 'saveProject':
                return saveProject();
            case 'getSequenceTracks':
                return getSequenceTracks();
            default:
                return JSON.stringify({
                    success: false,
                    error: "Bilinmeyen fonksiyon: " + functionName
                });
        }
    } catch (e) {
        return JSON.stringify({
            success: false,
            error: "Ana fonksiyon hatası: " + e.toString()
        });
    }
}

// Export functions for direct access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getCurrentSequence: getCurrentSequence,
        exportSequenceAudio: exportSequenceAudio,
        importSubtitles: importSubtitles,
        ensureCaptionTrack: ensureCaptionTrack,
        getProjectInfo: getProjectInfo,
        saveProject: saveProject,
        getSequenceTracks: getSequenceTracks,
        main: main
    };
}
