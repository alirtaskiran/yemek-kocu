import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Image,
  TextInput,
  FlatList,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors } from '../constants/Colors';
import { Spacing, FontSize, BorderRadius } from '../constants/Spacing';
import { useAuthStore } from '../store/authStore';
import { recipeService } from '../services/recipeService';
import { authService } from '../services/authService';
import { Recipe } from '../types';
import { APP_CONSTANTS } from '../constants/AppConstants';
import AddCalorieModal from './AddCalorieModal';
import FloatingActionButton from '../components/FloatingActionButton';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  RecipeDetail: { recipeId: string };
  Explore: { searchQuery?: string };
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface TrendRecipe extends Recipe {
  author: string;
  likes: number;
  comments: number;
}

interface CategoryPreview {
  id: string;
  name: string;
  icon: string;
  recipe: Recipe;
}

const HomeScreen = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [searchQuery, setSearchQuery] = useState('');
  const [trendRecipes, setTrendRecipes] = useState<TrendRecipe[]>([]);
  const [categoryPreviews, setCategoryPreviews] = useState<CategoryPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddCalorieModal, setShowAddCalorieModal] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 18) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');
    
    loadContent();
  }, []);

  // Ekran focus olduğunda içeriği yenile
  useFocusEffect(
    React.useCallback(() => {
      loadContent();
    }, [])
  );

  // Trending listesini periyodik olarak yenile (test için)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshTrending();
    }, 15000); // 15 saniyede bir yenile (test için ideal)

    return () => clearInterval(interval);
  }, []);

  const loadContent = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Gerçek trend tarifleri al
      const trendRecipes = await recipeService.getTrendingRecipes(1, 8);
      
      // Eğer trend tarifleri varsa sosyal verilerle birleştir
      if (trendRecipes && Array.isArray(trendRecipes)) {
        const trendRecipesWithSocial: TrendRecipe[] = trendRecipes.map((recipe) => ({
          ...recipe,
          author: `@${recipe.user?.username || 'kullanici'}`,
          likes: recipe.likesCount || 0, // Gerçek beğeni sayısı
          comments: recipe.commentsCount || 0 // Gerçek yorum sayısı
        }));
        setTrendRecipes(trendRecipesWithSocial);
      } else {
        setTrendRecipes([]);
      }
      
      // Kategoriler için random tarifler al
      const allRecipes = await recipeService.getRecipes();
      const categories = [
        { id: 'kahvalti', name: 'Kahvaltı', icon: 'sunny-outline' },
        { id: 'ogle', name: 'Öğle', icon: 'restaurant-outline' },
        { id: 'aksam', name: 'Akşam', icon: 'moon-outline' },
        { id: 'tatli', name: 'Tatlı', icon: 'ice-cream-outline' }
      ];
      
      if (allRecipes && Array.isArray(allRecipes) && allRecipes.length > 0) {
        const categoryPreviews: CategoryPreview[] = categories.map((cat, index) => ({
          ...cat,
          recipe: allRecipes[index] || allRecipes[0]
        }));
        setCategoryPreviews(categoryPreviews);
      } else {
        setCategoryPreviews([]);
      }
      
    } catch (error) {
      console.error('Content loading error:', error);
      // Hata durumunda boş arrayler set et
      setTrendRecipes([]);
      setCategoryPreviews([]);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const onRefresh = () => {
    loadContent(true);
  };

  // Trending listesini yenile (like/unlike sonrası)
  const refreshTrending = async () => {
    try {
      const updatedTrendRecipes = await recipeService.getTrendingRecipes(1, 8);
      
      if (updatedTrendRecipes && Array.isArray(updatedTrendRecipes)) {
        const trendRecipesWithSocial: TrendRecipe[] = updatedTrendRecipes.map((recipe) => ({
          ...recipe,
          author: `@${recipe.user?.username || 'kullanici'}`,
          likes: recipe.likesCount || 0,
          comments: recipe.commentsCount || 0
        }));
        setTrendRecipes(trendRecipesWithSocial);
      }
    } catch (error) {
      console.error('❌ Trending refresh error:', error);
    }
  };

  const getGreeting = () => {
    const greetings = {
      morning: 'Günaydın',
      afternoon: 'İyi günler', 
      evening: 'İyi akşamlar'
    };
    return greetings[timeOfDay];
  };

  const calorieProgress = ((user?.dailyCalories || 0) / (user?.dailyCalorieGoal || APP_CONSTANTS.DEFAULT_CALORIE_GOAL)) * 100;
  const remainingCalories = Math.max(0, (user?.dailyCalorieGoal || APP_CONSTANTS.DEFAULT_CALORIE_GOAL) - (user?.dailyCalories || 0));

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Explore', { searchQuery });
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    navigation.navigate('Explore', {});
  };

  const handleRecipePress = (recipeId: string) => {
    navigation.navigate('RecipeDetail', { recipeId });
  };

  const handleAddCalorie = async (calories: number, description: string) => {
    try {
      await authService.addCalorieEntry(calories, description);
      Alert.alert(
        'Kalori Eklendi',
        `${calories} kalori (${description}) başarıyla eklendi!`,
        [{ text: 'Tamam' }]
      );
      // Kullanıcı bilgilerini yenile
      // Bu kısım auth store'da handle edilecek
    } catch (error) {
      Alert.alert('Hata', 'Kalori eklenirken bir hata oluştu.');
    }
  };

  const renderTrendRecipe = ({ item }: { item: TrendRecipe }) => {
    const handleLike = async (e: any) => {
      e.stopPropagation(); // Prevent navigation
      try {
        // Like/unlike işlemi
        const result = await recipeService.toggleLike(item.id);
        
        // Hemen local state'i güncelle (instant feedback)
        setTrendRecipes(prev => prev.map(recipe => 
          recipe.id === item.id 
            ? { ...recipe, likes: result.likesCount }
            : recipe
        ));

        // Trending listesini yenile (backend'ten fresh data)
        await refreshTrending();

      } catch (error) {
        console.error('Like error:', error);
      }
    };

    const handleComment = (e: any) => {
      e.stopPropagation(); // Prevent navigation
      // Navigate to recipe detail with comment focus
      navigation.navigate('RecipeDetail', { recipeId: item.id });
    };

  return (
      <TouchableOpacity 
        style={styles.trendRecipeCard}
        onPress={() => handleRecipePress(item.id)}
      >
        <Image 
          source={{ uri: item.images?.[0] || APP_CONSTANTS.RECIPE_PLACEHOLDER }} 
          style={styles.trendRecipeImage} 
        />
        
        <View style={styles.trendRecipeInfo}>
          <Text style={styles.trendRecipeTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.trendRecipeAuthor}>{item.author}</Text>
          
          {/* Action Buttons */}
          <View style={styles.trendRecipeActions}>
            <TouchableOpacity 
              style={styles.trendActionButton}
              onPress={handleLike}
            >
              <Ionicons name="heart-outline" size={20} color={Colors.error} />
              <Text style={styles.trendActionText}>{item.likes}</Text>
        </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.trendActionButton}
              onPress={handleComment}
            >
              <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
              <Text style={styles.trendActionText}>{item.comments}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
        />
      }
    >
      {/* Selamlama Bölümü */}
      <View style={styles.greetingSection}>
        <View style={styles.greetingContent}>
          <Text style={styles.greeting}>
            {getGreeting()}, {user?.name ? user.name.split(' ')[0] : user?.username || 'Kullanıcı'}! 👋
            </Text>
          
          {/* Küçültülmüş Kalori Widget */}
          <View style={styles.miniCalorieWidget}>
            <View style={styles.miniCalorieInfo}>
              <Text style={styles.miniCalorieNumber}>{user?.dailyCalories || 0}</Text>
              <Text style={styles.miniCalorieLabel}>/ {user?.dailyCalorieGoal || APP_CONSTANTS.DEFAULT_CALORIE_GOAL}</Text>
            </View>
                         <TouchableOpacity 
               style={styles.miniCalorieButton}
               onPress={() => setShowAddCalorieModal(true)}
             >
               <Ionicons name="add" size={18} color={Colors.primary} />
             </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Arama Bölümü */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Bugün ne pişirelim?"
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
      </View>

      {/* Hızlı Kategoriler */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>🍽️ Hızlı Kategoriler</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categoryPreviews.map((category) => (
            <TouchableOpacity 
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(category.id)}
            >
              <Image 
                source={{ uri: category.recipe.images?.[0] || APP_CONSTANTS.RECIPE_PLACEHOLDER }} 
                style={styles.categoryImage} 
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.categoryOverlay}
              >
                <View style={styles.categoryInfo}>
                  <Ionicons name={category.icon as any} size={24} color={Colors.white} />
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryRecipeTitle} numberOfLines={1}>
                    {category.recipe.title}
          </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Trend Tarifler */}
      <View style={styles.trendSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔥 Trend Tarifler</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Explore', {})}>
            <Text style={styles.seeAllText}>Tümünü Gör</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Trend tarifler yükleniyor...</Text>
          </View>
        ) : (
          <FlatList
            data={trendRecipes}
            renderItem={renderTrendRecipe}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.trendRecipeRow}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Bottom Spacing */}
      <View style={{ height: 100 }} />
    </ScrollView>
    
    {/* Add Calorie Modal */}
    <AddCalorieModal
      visible={showAddCalorieModal}
      onClose={() => setShowAddCalorieModal(false)}
      onAddCalorie={handleAddCalorie}
    />
    
    {/* Floating Action Button */}
    <FloatingActionButton />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  // Selamlama Bölümü
  greetingSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  greetingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: FontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  
  // Mini Kalori Widget
  miniCalorieWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  miniCalorieInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  miniCalorieNumber: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  miniCalorieLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  miniCalorieButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Arama Bölümü
  searchSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  seeAllText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '500',
  },

  // Hızlı Kategoriler
  categoriesSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  categoriesScroll: {
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  categoryCard: {
    width: 140,
    height: 120,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  categoryInfo: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  categoryName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.white,
    marginTop: Spacing.xs,
  },
  categoryRecipeTitle: {
    fontSize: FontSize.sm,
    color: Colors.white,
    opacity: 0.8,
    marginTop: Spacing.xs,
  },

  // Trend Tarifler
  trendSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  trendRecipeRow: {
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  trendRecipeCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  trendRecipeImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  trendRecipeInfo: {
    padding: Spacing.md,
  },
  trendRecipeTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  trendRecipeAuthor: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  trendRecipeActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  trendActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    flex: 1,
    justifyContent: 'center',
  },
  trendActionText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },

  // Loading States
  loadingContainer: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
});

export default HomeScreen; 