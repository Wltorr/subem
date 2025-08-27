/**
 * CSInterface.js - Adobe CEP Interface
 * Bu dosya Adobe CEP (Common Extensibility Platform) için gerekli interface'i sağlar.
 * Adobe'nin resmi CSInterface.js dosyasının uyumlu versiyonudur.
 */

function CSInterface() {
    // Check if we're in a real CEP environment
    var isCEP = typeof __adobe_cep__ !== 'undefined';
    
    this.evalScript = function(script, callback) {
        if (typeof callback !== 'function') {
            console.error('CSInterface.evalScript: callback function required');
            return;
        }
        
        if (isCEP) {
            // Real CEP environment
            try {
                __adobe_cep__.evalScript(script, callback);
            } catch (error) {
                console.error('CSInterface.evalScript error:', error);
                callback("Error: " + error.message);
            }
        } else {
            // Development/testing environment - use mock responses
            console.warn('CSInterface: Running in mock mode - not in CEP environment');
            setTimeout(function() {
                try {
                    var result;
                    if (script.includes('app.name')) {
                        result = "Premiere Pro";
                    } else if (script.includes('app.project')) {
                        result = JSON.stringify({
                            success: true,
                            name: "Test Sequence",
                            duration: 1000000,
                            tracks: 2,
                            videoTracks: 1,
                            audioTracks: 1
                        });
                    } else if (script.includes('exportAsMedia') || script.includes('ExportWaveSettings')) {
                        result = JSON.stringify({
                            success: true,
                            path: "C:/Users/emirhan/Desktop/test_audio_export.wav"
                        });
                    } else if (script.includes('project.name') && script.includes('project.path')) {
                        result = JSON.stringify({
                            success: true,
                            name: "Test Project",
                            path: "C:/Users/emirhan/Desktop",
                            sequences: 1,
                            activeSequence: "Test Sequence"
                        });
                    } else if (script.includes('new File') && script.includes('open')) {
                        result = JSON.stringify({
                            success: true,
                            path: "C:/Users/emirhan/Desktop/Test_Project_subtitles.srt"
                        });
                    } else if (script.includes('importFiles') || script.includes('importCaptions')) {
                        result = JSON.stringify({
                            success: true,
                            path: "C:/Users/emirhan/Desktop/Test_Project_subtitles.srt"
                        });
                    } else {
                        result = JSON.stringify({
                            success: true,
                            message: "Mock response"
                        });
                    }
                    callback(result);
                } catch (error) {
                    callback("Error: " + error.message);
                }
            }, 100);
        }
    };
    
    this.getSystemPath = function(pathType) {
        if (isCEP) {
            try {
                return __adobe_cep__.getSystemPath(pathType);
            } catch (error) {
                console.error('CSInterface.getSystemPath error:', error);
                return '';
            }
        } else {
            // Mock paths for development
            switch (pathType) {
                case 'userData':
                    return 'C:/Users/User/AppData/Roaming/Adobe/CEP/extensions';
                case 'commonFiles':
                    return 'C:/Program Files/Common Files/Adobe/CEP/extensions';
                default:
                    return '';
            }
        }
    };
    
    this.getApplicationID = function() {
        if (isCEP) {
            try {
                return __adobe_cep__.getApplicationID();
            } catch (error) {
                console.error('CSInterface.getApplicationID error:', error);
                return 'PPRO';
            }
        } else {
            return 'PPRO';
        }
    };
    
    this.getApplicationVersion = function() {
        if (isCEP) {
            try {
                return __adobe_cep__.getApplicationVersion();
            } catch (error) {
                console.error('CSInterface.getApplicationVersion error:', error);
                return '24.0.0';
            }
        } else {
            return '24.0.0';
        }
    };
    
    this.getHostEnvironment = function() {
        if (isCEP) {
            try {
                return __adobe_cep__.getHostEnvironment();
            } catch (error) {
                console.error('CSInterface.getHostEnvironment error:', error);
                return this.getMockHostEnvironment();
            }
        } else {
            return this.getMockHostEnvironment();
        }
    };
    
    this.getMockHostEnvironment = function() {
        return {
            appName: 'Premiere Pro',
            appVersion: '24.0.0',
            appLocale: 'en_US',
            appUILocale: 'en_US',
            appId: 'PPRO',
            isAppOnline: true,
            appSkinInfo: {
                panelBackgroundColor: {
                    color: {
                        red: 0.2,
                        green: 0.2,
                        blue: 0.2
                    }
                }
            }
        };
    };
    
    this.closeExtension = function() {
        if (isCEP) {
            try {
                __adobe_cep__.closeExtension();
            } catch (error) {
                console.error('CSInterface.closeExtension error:', error);
            }
        } else {
            console.log('Extension closing...');
        }
    };
    
    this.requestOpenExtension = function(extensionId, params) {
        if (isCEP) {
            try {
                __adobe_cep__.requestOpenExtension(extensionId, params);
            } catch (error) {
                console.error('CSInterface.requestOpenExtension error:', error);
            }
        } else {
            console.log('Requesting to open extension:', extensionId);
        }
    };
    
    this.getExtensions = function(extensionIds) {
        if (isCEP) {
            try {
                return __adobe_cep__.getExtensions(extensionIds);
            } catch (error) {
                console.error('CSInterface.getExtensions error:', error);
                return [];
            }
        } else {
            return [];
        }
    };
    
    this.getNetworkPreferences = function() {
        if (isCEP) {
            try {
                return __adobe_cep__.getNetworkPreferences();
            } catch (error) {
                console.error('CSInterface.getNetworkPreferences error:', error);
                return {
                    userCanceled: false,
                    systemPreferences: {
                        proxy: 'none',
                        proxyHost: '',
                        proxyPort: 0,
                        proxyUser: '',
                        proxyPassword: ''
                    }
                };
            }
        } else {
            return {
                userCanceled: false,
                systemPreferences: {
                    proxy: 'none',
                    proxyHost: '',
                    proxyPort: 0,
                    proxyUser: '',
                    proxyPassword: ''
                }
            };
        }
    };
    
    this.evaluateScript = function(script, callback) {
        // Alias for evalScript for compatibility
        this.evalScript(script, callback);
    };
    
    this.getHostCapabilities = function() {
        if (isCEP) {
            try {
                return __adobe_cep__.getHostCapabilities();
            } catch (error) {
                console.error('CSInterface.getHostCapabilities error:', error);
                return {
                    EXTENDED_PANEL_MENU: true,
                    EXTENDED_PANEL_ICONS: true,
                    DELEGATE_APE_ENGINE: false,
                    SUPPORT_HTML_EXTENSIONS: true,
                    DISABLE_FLASH_EXTENSIONS: false,
                    SUPPORT_SYSTEM_COLORS: true,
                    SUPPORT_DRAG_DROP: true,
                    SUPPORT_MODAL_SIZING: true,
                    CANNOT_RESIZE_MODAL: false,
                    CANNOT_RESIZE_MODAL_LESS_THAN_ORIGINAL: false,
                    CANNOT_RESIZE_MODAL_GREATER_THAN_ORIGINAL: false,
                    CANNOT_MOVE_MODAL: false,
                    CANNOT_MINIMIZE_MODAL: false,
                    CANNOT_MAXIMIZE_MODAL: false,
                    CANNOT_CLOSE_MODAL: false,
                    CANNOT_ZOOM_MODAL: false,
                    CANNOT_OPEN_NEW_WINDOW: false,
                    CANNOT_OPEN_NEW_WINDOW_LESS_THAN_ORIGINAL: false,
                    CANNOT_OPEN_NEW_WINDOW_GREATER_THAN_ORIGINAL: false,
                    CANNOT_OPEN_NEW_WINDOW_AS_MODAL: false,
                    CANNOT_OPEN_NEW_WINDOW_AS_MODAL_LESS_THAN_ORIGINAL: false,
                    CANNOT_OPEN_NEW_WINDOW_AS_MODAL_GREATER_THAN_ORIGINAL: false
                };
            }
        } else {
            return {
                EXTENDED_PANEL_MENU: true,
                EXTENDED_PANEL_ICONS: true,
                DELEGATE_APE_ENGINE: false,
                SUPPORT_HTML_EXTENSIONS: true,
                DISABLE_FLASH_EXTENSIONS: false,
                SUPPORT_SYSTEM_COLORS: true,
                SUPPORT_DRAG_DROP: true,
                SUPPORT_MODAL_SIZING: true,
                CANNOT_RESIZE_MODAL: false,
                CANNOT_RESIZE_MODAL_LESS_THAN_ORIGINAL: false,
                CANNOT_RESIZE_MODAL_GREATER_THAN_ORIGINAL: false,
                CANNOT_MOVE_MODAL: false,
                CANNOT_MINIMIZE_MODAL: false,
                CANNOT_MAXIMIZE_MODAL: false,
                CANNOT_CLOSE_MODAL: false,
                CANNOT_ZOOM_MODAL: false,
                CANNOT_OPEN_NEW_WINDOW: false,
                CANNOT_OPEN_NEW_WINDOW_LESS_THAN_ORIGINAL: false,
                CANNOT_OPEN_NEW_WINDOW_GREATER_THAN_ORIGINAL: false,
                CANNOT_OPEN_NEW_WINDOW_AS_MODAL: false,
                CANNOT_OPEN_NEW_WINDOW_AS_MODAL_LESS_THAN_ORIGINAL: false,
                CANNOT_OPEN_NEW_WINDOW_AS_MODAL_GREATER_THAN_ORIGINAL: false
            };
        }
    };
}

// Create global instance
if (typeof window !== 'undefined') {
    window.CSInterface = CSInterface;
}
