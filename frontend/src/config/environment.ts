// Environment configuration for different networks
interface EnvironmentConfig {
  API_URLS: {
    HOME: string;
    OFFICE: string;
    LOCALHOST: string;
    ANDROID_EMU: string;
  };
  CURRENT: keyof EnvironmentConfig['API_URLS'];
  getApiUrl: () => string;
  detectNetwork: () => Promise<string>;
}

export const Environment: EnvironmentConfig = {
  // Development URLs for different locations
  API_URLS: {
    HOME: 'http://192.168.1.109:3000/api',      // Ev ağı
    //OFFICE: 'http://192.168.1.109:3000/api',    // Dükkan/ofis ağı
    OFFICE: 'http://192.168.1.134:3000/api',    // Dükkan/ofis ağı
    LOCALHOST: 'http://localhost:3000/api',      // Local development
    ANDROID_EMU: 'http://10.0.2.2:3000/api',   // Android emulator

  },
  
  // Current environment - change this when switching networks
  CURRENT: 'HOME',
  
  // Get current API URL
  getApiUrl: function() {
    return this.API_URLS[this.CURRENT];
  },
  
  // Auto-detect network (experimental)
  detectNetwork: async function() {
    // Bu fonksiyon gelecekte network detection için kullanılabilir
    return this.API_URLS[this.CURRENT];
  }
};

// Export current API URL
export const API_BASE_URL = Environment.getApiUrl(); 