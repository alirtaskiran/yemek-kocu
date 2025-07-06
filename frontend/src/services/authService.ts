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
  // Clean up old cached data
  async cleanupOldData(): Promise<void> {
    try {
      // Remove old user_data that's no longer used
      await AsyncStorage.removeItem('user_data');
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post<any>('/auth/login', credentials);
    
    // Only store token
    await AsyncStorage.setItem('auth_token', response.token);
    
    return response;
  }

  // Register user
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiService.post<any>('/auth/register', credentials);
    
    // Only store token
    await AsyncStorage.setItem('auth_token', response.token);
    
    return response;
  }

  // Logout user
  async logout(): Promise<void> {
    await AsyncStorage.removeItem('auth_token');
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      return token !== null;
    } catch (error) {
      return false;
    }
  }

  // Get user profile from server
  async getUserProfile(): Promise<User> {
    return apiService.get<User>('/auth/me');
  }

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    return apiService.put<User>('/auth/profile', data);
  }

  // Get daily calories
  async getDailyCalories(): Promise<{ dailyCalories: number }> {
    return apiService.get<{ dailyCalories: number }>('/auth/daily-calories');
  }

  // Add calories
  async addCalories(calories: number): Promise<{ dailyCalories: number }> {
    return apiService.post<{ dailyCalories: number }>('/auth/add-calories', { calories });
  }

  // Reset daily calories
  async resetCalories(): Promise<{ dailyCalories: number }> {
    return apiService.post<{ dailyCalories: number }>('/auth/reset-calories');
  }

  // Update calorie goal
  async updateCalorieGoal(calorieGoal: number): Promise<{ dailyCalorieGoal: number }> {
    return apiService.put<{ dailyCalorieGoal: number }>('/auth/calorie-goal', { calorieGoal });
  }

  // Add calorie entry with description
  async addCalorieEntry(calories: number, description: string): Promise<{ success: boolean; entry: any }> {
    return apiService.post<{ success: boolean; entry: any }>('/auth/calories', { calories, description });
  }

  // Get calorie entries for a specific date
  async getCalorieEntries(date?: Date): Promise<any[]> {
    const params = date ? { date: date.toISOString() } : {};
    const response = await apiService.get<{ data: any[] }>('/auth/calories', params);
    return response.data;
  }

  // Upload profile image
  async uploadProfileImage(imageUri: string): Promise<{ user: User; imageUrl: string }> {
    const formData = new FormData();
    
    formData.append('profileImage', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile-image.jpg',
    } as any);

    return apiService.postFormData<{ user: User; imageUrl: string }>('/auth/upload-profile-image', formData);
  }
}

export const authService = new AuthService();
export default authService; 