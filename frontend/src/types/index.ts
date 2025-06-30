// User types
export interface User {
  id: string;
  email: string;
  username: string;
  profileImage?: string;
  bio?: string;
  totalPoints: number;
  dailyCalories: number;
  // Physical info for calorie calculation
  age?: number;
  gender?: 'male' | 'female';
  height?: number; // cm
  weight?: number; // kg
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Recipe types
export interface Recipe {
  id: string;
  userId: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prepTime: number;
  cookTime: number;
  servings: number;
  cuisineType: string;
  categories: string[];
  caloriesPerServing?: number;
  nutritionInfo?: NutritionInfo;
  ingredients: string[];
  instructions: string[];
  images: string[];
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    username: string;
    profileImage?: string;
  };
  _count?: {
    comments: number;
    userProgresses: number;
  };
}

export interface NutritionInfo {
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
}

export interface CreateRecipeDto {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prepTime: number;
  cookTime: number;
  servings: number;
  cuisineType: string;
  categories: string[];
  caloriesPerServing?: number;
  nutritionInfo?: NutritionInfo;
  ingredients: string[];
  instructions: string[];
  images?: string[];
}

// Family types
export interface Family {
  id: string;
  name: string;
  adminUserId: string;
  dietaryRestrictions: string[];
  createdAt: string;
  updatedAt: string;
  members?: FamilyMember[];
  mealVotes?: MealVote[];
}

export interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string;
  user: {
    id: string;
    username: string;
    profileImage?: string;
  };
}

export interface MealVote {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  endsAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  options: MealVoteOption[];
  votes: UserMealVote[];
}

export interface MealVoteOption {
  id: string;
  mealVoteId: string;
  recipeId: string;
  voteCount: number;
  recipe: Recipe;
  votes: UserMealVote[];
}

export interface UserMealVote {
  id: string;
  userId: string;
  voteId: string;
  optionId: string;
  votedAt: string;
  user: {
    id: string;
    username: string;
  };
}

// User Progress types
export interface UserProgress {
  id: string;
  userId: string;
  recipeId: string;
  completionStatus: 'in_progress' | 'completed' | 'abandoned';
  didEat: boolean;
  startedAt: string;
  completedAt?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    code: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  RecipeDetail: { recipeId: string };
  CookingMode: { recipeId: string };
  FamilyVoting: { familyId: string; voteId: string };
  EditCalorieGoal: undefined;
  EditProfile: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Family: undefined;
  Profile: undefined;
};

// Filter types
export interface RecipeFilters {
  difficulty?: string;
  cuisineType?: string;
  categories?: string[];
  search?: string;
  maxPrepTime?: number;
} 