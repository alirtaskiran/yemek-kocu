export const Colors = {
  // Primary colors - Orange/Yellow theme for food app
  primary: '#FF8C42', // Warm orange
  primaryDark: '#E8722E',
  primaryLight: '#FFB366',
  
  // Secondary colors - Green for health theme
  secondary: '#4CAF50',
  secondaryDark: '#388E3C',
  secondaryLight: '#81C784',
  
  // Background colors - Dark theme
  background: '#121212',
  surface: '#1E1E1E',
  card: '#2A2A2A',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textTertiary: '#808080',
  
  // Status colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // Transparent colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Category colors
  categories: {
    breakfast: '#FFB74D',
    lunch: '#81C784',
    dinner: '#F06292',
    snack: '#9575CD',
    dessert: '#FF8A65',
  },
  
  // Difficulty colors
  difficulty: {
    easy: '#4CAF50',
    medium: '#FF9800',
    hard: '#F44336',
  },
} as const;

export type ColorKey = keyof typeof Colors; 