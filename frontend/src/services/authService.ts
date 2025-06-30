import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './api';
import { User, AuthResponse } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

class AuthService {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post<any>('/auth/login', credentials);
    
    // Store token and user data
    await AsyncStorage.setItem('auth_token', response.token);
    await AsyncStorage.setItem('user_data', JSON.stringify(response.user));
    
    return response;
  }

  // Register user
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiService.post<any>('/auth/register', credentials);
    
    // Store token and user data
    await AsyncStorage.setItem('auth_token', response.token);
    await AsyncStorage.setItem('user_data', JSON.stringify(response.user));
    
    return response;
  }

  // Logout user
  async logout(): Promise<void> {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_data');
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      return token !== null;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  // Get user profile from server
  async getUserProfile(): Promise<User> {
    return apiService.get<User>('/auth/me');
  }

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiService.put<User>('/auth/me', data);
    
    // Update stored user data
    await AsyncStorage.setItem('user_data', JSON.stringify(response));
    
    return response;
  }

  // Get daily calories
  async getDailyCalories(): Promise<{ dailyCalories: number }> {
    return apiService.get<{ dailyCalories: number }>('/auth/me/daily-calories');
  }

  // Add calories
  async addCalories(calories: number): Promise<{ dailyCalories: number }> {
    return apiService.post<{ dailyCalories: number }>('/auth/me/add-calories', { calories });
  }

  // Reset daily calories
  async resetCalories(): Promise<{ dailyCalories: number }> {
    return apiService.post<{ dailyCalories: number }>('/auth/me/reset-calories');
  }
}

export const authService = new AuthService();
export default authService; 