// Environment configuration with auto-detection
interface EnvironmentConfig {
  API_URLS: string[];
  getApiUrl: () => Promise<string>;
  testConnection: (url: string) => Promise<boolean>;
  getCachedUrl: () => Promise<string | null>;
  setCachedUrl: (url: string) => Promise<void>;
}

export const Environment: EnvironmentConfig = {
  // Tüm olası API URL'leri - öncelik sırasına göre
  API_URLS: [
    'http://172.20.10.4:3000/api',      // Hotspot IP
    'http://192.168.1.105:3000/api',    // Güncel IP
    'http://192.168.1.109:3000/api',    // Ev ağı
    'http://192.168.1.115:3000/api',    // Dükkan/ofis ağı
    'http://localhost:3000/api',        // Local development
    'http://10.0.2.2:3000/api',        // Android emulator
  ],
  
  // Test connection to a URL
  testConnection: async function(url: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 saniye timeout
      
      const response = await fetch(`${url.replace('/api', '')}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  },
  
  // Auto-detect working API URL
  getApiUrl: async function(): Promise<string> {
    // Önce cache'den kontrol et
    const cachedUrl = await this.getCachedUrl();
    if (cachedUrl && await this.testConnection(cachedUrl)) {
      return cachedUrl;
    }
    
    // Tüm URL'leri test et
    for (const url of this.API_URLS) {
      if (await this.testConnection(url)) {
        await this.setCachedUrl(url);
        return url;
      }
    }
    
    // Hiçbiri çalışmıyorsa ilkini döndür
    return this.API_URLS[0];
  },
  
  // Cache helpers (AsyncStorage kullanacağız)
  getCachedUrl: async function(): Promise<string | null> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem('cached_api_url');
    } catch {
      return null;
    }
  },
  
  setCachedUrl: async function(url: string): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('cached_api_url', url);
    } catch {
      // Ignore cache errors
    }
  }
};

// Synchronous fallback for immediate use
export const API_BASE_URL_FALLBACK = Environment.API_URLS[0];

// Async API URL getter
let cachedApiUrl: string | null = null;
export const getApiBaseUrl = async (): Promise<string> => {
  if (!cachedApiUrl) {
    cachedApiUrl = await Environment.getApiUrl();
  }
  return cachedApiUrl;
};

// Export for immediate use (will be updated after detection)
export let API_BASE_URL = API_BASE_URL_FALLBACK;

// Base URL without /api for static files
export const getBaseUrl = () => API_BASE_URL.replace('/api', '');
export let BASE_URL = getBaseUrl(); 