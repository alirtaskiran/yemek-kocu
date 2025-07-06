// App-wide constants
export const APP_CONSTANTS = {
  // Calorie defaults and limits
  DEFAULT_CALORIE_GOAL: 2000,
  MIN_CALORIE_GOAL: 800,
  MAX_CALORIE_GOAL: 5000,
  MAX_DAILY_CALORIES: 3000,
  
  // Physical info defaults for placeholders
  DEFAULT_AGE: 25,
  DEFAULT_HEIGHT: 170,
  DEFAULT_WEIGHT: 70,
  
  // Recipe defaults
  DEFAULT_PREP_TIME: 30,
  DEFAULT_COOK_TIME: 20,
  DEFAULT_SERVINGS: 4,
  
  // Validation limits
  MAX_USERNAME_LENGTH: 30,
  MAX_NAME_LENGTH: 50,
  MAX_BIO_LENGTH: 200,
  MAX_AGE: 120,
  MAX_HEIGHT: 250,
  MAX_WEIGHT: 300,
  
  // Timer constants
  SECONDS_IN_MINUTE: 60,
  
  // Image placeholders
  RECIPE_PLACEHOLDER: 'https://via.placeholder.com/300x200/E0E0E0/999999?text=Tarif',
  RECIPE_DETAIL_PLACEHOLDER: 'https://via.placeholder.com/400x300/E0E0E0/999999?text=Tarif',
} as const;

// Helper functions
export const getDefaultCalorieGoal = () => APP_CONSTANTS.DEFAULT_CALORIE_GOAL;
export const validateCalorieGoal = (value: number) => 
  value >= APP_CONSTANTS.MIN_CALORIE_GOAL && value <= APP_CONSTANTS.MAX_CALORIE_GOAL;
export const validateDailyCalories = (value: number) => 
  value >= 0 && value <= APP_CONSTANTS.MAX_DAILY_CALORIES; 