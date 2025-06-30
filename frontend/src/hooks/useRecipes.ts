import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recipeService } from '../services/recipeService';
import { Recipe, CreateRecipeDto, RecipeFilters, UserProgress } from '../types';
import { useAuthStore } from '../store/authStore';

// Query keys
export const recipeKeys = {
  all: ['recipes'] as const,
  lists: () => [...recipeKeys.all, 'list'] as const,
  list: (filters?: RecipeFilters) => [...recipeKeys.lists(), filters] as const,
  details: () => [...recipeKeys.all, 'detail'] as const,
  detail: (id: string) => [...recipeKeys.details(), id] as const,
  random: () => [...recipeKeys.all, 'random'] as const,
  progress: () => [...recipeKeys.all, 'progress'] as const,
  userProgress: (recipeId: string) => [...recipeKeys.progress(), recipeId] as const,
  myRecipes: () => [...recipeKeys.all, 'my-recipes'] as const,
};

// Get recipes with filters
export const useRecipes = (filters?: RecipeFilters) => {
  return useQuery({
    queryKey: recipeKeys.list(filters),
    queryFn: () => recipeService.getRecipes(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single recipe
export const useRecipe = (id: string) => {
  return useQuery({
    queryKey: recipeKeys.detail(id),
    queryFn: () => recipeService.getRecipeById(id),
    enabled: !!id,
  });
};

// Get random recipe for "Bugün ne yemek yapsam?" feature
export const useRandomRecipe = () => {
  return useQuery({
    queryKey: recipeKeys.random(),
    queryFn: () => recipeService.getRandomRecipe(),
    staleTime: 0, // Always fetch fresh for random recipe
  });
};

// Get user's recipes
export const useMyRecipes = () => {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: recipeKeys.myRecipes(),
    queryFn: () => recipeService.getMyRecipes(),
    enabled: isAuthenticated,
  });
};

// Get user progress for a recipe
export const useUserProgress = (recipeId: string) => {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: recipeKeys.userProgress(recipeId),
    queryFn: () => recipeService.getUserProgress(recipeId),
    enabled: isAuthenticated && !!recipeId,
  });
};

// Create recipe mutation
export const useCreateRecipe = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateRecipeDto) => recipeService.createRecipe(data),
    onSuccess: () => {
      // Invalidate and refetch recipes
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recipeKeys.myRecipes() });
    },
  });
};

// Update recipe mutation
export const useUpdateRecipe = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateRecipeDto> }) =>
      recipeService.updateRecipe(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific recipe and lists
      queryClient.invalidateQueries({ queryKey: recipeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recipeKeys.myRecipes() });
    },
  });
};

// Delete recipe mutation
export const useDeleteRecipe = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => recipeService.deleteRecipe(id),
    onSuccess: (_, id) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: recipeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recipeKeys.myRecipes() });
    },
  });
};

// Start cooking mutation
export const useStartCooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (recipeId: string) => recipeService.startCooking(recipeId),
    onSuccess: (_, recipeId) => {
      // Invalidate user progress for this recipe
      queryClient.invalidateQueries({ queryKey: recipeKeys.userProgress(recipeId) });
    },
  });
};

// Complete cooking mutation
export const useCompleteCooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (recipeId: string) => recipeService.completeCooking(recipeId),
    onSuccess: (_, recipeId) => {
      // Invalidate user progress for this recipe
      queryClient.invalidateQueries({ queryKey: recipeKeys.userProgress(recipeId) });
    },
  });
};

// Mark meal as eaten mutation
export const useMarkMealAsEaten = () => {
  const queryClient = useQueryClient();
  const { updateDailyCalories } = useAuthStore();
  
  return useMutation({
    mutationFn: (recipeId: string) => recipeService.markMealAsEaten(recipeId),
    onSuccess: (data, recipeId) => {
      // Update daily calories in auth store
      updateDailyCalories(data.dailyCalories);
      
      // Invalidate user progress for this recipe
      queryClient.invalidateQueries({ queryKey: recipeKeys.userProgress(recipeId) });
    },
  });
};

// Search recipes
export const useSearchRecipes = (query: string) => {
  return useQuery({
    queryKey: [...recipeKeys.all, 'search', query],
    queryFn: () => recipeService.searchRecipes(query),
    enabled: query.length > 2, // Only search if query is longer than 2 characters
    staleTime: 30 * 1000, // 30 seconds
  });
}; 