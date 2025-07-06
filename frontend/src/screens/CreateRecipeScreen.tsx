import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors } from '../constants/Colors';
import { Spacing } from '../constants/Spacing';
import { recipeService } from '../services/recipeService';
import { CreateRecipeDto, RootStackParamList } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

// Types
interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

interface RecipeStep {
  id: string;
  instruction: string;
  order: number;
}

interface CreateRecipeFormData {
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  totalCalories: number;
  caloriesPerServing: number;
}

const CreateRecipeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCalculatingCalories, setIsCalculatingCalories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<CreateRecipeFormData>({
    title: '',
    description: '',
    category: '',
    difficulty: 'easy',
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    ingredients: [{ id: '1', name: '', amount: '', unit: 'gram' }],
    steps: [{ id: '1', instruction: '', order: 1 }],
    totalCalories: 0,
    caloriesPerServing: 0,
  });

  const totalSteps = 5;

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Form verilerini API formatına çevir
      const recipeData: CreateRecipeDto = {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        prepTime: formData.prepTime,
        cookTime: formData.cookTime,
        servings: formData.servings,
        cuisineType: formData.category,
        categories: [formData.category],
        caloriesPerServing: formData.caloriesPerServing,
        ingredients: formData.ingredients
          .filter(ing => ing.name.trim())
          .map(ing => `${ing.amount} ${ing.unit} ${ing.name}`),
        instructions: formData.steps
          .filter(step => step.instruction.trim())
          .map(step => step.instruction),
        images: [], // Şimdilik boş
      };

      // API'ye gönder
      const newRecipe = await recipeService.createRecipe(recipeData);
      
      Alert.alert(
        'Başarılı!',
        'Tarifin başarıyla oluşturuldu!',
        [
          {
            text: 'Tamam',
            onPress: () => {
              navigation.goBack();
              // RecipeDetail'e yönlendir
              navigation.navigate('RecipeDetail', { recipeId: newRecipe.id });
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Recipe creation error:', error);
      Alert.alert(
        'Hata',
        'Tarif oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.',
        [{ text: 'Tamam' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Basic Info
  const renderBasicInfo = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Tarifin Temel Bilgileri</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tarif Adı *</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(text) => setFormData({...formData, title: text})}
          placeholder="Örn: Klasik Menemen"
          placeholderTextColor={Colors.textTertiary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Kısa Açıklama *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData({...formData, description: text})}
          placeholder="Tarifin kısa açıklaması..."
          placeholderTextColor={Colors.textTertiary}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Kategori *</Text>
        <View style={styles.categoryContainer}>
          {['Kahvaltı', 'Ana Yemek', 'Tatlı', 'Çorba', 'Salata', 'Atıştırmalık'].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                formData.category === cat && styles.categoryButtonActive
              ]}
              onPress={() => setFormData({...formData, category: cat})}
            >
              <Text style={[
                styles.categoryButtonText,
                formData.category === cat && styles.categoryButtonTextActive
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  // Step 2: Ingredients
  const renderIngredients = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Malzemeler</Text>
      
      {formData.ingredients.map((ingredient, index) => (
        <View key={ingredient.id} style={styles.ingredientRow}>
          <View style={styles.ingredientInputs}>
            <TextInput
              style={[styles.input, styles.ingredientName]}
              value={ingredient.name}
              onChangeText={(text) => {
                const newIngredients = [...formData.ingredients];
                newIngredients[index].name = text;
                setFormData({...formData, ingredients: newIngredients});
              }}
              placeholder="Malzeme adı"
              placeholderTextColor={Colors.textTertiary}
            />
            <TextInput
              style={[styles.input, styles.ingredientAmount]}
              value={ingredient.amount}
              onChangeText={(text) => {
                const newIngredients = [...formData.ingredients];
                newIngredients[index].amount = text;
                setFormData({...formData, ingredients: newIngredients});
              }}
              placeholder="Miktar"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="numeric"
            />
            <View style={styles.unitPicker}>
              <TouchableOpacity
                style={styles.unitButton}
                onPress={() => {
                  // Unit picker modal açılacak
                  Alert.alert('Birim Seçimi', 'Birim seçimi özelliği yakında eklenecek!');
                }}
              >
                <Text style={styles.unitButtonText}>{ingredient.unit}</Text>
                <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
          
          {formData.ingredients.length > 1 && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => {
                const newIngredients = formData.ingredients.filter(ing => ing.id !== ingredient.id);
                setFormData({...formData, ingredients: newIngredients});
              }}
            >
              <Ionicons name="close-circle" size={24} color={Colors.error} />
            </TouchableOpacity>
          )}
        </View>
      ))}
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          const newIngredient: Ingredient = {
            id: Date.now().toString(),
            name: '',
            amount: '',
            unit: 'gram'
          };
          setFormData({...formData, ingredients: [...formData.ingredients, newIngredient]});
        }}
      >
        <Ionicons name="add-circle" size={24} color={Colors.primary} />
        <Text style={styles.addButtonText}>Malzeme Ekle</Text>
      </TouchableOpacity>
    </View>
  );

  // Step 3: Instructions
  const renderInstructions = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Yapılış Adımları</Text>
      
      {formData.steps.map((step, index) => (
        <View key={step.id} style={styles.stepRow}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{index + 1}</Text>
          </View>
          
          <View style={styles.stepContent}>
            <TextInput
              style={[styles.input, styles.stepInput]}
              value={step.instruction}
              onChangeText={(text) => {
                const newSteps = [...formData.steps];
                newSteps[index].instruction = text;
                setFormData({...formData, steps: newSteps});
              }}
              placeholder={`${index + 1}. adımı yazın...`}
              placeholderTextColor={Colors.textTertiary}
              multiline
              numberOfLines={3}
            />
            
            {/* Fotoğraf placeholder */}
            <TouchableOpacity style={styles.photoPlaceholder}>
              <Ionicons name="camera-outline" size={24} color={Colors.textTertiary} />
              <Text style={styles.photoPlaceholderText}>Fotoğraf Ekle</Text>
              <Text style={styles.comingSoon}>(Yakında gelecek)</Text>
            </TouchableOpacity>
          </View>
          
          {formData.steps.length > 1 && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => {
                const newSteps = formData.steps.filter(s => s.id !== step.id);
                setFormData({...formData, steps: newSteps});
              }}
            >
              <Ionicons name="close-circle" size={24} color={Colors.error} />
            </TouchableOpacity>
          )}
        </View>
      ))}
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          const newStep: RecipeStep = {
            id: Date.now().toString(),
            instruction: '',
            order: formData.steps.length + 1
          };
          setFormData({...formData, steps: [...formData.steps, newStep]});
        }}
      >
        <Ionicons name="add-circle" size={24} color={Colors.primary} />
        <Text style={styles.addButtonText}>Adım Ekle</Text>
      </TouchableOpacity>
    </View>
  );

  // Step 4: Photos
  const renderPhotos = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Fotoğraflar</Text>
      
      <View style={styles.photoSection}>
        <Text style={styles.photoSectionTitle}>Ana Fotoğraf *</Text>
        <TouchableOpacity style={styles.mainPhotoPlaceholder}>
          <Ionicons name="camera" size={48} color={Colors.textTertiary} />
          <Text style={styles.photoPlaceholderText}>Ana Fotoğraf Ekle</Text>
          <Text style={styles.comingSoon}>(Yakında gelecek)</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.photoSection}>
        <Text style={styles.photoSectionTitle}>Ek Fotoğraflar</Text>
        <View style={styles.additionalPhotos}>
          {[1, 2, 3].map((index) => (
            <TouchableOpacity key={index} style={styles.additionalPhotoPlaceholder}>
              <Ionicons name="add" size={24} color={Colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.comingSoon}>Fotoğraf depolama yakında eklenecek</Text>
      </View>
    </View>
  );

  // Step 5: Final Details
  const renderFinalDetails = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Son Detaylar</Text>
      
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.label}>Hazırlık Süresi (dk)</Text>
          <TextInput
            style={styles.input}
            value={formData.prepTime === 0 ? '' : formData.prepTime.toString()}
            onChangeText={(text) => setFormData({...formData, prepTime: parseInt(text) || 0})}
            placeholder="15"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.detailItem}>
          <Text style={styles.label}>Pişirme Süresi (dk)</Text>
          <TextInput
            style={styles.input}
            value={formData.cookTime === 0 ? '' : formData.cookTime.toString()}
            onChangeText={(text) => setFormData({...formData, cookTime: parseInt(text) || 0})}
            placeholder="20"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="numeric"
          />
        </View>
      </View>
      
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.label}>Porsiyon Sayısı</Text>
          <TextInput
            style={styles.input}
            value={formData.servings === 1 ? '' : formData.servings.toString()}
            onChangeText={(text) => setFormData({...formData, servings: parseInt(text) || 1})}
            placeholder="4"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.detailItem}>
          <Text style={styles.label}>Zorluk Seviyesi</Text>
          <View style={styles.difficultyContainer}>
            {[
              { key: 'easy', label: 'Kolay', icon: '😊' },
              { key: 'medium', label: 'Orta', icon: '😐' },
              { key: 'hard', label: 'Zor', icon: '😰' }
            ].map((diff) => (
              <TouchableOpacity
                key={diff.key}
                style={[
                  styles.difficultyButton,
                  formData.difficulty === diff.key && styles.difficultyButtonActive
                ]}
                onPress={() => setFormData({...formData, difficulty: diff.key as any})}
              >
                <Text style={styles.difficultyEmoji}>{diff.icon}</Text>
                <Text style={[
                  styles.difficultyText,
                  formData.difficulty === diff.key && styles.difficultyTextActive
                ]}>
                  {diff.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      
      {/* Kalori Hesaplama */}
      <View style={styles.calorieSection}>
        <Text style={styles.label}>Kalori Bilgisi</Text>
        <View style={styles.calorieContainer}>
          <View style={styles.calorieInputs}>
            <View style={styles.calorieItem}>
              <Text style={styles.calorieLabel}>Toplam Kalori</Text>
              <TextInput
                style={styles.calorieInput}
                value={formData.totalCalories === 0 ? '' : formData.totalCalories.toString()}
                onChangeText={(text) => {
                  const total = parseInt(text) || 0;
                  setFormData({
                    ...formData, 
                    totalCalories: total,
                    caloriesPerServing: Math.round(total / formData.servings)
                  });
                }}
                placeholder="1200"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.calorieItem}>
              <Text style={styles.calorieLabel}>Porsiyon Başı</Text>
              <View style={styles.calorieDisplay}>
                <Text style={styles.calorieValue}>{formData.caloriesPerServing} kcal</Text>
                <Text style={styles.calorieNote}>({formData.servings} porsiyon için)</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.aiButton, isCalculatingCalories && styles.aiButtonDisabled]}
            onPress={() => {
              // AI kalori hesaplama
              Alert.alert('AI Kalori Hesaplama', 'AI kalori hesaplama özelliği yakında eklenecek!');
            }}
            disabled={isCalculatingCalories}
          >
            <Ionicons 
              name={isCalculatingCalories ? "hourglass" : "sparkles"} 
              size={20} 
              color={Colors.white} 
            />
            <Text style={styles.aiButtonText}>
              {isCalculatingCalories ? 'Hesaplanıyor...' : 'AI ile Hesapla'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderBasicInfo();
      case 2: return renderIngredients();
      case 3: return renderInstructions();
      case 4: return renderPhotos();
      case 5: return renderFinalDetails();
      default: return renderBasicInfo();
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1: return formData.title.trim() && formData.description.trim() && formData.category;
      case 2: return formData.ingredients.some(ing => ing.name.trim());
      case 3: return formData.steps.some(step => step.instruction.trim());
      case 4: return true; // Fotoğraf zorunlu değil şimdilik
      case 5: return formData.prepTime > 0 && formData.cookTime > 0 && formData.servings > 0;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit recipe
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} disabled={currentStep === 1}>
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={currentStep === 1 ? Colors.textTertiary : Colors.text} 
            />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Tarif Oluştur</Text>
            <Text style={styles.headerSubtitle}>Adım {currentStep} / {totalSteps}</Text>
          </View>
          
          <TouchableOpacity>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(currentStep / totalSteps) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderCurrentStep()}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextButton, (!canGoNext() || isSubmitting) && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!canGoNext() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <ActivityIndicator size="small" color={Colors.white} />
                <Text style={styles.nextButtonText}>Oluşturuluyor...</Text>
              </>
            ) : (
              <>
                <Text style={styles.nextButtonText}>
                  {currentStep === totalSteps ? 'Tarifi Oluştur' : 'Devam Et'}
                </Text>
                <Ionicons name="arrow-forward" size={20} color={Colors.white} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[700],
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.gray[700],
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: Spacing.lg,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.gray[700],
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray[700],
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: Colors.text,
  },
  categoryButtonTextActive: {
    color: Colors.white,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  ingredientInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  ingredientName: {
    flex: 2,
  },
  ingredientAmount: {
    flex: 1,
  },
  unitPicker: {
    flex: 1,
  },
  unitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray[700],
  },
  unitButtonText: {
    fontSize: 16,
    color: Colors.text,
  },
  removeButton: {
    padding: Spacing.xs,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    marginTop: Spacing.md,
  },
  addButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  stepContent: {
    flex: 1,
    gap: Spacing.sm,
  },
  stepInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.gray[700],
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  comingSoon: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
  photoSection: {
    marginBottom: Spacing.xl,
  },
  photoSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  mainPhotoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.gray[700],
    borderStyle: 'dashed',
  },
  additionalPhotos: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  additionalPhotoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.gray[700],
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  detailItem: {
    flex: 1,
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  difficultyButton: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[700],
  },
  difficultyButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  difficultyEmoji: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  difficultyText: {
    fontSize: 14,
    color: Colors.text,
  },
  difficultyTextActive: {
    color: Colors.white,
  },
  calorieSection: {
    marginTop: Spacing.lg,
  },
  calorieContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.gray[700],
  },
  calorieInputs: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  calorieItem: {
    flex: 1,
  },
  calorieLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  calorieInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.gray[600],
  },
  calorieDisplay: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.gray[600],
  },
  calorieValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  calorieNote: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: Spacing.md,
  },
  aiButtonDisabled: {
    backgroundColor: Colors.textTertiary,
  },
  aiButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[700],
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: Spacing.lg,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.textTertiary,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default CreateRecipeScreen; 