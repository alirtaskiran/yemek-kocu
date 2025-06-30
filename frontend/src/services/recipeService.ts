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
  async createRecipe(data: CreateRecipeDto): Promise<Recipe> {
    return apiService.post<Recipe>('/recipes', data);
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
}

export const recipeService = new RecipeService();
export default recipeService; 