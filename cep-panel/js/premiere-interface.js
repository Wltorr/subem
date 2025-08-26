/**
 * Premiere Pro Interface - ExtendScript ile iletişim
 * Bu dosya Premiere Pro ile iletişim kurmak için gerekli fonksiyonları içerir.
 */

class PremiereInterface {
    constructor() {
        this.csInterface = new CSInterface();
        this.isConnected = false;
        this.checkConnection();
    }

    /**
     * Premiere Pro bağlantısını kontrol et
     */
    async checkConnection() {
        try {
            const result = await this.evalScript('app.name');
            this.isConnected = result && result.includes('Premiere Pro');
            return this.isConnected;
        } catch (error) {
            this.isConnected = false;
            return false;
        }
    }

    /**
     * ExtendScript çalıştır
     */
    evalScript(script) {
        return new Promise((resolve, reject) => {
            this.csInterface.evalScript(script, (result) => {
                if (result && result.startsWith('Error:')) {
                    reject(new Error(result));
                } else {
                    resolve(result);
                }
            });
        });
    }

    /**
     * Mevcut sequence bilgilerini al
     */
    async getCurrentSequence() {
        try {
            const script = `
                try {
                    var project = app.project;
                    if (project && project.activeSequence) {
                        var seq = project.activeSequence;
                        JSON.stringify({
                            success: true,
                            name: seq.name,
                            duration: seq.end.ticks,
                            tracks: seq.videoTracks.numTracks + seq.audioTracks.numTracks,
                            videoTracks: seq.videoTracks.numTracks,
                            audioTracks: seq.audioTracks.numTracks
                        });
                    } else {
                        JSON.stringify({
                            success: false,
                            error: "Aktif sequence bulunamadı"
                        });
                    }
                } catch (e) {
                    JSON.stringify({
                        success: false,
                        error: e.toString()
                    });
                }
            `;

            const result = await this.evalScript(script);
            const data = JSON.parse(result);
            
            if (data.success) {
                return {
                    success: true,
                    data: data
                };
            } else {
                return {
                    success: false,
                    error: data.error
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Sequence'den ses dışa aktar
     */
    async exportSequenceAudio() {
        try {
            const script = `
                try {
                    var project = app.project;
                    var sequence = project.activeSequence;
                    
                    if (!sequence) {
                        throw new Error("Aktif sequence bulunamadı");
                    }
                    
                    // Create export path
                    var projectPath = project.path;
                    var projectName = project.name.replace(/\\.[^/.]+$/, "");
                    var exportPath = projectPath + "/" + projectName + "_audio_export.wav";
                    
                    // Export settings
                    var exportSettings = new ExportWaveSettings();
                    exportSettings.sampleRate = 44100;
                    exportSettings.channels = 2;
                    exportSettings.bitDepth = 16;
                    
                    // Create encoder
                    var encoder = new WaveEncoder(exportSettings);
                    
                    // Export
                    sequence.exportAsMedia(exportPath, encoder, 1, 1);
                    
                    JSON.stringify({
                        success: true,
                        path: exportPath
                    });
                    
                } catch (e) {
                    JSON.stringify({
                        success: false,
                        error: e.toString()
                    });
                }
            `;

            const result = await this.evalScript(script);
            const data = JSON.parse(result);
            
            if (data.success) {
                return {
                    success: true,
                    data: data
                };
            } else {
                return {
                    success: false,
                    error: data.error
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Altyazıyı sequence'e import et
     */
    async importSubtitles(subtitlePath, format = 'srt') {
        try {
            const script = `
                try {
                    var project = app.project;
                    var sequence = project.activeSequence;
                    
                    if (!sequence) {
                        throw new Error("Aktif sequence bulunamadı");
                    }
                    
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
                    
                    JSON.stringify({
                        success: true,
                        path: subtitlePath
                    });
                    
                } catch (e) {
                    JSON.stringify({
                        success: false,
                        error: e.toString()
                    });
                }
            `;

            const result = await this.evalScript(script);
            const data = JSON.parse(result);
            
            if (data.success) {
                return {
                    success: true,
                    data: data
                };
            } else {
                return {
                    success: false,
                    error: data.error
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Caption track oluştur
     */
    async ensureCaptionTrack() {
        try {
            const script = `
                try {
                    var project = app.project;
                    var sequence = project.activeSequence;
                    
                    if (!sequence) {
                        throw new Error("Aktif sequence bulunamadı");
                    }
                    
                    if (sequence.captionTracks.numTracks === 0) {
                        sequence.captionTracks.addTrack();
                    }
                    
                    JSON.stringify({
                        success: true,
                        tracks: sequence.captionTracks.numTracks
                    });
                    
                } catch (e) {
                    JSON.stringify({
                        success: false,
                        error: e.toString()
                    });
                }
            `;

            const result = await this.evalScript(script);
            const data = JSON.parse(result);
            
            if (data.success) {
                return {
                    success: true,
                    data: data
                };
            } else {
                return {
                    success: false,
                    error: data.error
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Proje bilgilerini al
     */
    async getProjectInfo() {
        try {
            const script = `
                try {
                    var project = app.project;
                    
                    if (!project) {
                        throw new Error("Proje bulunamadı");
                    }
                    
                    JSON.stringify({
                        success: true,
                        name: project.name,
                        path: project.path,
                        sequences: project.sequences.numSequences,
                        activeSequence: project.activeSequence ? project.activeSequence.name : null
                    });
                    
                } catch (e) {
                    JSON.stringify({
                        success: false,
                        error: e.toString()
                    });
                }
            `;

            const result = await this.evalScript(script);
            const data = JSON.parse(result);
            
            if (data.success) {
                return {
                    success: true,
                    data: data
                };
            } else {
                return {
                    success: false,
                    error: data.error
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Projeyi kaydet
     */
    async saveProject() {
        try {
            const script = `
                try {
                    var project = app.project;
                    
                    if (!project) {
                        throw new Error("Proje bulunamadı");
                    }
                    
                    project.save();
                    
                    JSON.stringify({
                        success: true,
                        message: "Proje kaydedildi"
                    });
                    
                } catch (e) {
                    JSON.stringify({
                        success: false,
                        error: e.toString()
                    });
                }
            `;

            const result = await this.evalScript(script);
            const data = JSON.parse(result);
            
            if (data.success) {
                return {
                    success: true,
                    data: data
                };
            } else {
                return {
                    success: false,
                    error: data.error
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Global instance
window.premiereInterface = new PremiereInterface();
