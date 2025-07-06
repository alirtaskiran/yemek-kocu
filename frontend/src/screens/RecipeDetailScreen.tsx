import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Alert,
  Platform,
  Share,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Spacing, FontSize } from '../constants/Spacing';
import { Recipe, ApiResponse } from '../types';
import { recipeService } from '../services/recipeService';
import { APP_CONSTANTS } from '../constants/AppConstants';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  RecipeDetail: { recipeId: string };
  CookingMode: { recipeId: string };
};

type RecipeDetailScreenRouteProp = RouteProp<RootStackParamList, 'RecipeDetail'>;
type RecipeDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RecipeDetail'>;

const RecipeDetailScreen = () => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<boolean[]>([]);
  
  const navigation = useNavigation<RecipeDetailScreenNavigationProp>();
  const route = useRoute<RecipeDetailScreenRouteProp>();
  const { recipeId } = route.params;

  useEffect(() => {
    fetchRecipe();
  }, [recipeId]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching recipe with ID:', recipeId);
      const response: Recipe = await recipeService.getRecipeById(recipeId);
      console.log('✅ Recipe fetched successfully:', response.title);
      setRecipe(response);
      setCheckedIngredients(new Array(response.ingredients.length).fill(false));
    } catch (error) {
      console.error('❌ Recipe fetch error:', error);
      Alert.alert('Hata', 'Tarif yüklenirken bir hata oluştu. Ana sayfaya dönülüyor.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async () => {
    if (!recipe) return;
    
    try {
      const result = await recipeService.toggleLike(recipe.id);
      setIsLiked(result.isLiked);
      
      // Update recipe's likes count
      setRecipe(prev => prev ? { ...prev, likesCount: result.likesCount } : null);
    } catch (error) {
      console.error('Toggle like error:', error);
      Alert.alert('Hata', 'Beğeni işlemi sırasında bir hata oluştu.');
    }
  };

  const handleIngredientToggle = (index: number) => {
    const newChecked = [...checkedIngredients];
    newChecked[index] = !newChecked[index];
    setCheckedIngredients(newChecked);
  };

  const handleShare = async () => {
    if (!recipe) return;
    
    // Kullanıcıya seçenek sun
    Alert.alert(
      'Nasıl Paylaşmak İstersin?',
      'Paylaşım yöntemini seç:',
      [
        {
          text: 'Genel Paylaşım',
          onPress: () => handleGeneralShare(),
        },
        {
          text: 'WhatsApp',
          onPress: () => handleWhatsAppShare(),
        },
        {
          text: 'İptal',
          style: 'cancel',
        },
      ]
    );
  };

  const handleGeneralShare = async () => {
    if (!recipe) return;
    
    try {
      console.log('🔄 Genel paylaşım başlatılıyor...');
      
      // Çok basit mesaj formatı - WhatsApp Share Extension için
      const shareMessage = `${recipe.title} tarifini Yemek Koçu uygulamasında keşfet! 🍽️

Uygulama linki: yemekkocu://recipe/${recipe.id}`;

      console.log('📝 Paylaşılacak mesaj:', shareMessage);

      const result = await Share.share({
        message: shareMessage,
      });
      
      console.log('📊 Share result:', result);
      
      if (result.action === Share.sharedAction) {
        console.log('✅ Paylaşım başarılı!');
        if (result.activityType) {
          console.log('📱 Paylaşılan platform:', result.activityType);
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('❌ Paylaşım iptal edildi');
      }
    } catch (error) {
      console.error('💥 Paylaşım hatası:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      Alert.alert('Hata', 'Paylaşım sırasında bir hata oluştu: ' + errorMessage);
    }
  };

  // Alternatif WhatsApp paylaşımı
  const handleWhatsAppShare = async () => {
    if (!recipe) return;
    
    try {
      const shareMessage = `${recipe.title} tarifini Yemek Koçu uygulamasında keşfet! 🍽️

📱 Uygulamayı indir:
iOS: https://apps.apple.com/app/yemek-kocu/id123456789
Android: https://play.google.com/store/apps/details?id=com.alirtaskiran.yemekkocu

🔗 Direkt link: yemekkocu://recipe/${recipe.id}`;

      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(shareMessage)}`;
      
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        console.log('✅ WhatsApp açıldı!');
      } else {
        Alert.alert('WhatsApp Bulunamadı', 'WhatsApp yüklü değil. Genel paylaşım menüsünü kullanın.');
      }
    } catch (error) {
      console.error('WhatsApp paylaşım hatası:', error);
      Alert.alert('Hata', 'WhatsApp paylaşımı başarısız.');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return Colors.success;
      case 'medium': return Colors.warning;
      case 'hard': return Colors.error;
      default: return Colors.primary;
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Kolay';
      case 'medium': return 'Orta';
      case 'hard': return 'Zor';
      default: return 'Bilinmiyor';
    }
  };

  const getStatusBarHeight = () => {
    return Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Tarif yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Tarif bulunamadı</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: recipe.images[0] || APP_CONSTANTS.RECIPE_DETAIL_PLACEHOLDER }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          
          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
            style={styles.heroGradient}
          />
          
          {/* Floating Buttons */}
          <TouchableOpacity
            style={[styles.backButton, { top: getStatusBarHeight() + 10 }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.favoriteButton, { top: getStatusBarHeight() + 10 }]}
            onPress={toggleLike}
          >
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={24} 
              color={isLiked ? Colors.error : Colors.white} 
            />
          </TouchableOpacity>
          
          {/* Hero Title */}
          <View style={styles.heroTitleContainer}>
            <Text style={styles.heroTitle}>{recipe.title}</Text>
            <Text style={styles.heroSubtitle}>{recipe.description}</Text>
          </View>
        </View>
        {/* Quick Info Cards */}
        <View style={styles.quickInfoContainer}>
          <View style={styles.infoCard}>
            <Ionicons name="time-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoCardTitle}>Hazırlık</Text>
            <Text style={styles.infoCardValue}>{recipe.prepTime} dk</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Ionicons name="flame-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoCardTitle}>Pişirme</Text>
            <Text style={styles.infoCardValue}>{recipe.cookTime} dk</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Ionicons name="people-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoCardTitle}>Porsiyon</Text>
            <Text style={styles.infoCardValue}>{recipe.servings} kişi</Text>
          </View>
          
          <View style={[styles.infoCard, { backgroundColor: getDifficultyColor(recipe.difficulty) + '20' }]}>
            <Ionicons name="bar-chart-outline" size={20} color={getDifficultyColor(recipe.difficulty)} />
            <Text style={[styles.infoCardTitle, { color: getDifficultyColor(recipe.difficulty) }]}>Zorluk</Text>
            <Text style={[styles.infoCardValue, { color: getDifficultyColor(recipe.difficulty) }]}>
              {getDifficultyText(recipe.difficulty)}
            </Text>
          </View>
        </View>

        {/* Ingredients Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Malzemeler</Text>
            <View style={styles.servingInfo}>
              <Ionicons name="people-outline" size={16} color={Colors.primary} />
              <Text style={styles.servingText}>{recipe.servings} kişilik</Text>
            </View>
          </View>
          
          <View style={styles.ingredientsList}>
            {recipe.ingredients.map((ingredient, index) => (
              <TouchableOpacity
                key={index}
                style={styles.ingredientItem}
                onPress={() => handleIngredientToggle(index)}
              >
                <View style={[
                  styles.checkbox,
                  checkedIngredients[index] && styles.checkedBox
                ]}>
                  {checkedIngredients[index] && (
                    <Ionicons name="checkmark" size={16} color={Colors.white} />
                  )}
                </View>
                <Text style={[
                  styles.ingredientText,
                  checkedIngredients[index] && styles.checkedText
                ]}>
                  {ingredient}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Instructions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yapılışı</Text>
          <View style={styles.instructionsList}>
            {recipe.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Nutrition Info */}
        {recipe.nutritionInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Besin Değerleri</Text>
            <View style={styles.nutritionContainer}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Protein</Text>
                <Text style={styles.nutritionValue}>{recipe.nutritionInfo.protein}g</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Karbonhidrat</Text>
                <Text style={styles.nutritionValue}>{recipe.nutritionInfo.carbs}g</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Yağ</Text>
                <Text style={styles.nutritionValue}>{recipe.nutritionInfo.fat}g</Text>
              </View>
              {recipe.caloriesPerServing && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Kalori</Text>
                  <Text style={styles.nutritionValue}>{recipe.caloriesPerServing} kcal</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Social Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İstatistikler</Text>
          <View style={styles.socialStatsContainer}>
            <View style={styles.socialStatItem}>
              <Ionicons name="heart" size={24} color={Colors.error} />
              <Text style={styles.socialStatNumber}>{recipe.likesCount || 0}</Text>
              <Text style={styles.socialStatLabel}>Beğeni</Text>
            </View>
            <View style={styles.socialStatItem}>
              <Ionicons name="chatbubble" size={24} color={Colors.primary} />
              <Text style={styles.socialStatNumber}>{recipe.commentsCount || 0}</Text>
              <Text style={styles.socialStatLabel}>Yorum</Text>
            </View>
            <View style={styles.socialStatItem}>
              <Ionicons name="eye" size={24} color={Colors.textSecondary} />
              <Text style={styles.socialStatNumber}>{recipe.viewsCount || 0}</Text>
              <Text style={styles.socialStatLabel}>Görüntülenme</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('CookingMode', { recipeId: recipe.id })}
          >
            <Ionicons name="play" size={20} color={Colors.white} />
            <Text style={styles.primaryButtonText}>Pişirmeye Başla</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={20} color={Colors.primary} />
            <Text style={styles.secondaryButtonText}>Paylaş</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FontSize.lg,
    color: Colors.text,
  },
  
  // Scroll View
  scrollView: {
    flex: 1,
  },
  
  // Hero Section
  heroContainer: {
    height: height * 0.55, // Ekranın %55'i kadar yükseklik
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  backButton: {
    position: 'absolute',
    left: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  favoriteButton: {
    position: 'absolute',
    right: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  heroTitleContainer: {
    position: 'absolute',
    bottom: Spacing.xl,
    left: Spacing.md,
    right: Spacing.md,
  },
  heroTitle: {
    fontSize: FontSize.xxl,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    fontSize: FontSize.md,
    color: Colors.white,
    opacity: 0.9,
    lineHeight: 22,
  },
  
  // Content
  content: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  // Quick Info Cards
  quickInfoContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  infoCardTitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  infoCardValue: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  
  // Sections
  section: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
  },
  
  // Ingredients
  ingredientsList: {
    gap: Spacing.sm,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: Colors.primary,
  },
  ingredientText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 20,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  
  // Instructions
  instructionsList: {
    gap: Spacing.md,
  },
  instructionItem: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: FontSize.md,
    fontWeight: 'bold',
    color: Colors.white,
  },
  instructionText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 22,
  },
  
  // Nutrition
  nutritionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  nutritionItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  nutritionLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  nutritionValue: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  primaryButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  primaryButtonText: {
    fontSize: FontSize.md,
    fontWeight: 'bold',
    color: Colors.white,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  servingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  servingText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  socialStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  socialStatItem: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  socialStatNumber: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  socialStatLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});

export default RecipeDetailScreen; 