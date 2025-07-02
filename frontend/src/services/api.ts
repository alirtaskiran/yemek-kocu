import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse } from '../types';
import { API_BASE_URL_FALLBACK, getApiBaseUrl } from '../config/environment';

// Using environment configuration for flexible network switching
let BASE_URL = API_BASE_URL_FALLBACK;

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.initializeBaseUrl();
  }

  private async initializeBaseUrl() {
    try {
      const detectedUrl = await getApiBaseUrl();
      if (detectedUrl !== BASE_URL) {
        BASE_URL = detectedUrl;
        this.api.defaults.baseURL = BASE_URL;
      }
    } catch (error) {
      // Use fallback URL if detection fails
    }
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await AsyncStorage.removeItem('auth_token');
          // You might want to redirect to login screen here
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    data?: any,
    params?: any
  ): Promise<T> {
    try {
      const response = await this.api.request({
        method,
        url,
        data,
        params,
      });
      
      // Backend returns { success: true, data: actualData } format
      if (response.data && response.data.success && response.data.data !== undefined) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  private handleError(error: AxiosError) {
    // Error handling without console logs
    // Errors will be handled by the calling components
  }

  // Convenience methods
  async get<T>(url: string, params?: any): Promise<T> {
    return this.request<T>('GET', url, undefined, params);
  }

  async post<T>(url: string, data?: any): Promise<T> {
    return this.request<T>('POST', url, data);
  }

  async put<T>(url: string, data?: any): Promise<T> {
    return this.request<T>('PUT', url, data);
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    return this.request<T>('PATCH', url, data);
  }

  async delete<T>(url: string): Promise<T> {
    return this.request<T>('DELETE', url);
  }

  // Form data post method for file uploads
  async postFormData<T>(url: string, formData: FormData): Promise<T> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      console.log('Form data upload token:', token ? 'exists' : 'missing');
      
      const response = await this.api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      
      // Backend returns { success: true, data: actualData } format
      if (response.data && response.data.success && response.data.data !== undefined) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService; 