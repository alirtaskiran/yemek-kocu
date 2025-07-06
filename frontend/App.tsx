import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';

import { Colors } from './src/constants/Colors';
import { useAuthStore } from './src/store/authStore';
import { RootStackParamList } from './src/types';
import { getApiBaseUrl } from './src/config/environment';

// Import screens (we'll create these next)
import AuthScreen from './src/screens/AuthScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import RecipeDetailScreen from './src/screens/RecipeDetailScreen';
import CookingModeScreen from './src/screens/CookingModeScreen';
import CreateRecipeScreen from './src/screens/CreateRecipeScreen';
import FamilyVotingScreen from './src/screens/FamilyVotingScreen';
import EditCalorieGoalScreen from './src/screens/EditCalorieGoalScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Create navigation stack
const Stack = createNativeStackNavigator<RootStackParamList>();

// Loading component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <StatusBar style="light" backgroundColor={Colors.background} />
  </View>
);

export default function App() {
  const { isAuthenticated, isLoading, checkAuth, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Initialize API URL detection
  useEffect(() => {
    const initializeApiUrl = async () => {
      try {
        await getApiBaseUrl();
      } catch (error) {
        // Ignore API URL detection errors
      }
    };

    initializeApiUrl();
  }, []);

  // Deep linking configuration
  const linking = {
    prefixes: [
      'yemekkocu://',
      'https://yemekkocu.app',
      'https://www.yemekkocu.app',
    ],
    config: {
      screens: {
        Main: 'main',
        RecipeDetail: 'recipe/:recipeId',
        CookingMode: 'cooking/:recipeId',
      },
    },
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer
          theme={{
            dark: true,
            colors: {
              primary: Colors.primary,
              background: Colors.background,
              card: Colors.surface,
              text: Colors.text,
              border: Colors.gray[700],
              notification: Colors.primary,
            },
            fonts: {
              regular: {
                fontFamily: 'System',
                fontWeight: '400',
              },
              medium: {
                fontFamily: 'System',
                fontWeight: '500',
              },
              bold: {
                fontFamily: 'System',
                fontWeight: '700',
              },
              heavy: {
                fontFamily: 'System',
                fontWeight: '900',
              },
            },
          }}
          linking={linking}
        >
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: Colors.surface,
              },
              headerTintColor: Colors.text,
              headerTitleStyle: {
                fontWeight: '600',
              },
              contentStyle: {
                backgroundColor: Colors.background,
              },
            }}
          >
            {isAuthenticated ? (
              // Authenticated screens
              <>
                <Stack.Screen
                  name="Main"
                  component={MainTabNavigator}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="RecipeDetail"
                  component={RecipeDetailScreen}
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="CookingMode"
                  component={CookingModeScreen}
                  options={{
                    title: 'Yemek Yapıyorum',
                    presentation: 'modal',
                    gestureEnabled: false,
                  }}
                />
                <Stack.Screen
                  name="CreateRecipe"
                  component={CreateRecipeScreen}
                  options={{
                    title: 'Yeni Tarif',
                    presentation: 'modal',
                  }}
                />
                <Stack.Screen
                  name="FamilyVoting"
                  component={FamilyVotingScreen}
                  options={{
                    title: 'Aile Oylaması',
                  }}
                />
                <Stack.Screen
                  name="EditCalorieGoal"
                  component={EditCalorieGoalScreen}
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="EditProfile"
                  component={EditProfileScreen}
                  options={{
                    headerShown: false,
                  }}
                />
              </>
            ) : (
              // Unauthenticated screens
              <Stack.Screen
                name="Auth"
                component={AuthScreen}
                options={{ headerShown: false }}
              />
            )}
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="light" backgroundColor={Colors.background} />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
