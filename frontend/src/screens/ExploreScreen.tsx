import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Image,
  Alert,
  Dimensions,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors } from '../constants/Colors';
import { Spacing, FontSize, BorderRadius } from '../constants/Spacing';
import { recipeService } from '../services/recipeService';
import { Recipe as RecipeType } from '../types';
import { APP_CONSTANTS } from '../constants/AppConstants';
import FloatingActionButton from '../components/FloatingActionButton';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  RecipeDetail: { recipeId: string };
  CookingMode: { recipeId: string };
  Explore: { searchQuery?: string };
};

type ExploreScreenNavigationProp = StackNavigationProp<RootStackParamList>;
type ExploreScreenRouteProp = RouteProp<RootStackParamList, 'Explore'>;

// Real recipes will be loaded from API

const categories = [
  { id: 'all', name: 'Tümü', icon: 'apps' },
  { id: 'turkish', name: 'Türk Mutfağı', icon: 'flag' },
  { id: 'italian', name: 'İtalyan', icon: 'pizza' },
  { id: 'student', name: 'Öğrenci Dostu', icon: 'school' },
  { id: 'onepot', name: 'Tek Tencere', icon: 'restaurant' },
  { id: 'quick', name: 'Hızlı Yemek', icon: 'flash' },
  { id: 'healthy', name: 'Sağlıklı', icon: 'leaf' },
  { id: 'dessert', name: 'Tatlı', icon: 'ice-cream' },
  { id: 'breakfast', name: 'Kahvaltı', icon: 'sunny' },
  { id: 'soup', name: 'Çorba', icon: 'cafe' },
  { id: 'vegetarian', name: 'Vejetaryen', icon: 'leaf-outline' },
  { id: 'budget', name: 'Ekonomik', icon: 'wallet' }
];

const difficultyLevels = [
  { id: 'all', name: 'Tümü', color: Colors.textSecondary },
  { id: 'easy', name: 'Kolay', color: Colors.success },
  { id: 'medium', name: 'Orta', color: Colors.warning },
  { id: 'hard', name: 'Zor', color: Colors.error }
];

const timeFilters = [
  { id: 'all', name: 'Tümü', maxTime: 999 },
  { id: 'quick', name: '15 dk', maxTime: 15 },
  { id: 'medium', name: '30 dk', maxTime: 30 },
  { id: 'long', name: '60 dk', maxTime: 60 }
];

const sortOptions = [
  { id: 'recent', name: 'Yeni', icon: 'time-outline' },
  { id: 'time', name: 'Süre', icon: 'time' },
  { id: 'calories', name: 'Kalori', icon: 'flame' }
];

const ExploreScreen = () => {
  const navigation = useNavigation<ExploreScreenNavigationProp>();
  const route = useRoute<ExploreScreenRouteProp>();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [recipes, setRecipes] = useState<RecipeType[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<RecipeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Route parametrelerinden arama terimini al
    if (route.params?.searchQuery) {
      setSearchQuery(route.params.searchQuery);
    }
  }, [route.params]);

  useEffect(() => {
    loadRecipes();
  }, []);

  // Ekran focus olduğunda tarifleri yenile
  useFocusEffect(
    React.useCallback(() => {
      loadRecipes();
    }, [])
  );

  useEffect(() => {
    filterRecipes();
  }, [recipes, searchQuery, selectedCategory, selectedDifficulty, selectedTimeFilter, selectedSort]);

  const loadRecipes = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const fetchedRecipes = await recipeService.getRecipes();
      setRecipes(fetchedRecipes);
    } catch (error) {
      console.error('Recipe loading error:', error);
      Alert.alert('Hata', 'Tarifler yüklenirken bir hata oluştu');
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const onRefresh = () => {
    loadRecipes(true);
  };

  const filterRecipes = () => {
    let filtered = recipes.filter(recipe => {
      // Search filter
      const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           recipe.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Category filter
      const matchesCategory = selectedCategory === 'all' || 
                             recipe.cuisineType.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                             recipe.categories.some(cat => cat.toLowerCase().includes(selectedCategory.toLowerCase())) ||
                             (selectedCategory === 'turkish' && (recipe.cuisineType === 'Türk-Fusion' || recipe.categories.includes('türk'))) ||
                             (selectedCategory === 'italian' && recipe.cuisineType === 'İtalyan') ||
                             (selectedCategory === 'student' && recipe.categories.some(cat => cat.includes('öğrenci') || cat.includes('ekonomik'))) ||
                             (selectedCategory === 'onepot' && recipe.categories.some(cat => cat.includes('tek tencere'))) ||
                             (selectedCategory === 'quick' && (recipe.cookTime + recipe.prepTime) <= 30) ||
                             (selectedCategory === 'healthy' && recipe.categories.some(cat => cat.includes('sağlıklı'))) ||
                             (selectedCategory === 'dessert' && recipe.categories.some(cat => cat.includes('tatlı'))) ||
                             (selectedCategory === 'breakfast' && recipe.categories.some(cat => cat.includes('kahvaltı'))) ||
                             (selectedCategory === 'soup' && recipe.categories.some(cat => cat.includes('çorba'))) ||
                             (selectedCategory === 'vegetarian' && recipe.categories.some(cat => cat.includes('vejetaryen') || cat.includes('vegan'))) ||
                             (selectedCategory === 'budget' && recipe.categories.some(cat => cat.includes('ekonomik')));
      
      // Difficulty filter
      const matchesDifficulty = selectedDifficulty === 'all' || recipe.difficulty === selectedDifficulty;
      
      // Time filter
      const totalTime = recipe.cookTime + recipe.prepTime;
      const timeFilter = timeFilters.find(f => f.id === selectedTimeFilter);
      const matchesTime = !timeFilter || totalTime <= timeFilter.maxTime;
      
      return matchesSearch && matchesCategory && matchesDifficulty && matchesTime;
    });

    // Sort recipes
    filtered.sort((a, b) => {
      switch (selectedSort) {
        case 'time':
          return (a.cookTime + a.prepTime) - (b.cookTime + b.prepTime);
        case 'calories':
          return (a.caloriesPerServing || 0) - (b.caloriesPerServing || 0);
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredRecipes(filtered);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return Colors.success;
      case 'medium': return Colors.warning;
      case 'hard': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Kolay';
      case 'medium': return 'Orta';
      case 'hard': return 'Zor';
      default: return difficulty;
    }
  };

  const renderRecipeCard = ({ item }: { item: RecipeType }) => {
    const handleLike = async (e: any) => {
      e.stopPropagation(); // Prevent navigation
      try {
        const result = await recipeService.toggleLike(item.id);
        // Update the recipe in the local state
        setRecipes(prev => prev.map(recipe => 
          recipe.id === item.id 
            ? { ...recipe, likesCount: result.likesCount }
            : recipe
        ));
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
        style={styles.recipeCard}
        onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
      >
        <Image source={{ uri: item.images[0] || APP_CONSTANTS.RECIPE_PLACEHOLDER }} style={styles.recipeImage} />
        <View style={styles.recipeOverlay}>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
            <Text style={styles.difficultyText}>{getDifficultyText(item.difficulty)}</Text>
          </View>
        </View>
        
      <View style={styles.recipeInfo}>
          <Text style={styles.recipeTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.recipeCategory}>{item.cuisineType}</Text>
          
          <View style={styles.recipeStats}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.statText}>{item.cookTime + item.prepTime} dk</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="flame-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.statText}>{item.caloriesPerServing || 0} kcal</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.statText}>{item.servings} kişi</Text>
            </View>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleLike}
            >
              <Ionicons name="heart-outline" size={22} color={Colors.error} />
              <Text style={styles.actionText}>{item.likesCount || 0}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleComment}
            >
              <Ionicons name="chatbubble-outline" size={22} color={Colors.primary} />
              <Text style={styles.actionText}>{item.commentsCount || 0}</Text>
            </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
  };

  const renderCategoryButton = ({ item }: { item: { id: string; name: string; icon: string } }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Ionicons 
        name={item.icon as any} 
        size={20} 
        color={selectedCategory === item.id ? Colors.white : Colors.primary} 
      />
      <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === item.id && styles.categoryButtonTextActive
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderFilterButton = (items: any[], selectedValue: string, onSelect: (value: string) => void, keyPrefix: string) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
      {items.map((item) => (
        <TouchableOpacity
          key={`${keyPrefix}-${item.id}`}
          style={[
            styles.filterButton,
            selectedValue === item.id && styles.filterButtonActive
          ]}
          onPress={() => onSelect(item.id)}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedValue === item.id && styles.filterButtonTextActive
            ]}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tarifleri Keşfet</Text>
        <TouchableOpacity 
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tarif ara... (köfte, makarna, çorba)"
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        </View>

      <ScrollView 
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
        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kategoriler</Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryButton}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesList}
          />
        </View>

        {/* Advanced Filters */}
        {showFilters && (
          <View style={styles.filtersSection}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterTitle}>Zorluk Seviyesi</Text>
              {renderFilterButton(difficultyLevels, selectedDifficulty, setSelectedDifficulty, 'difficulty')}
            </View>
            
            <View style={styles.filterGroup}>
              <Text style={styles.filterTitle}>Süre</Text>
              {renderFilterButton(timeFilters, selectedTimeFilter, setSelectedTimeFilter, 'time')}
            </View>
            
            <View style={styles.filterGroup}>
              <Text style={styles.filterTitle}>Sıralama</Text>
              {renderFilterButton(sortOptions, selectedSort, setSelectedSort, 'sort')}
            </View>
          </View>
        )}

        {/* Results Header */}
        {!loading && (
        <View style={styles.resultsHeader}>
            <Text style={styles.resultsText}>
            {filteredRecipes.length} tarif bulundu
          </Text>
            {searchQuery && (
              <Text style={styles.searchInfo}>
                "{searchQuery}" için sonuçlar
              </Text>
            )}
        </View>
        )}

        {/* Loading or Recipes Grid */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Tarifler yükleniyor...</Text>
          </View>
        ) : (
        <FlatList
          data={filteredRecipes}
          renderItem={renderRecipeCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.recipeRow}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="search" size={64} color={Colors.textTertiary} />
                <Text style={styles.emptyTitle}>Tarif bulunamadı</Text>
                <Text style={styles.emptySubtitle}>
                  Farklı anahtar kelimeler veya filtreler deneyin
                </Text>
              </View>
            }
          />
        )}
      </ScrollView>
      <FloatingActionButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.title,
    fontWeight: 'bold',
    color: Colors.text,
  },
  filterToggle: {
    padding: Spacing.sm,
  },
  searchSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    paddingVertical: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  categoriesList: {
    paddingHorizontal: Spacing.lg,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.sm,
    gap: Spacing.xs,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
  },
  categoryButtonText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  filtersSection: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  filterGroup: {
    marginBottom: Spacing.md,
  },
  filterTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterButton: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  filterButtonTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  resultsHeader: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  resultsText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  searchInfo: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  recipeRow: {
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  recipeCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    width: (width - Spacing.lg * 3) / 2,
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
       recipeOverlay: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    zIndex: 10,
  },
  difficultyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  difficultyText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.white,
  },
  recipeInfo: {
    padding: Spacing.md,
  },
  recipeTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  recipeCategory: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  recipeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  loadingText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: Spacing.xs,
  },
  actionText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
});

export default ExploreScreen; 