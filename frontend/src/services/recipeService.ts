import { apiService } from './api';
import { Recipe, CreateRecipeDto, RecipeFilters, UserProgress } from '../types';

class RecipeService {
  // Get all recipes with optional filters
  async getRecipes(filters?: RecipeFilters): Promise<Recipe[]> {
    return apiService.get<Recipe[]>('/recipes', filters);
  }

  // Get single recipe by ID
  async getRecipeById(id: string): Promise<Recipe> {
    return apiService.get<Recipe>(`/recipes/${id}`);
  }

  // Get random recipe for "Bugün ne yemek yapsam?" feature
  async getRandomRecipe(): Promise<Recipe> {
    return apiService.get<Recipe>('/recipes/random');
  }

  // Create new recipe
  async createRecipe(recipeData: CreateRecipeDto): Promise<Recipe> {
    return apiService.post<Recipe>('/recipes', recipeData);
  }

  // Update recipe
  async updateRecipe(id: string, data: Partial<CreateRecipeDto>): Promise<Recipe> {
    return apiService.put<Recipe>(`/recipes/${id}`, data);
  }

  // Delete recipe
  async deleteRecipe(id: string): Promise<void> {
    return apiService.delete<void>(`/recipes/${id}`);
  }

  // Start cooking a recipe
  async startCooking(recipeId: string): Promise<UserProgress> {
    return apiService.post<UserProgress>(`/recipes/${recipeId}/start-cooking`);
  }

  // Complete cooking a recipe
  async completeCooking(recipeId: string): Promise<UserProgress> {
    return apiService.put<UserProgress>(`/recipes/${recipeId}/complete-cooking`);
  }

  // Mark meal as eaten
  async markMealAsEaten(recipeId: string): Promise<{
    userProgress: UserProgress;
    dailyCalories: number;
  }> {
    return apiService.post<{
      userProgress: UserProgress;
      dailyCalories: number;
    }>(`/recipes/${recipeId}/ate-meal`);
  }

  // Get user's cooking progress for a recipe
  async getUserProgress(recipeId: string): Promise<UserProgress | null> {
    try {
      return await apiService.get<UserProgress>(`/recipes/${recipeId}/progress`);
    } catch (error) {
      // If no progress found, return null
      return null;
    }
  }

  // Get user's all cooking progress
  async getAllUserProgress(): Promise<UserProgress[]> {
    return apiService.get<UserProgress[]>('/recipes/my-progress');
  }

  // Search recipes
  async searchRecipes(query: string): Promise<Recipe[]> {
    return apiService.get<Recipe[]>('/recipes/search', { q: query });
  }

  // Get recipes by category
  async getRecipesByCategory(category: string): Promise<Recipe[]> {
    return apiService.get<Recipe[]>('/recipes', { categories: [category] });
  }

  // Get recipes by difficulty
  async getRecipesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Promise<Recipe[]> {
    return apiService.get<Recipe[]>('/recipes', { difficulty });
  }

  // Get user's own recipes
  async getMyRecipes(): Promise<Recipe[]> {
    return apiService.get<Recipe[]>('/recipes/my-recipes');
  }

  // Get trending recipes
  async getTrendingRecipes(page = 1, limit = 10): Promise<Recipe[]> {
    return apiService.get<Recipe[]>('/recipes/trending', { page, limit });
  }

  // Toggle like on recipe (like/unlike)
  async toggleLike(recipeId: string): Promise<{ isLiked: boolean; likesCount: number }> {
    return apiService.post<{ isLiked: boolean; likesCount: number }>(`/recipes/${recipeId}/like`);
  }

  // Get recipe likes
  async getRecipeLikes(recipeId: string, page = 1, limit = 20): Promise<{ data: any[]; pagination: any }> {
    return apiService.get<{ data: any[]; pagination: any }>(`/recipes/${recipeId}/likes`, { page, limit });
  }

  // Add comment to recipe
  async addComment(recipeId: string, content: string): Promise<any> {
    return apiService.post<any>(`/recipes/${recipeId}/comments`, { content });
  }

  // Get recipe comments
  async getRecipeComments(recipeId: string, page = 1, limit = 20): Promise<{ data: any[]; pagination: any }> {
    return apiService.get<{ data: any[]; pagination: any }>(`/recipes/${recipeId}/comments`, { page, limit });
  }

  // View a recipe (for analytics)
  async viewRecipe(recipeId: string): Promise<{ success: boolean }> {
    return apiService.post<{ success: boolean }>(`/recipes/${recipeId}/view`);
  }

  // Get all recipes (public)
}

export const recipeService = new RecipeService();
export default recipeService; 