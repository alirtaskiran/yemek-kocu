// User Types
export interface UserPreferences {
  dietaryRestrictions: string[];
  favoriteCategories: string[];
  cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredMealTimes: string[];
}

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  profileImage?: string;
  bio?: string;
  preferences?: UserPreferences;
}

export interface LoginDto {
  email: string;
  password: string;
}

// Recipe Types
export interface RecipeIngredient {
  name: string;
  amount: string;
  unit: string;
}

export interface RecipeInstruction {
  step: number;
  description: string;
  duration?: number; // dakika
}

export interface NutritionInfo {
  calories: number;
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
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  images?: string[];
}

// Family Types
export interface CreateFamilyDto {
  name: string;
  dietaryRestrictions?: string[];
}

export interface InviteMemberDto {
  email: string;
  username: string;
}

// Meal Vote Types
export interface CreateMealVoteDto {
  title: string;
  description?: string;
  endsAt: Date;
  recipeIds: string[];
}

export interface SubmitVoteDto {
  optionId: string;
}

// Comment Types
export interface CreateCommentDto {
  content: string;
  rating?: number; // 1-5
}

// Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
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

// Auth Types
export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

 