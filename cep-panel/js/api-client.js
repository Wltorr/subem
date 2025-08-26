/**
 * API Client - Flask Backend ile iletişim
 * Bu dosya CEP panelinden Flask API'ye bağlanmak için gerekli fonksiyonları içerir.
 */

class ApiClient {
    constructor(baseUrl = 'http://localhost:5000') {
        this.baseUrl = baseUrl;
        this.timeout = 30000; // 30 saniye timeout
    }

    /**
     * API bağlantısını test et
     */
    async testConnection() {
        try {
            const response = await this.fetchWithTimeout(`${this.baseUrl}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    data: data
                };
            } else {
                return {
                    success: false,
                    error: `HTTP ${response.status}: ${response.statusText}`
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
     * Ses dosyasını transkribe et
     */
    async transcribeAudio(audioFile, format = 'srt') {
        try {
            const formData = new FormData();
            formData.append('audio', audioFile);
            formData.append('format', format);

            const response = await this.fetchWithTimeout(`${this.baseUrl}/transcribe`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const blob = await response.blob();
                return {
                    success: true,
                    data: blob,
                    contentType: response.headers.get('content-type')
                };
            } else {
                const errorText = await response.text();
                return {
                    success: false,
                    error: `HTTP ${response.status}: ${errorText}`
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
     * Kullanılabilir modelleri listele
     */
    async getAvailableModels() {
        try {
            const response = await this.fetchWithTimeout(`${this.baseUrl}/models`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    data: data
                };
            } else {
                return {
                    success: false,
                    error: `HTTP ${response.status}: ${response.statusText}`
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
     * Timeout ile fetch
     */
    async fetchWithTimeout(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('İstek zaman aşımına uğradı');
            }
            throw error;
        }
    }

    /**
     * Base URL'i güncelle
     */
    setBaseUrl(url) {
        this.baseUrl = url;
    }

    /**
     * Timeout'u güncelle
     */
    setTimeout(timeout) {
        this.timeout = timeout;
    }
}

// Global instance
window.apiClient = new ApiClient();
