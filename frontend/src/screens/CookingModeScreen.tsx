import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Spacing, FontSize } from '../constants/Spacing';
import { Recipe } from '../types';
import { recipeService } from '../services/recipeService';
import { APP_CONSTANTS } from '../constants/AppConstants';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  CookingMode: { recipeId: string };
  RecipeDetail: { recipeId: string };
};

type CookingModeScreenRouteProp = RouteProp<RootStackParamList, 'CookingMode'>;
type CookingModeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CookingMode'>;

interface Timer {
  id: string;
  duration: number;
  remaining: number;
  isActive: boolean;
  stepIndex: number;
}

const CookingModeScreen = () => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);
  const [isCompactMode, setIsCompactMode] = useState(true);
  const [timers, setTimers] = useState<Timer[]>([]);
  
  const navigation = useNavigation<CookingModeScreenNavigationProp>();
  const route = useRoute<CookingModeScreenRouteProp>();
  const { recipeId } = route.params;

  useEffect(() => {
    fetchRecipe();
  }, [recipeId]);

  useEffect(() => {
    // Timer countdown logic
    const interval = setInterval(() => {
      setTimers(prevTimers => 
        prevTimers.map(timer => {
          if (timer.isActive && timer.remaining > 0) {
            const newRemaining = timer.remaining - 1;
            if (newRemaining === 0) {
              // Timer finished
              Alert.alert('⏰ Timer Bitti!', `Adım ${timer.stepIndex + 1} için süre doldu.`);
              return { ...timer, remaining: 0, isActive: false };
            }
            return { ...timer, remaining: newRemaining };
          }
          return timer;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      const response: Recipe = await recipeService.getRecipeById(recipeId);
      setRecipe(response);
      setCompletedSteps(new Array(response.instructions.length).fill(false));
    } catch (error) {
      console.error('Recipe fetch error:', error);
      Alert.alert(
        'Hata',
        'Tarif yüklenemedi. Lütfen tekrar deneyin.',
        [
          { text: 'Geri Dön', onPress: () => navigation.goBack() },
          { text: 'Tekrar Dene', onPress: () => fetchRecipe() }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const extractTimeFromInstruction = (instruction: string): number | null => {
    // Extract time patterns like "5 dakika", "10 dk", "3 saniye"
    const timePatterns = [
      /(\d+)\s*dakika/i,
      /(\d+)\s*dk/i,
      /(\d+)\s*saniye/i,
      /(\d+)\s*sn/i,
    ];
    
    for (const pattern of timePatterns) {
      const match = instruction.match(pattern);
      if (match) {
        const value = parseInt(match[1]);
        if (instruction.includes('saniye') || instruction.includes('sn')) {
          return value;
        }
        return value * APP_CONSTANTS.SECONDS_IN_MINUTE; // Convert minutes to seconds
      }
    }
    return null;
  };

  const startTimer = (stepIndex: number) => {
    if (!recipe) return;
    
    const instruction = recipe.instructions[stepIndex];
    const duration = extractTimeFromInstruction(instruction);
    
    if (duration) {
      const newTimer: Timer = {
        id: `timer-${stepIndex}-${Date.now()}`,
        duration,
        remaining: duration,
        isActive: true,
        stepIndex,
      };
      
      setTimers(prev => [...prev, newTimer]);
    }
  };

  const pauseTimer = (stepIndex: number) => {
    setTimers(prev => 
      prev.map(timer => 
        timer.stepIndex === stepIndex 
          ? { ...timer, isActive: false }
          : timer
      )
    );
  };

  const resumeTimer = (stepIndex: number) => {
    setTimers(prev => 
      prev.map(timer => 
        timer.stepIndex === stepIndex 
          ? { ...timer, isActive: true }
          : timer
      )
    );
  };

  const resetTimer = (stepIndex: number) => {
    setTimers(prev => prev.filter(timer => timer.stepIndex !== stepIndex));
  };

  const handleTimerAction = (stepIndex: number) => {
    const activeTimer = timers.find(timer => timer.stepIndex === stepIndex);
    
    if (!activeTimer) {
      // No timer - start new one
      startTimer(stepIndex);
    } else if (activeTimer.isActive) {
      // Timer running - pause it
      pauseTimer(stepIndex);
    } else {
      // Timer paused - resume it
      resumeTimer(stepIndex);
    }
  };

  const handleAIAnalysis = () => {
    if (!recipe) return;
    
    Alert.alert(
      '📸 AI Kontrol',
      'Kamera açılacak ve yapılan adım AI ile kontrol edilecek. Bu özellik yakında aktif olacak!',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Kamerayı Aç', style: 'default', onPress: () => {
          console.log('Kamera açılacak - AI Vision kontrolü yakında aktif olacak');
        }},
      ]
    );
  };

  const handleIngredientCheck = () => {
    if (!recipe) return;
    
    Alert.alert(
      '🧄 Malzeme Kontrolü',
      `Bu adım için gerekli malzemeler:\n\n• Soğan (1 adet)\n• Zeytinyağı (3 kaşık)\n• Tuz, karabiber\n\nHepsi hazır mı?`,
      [
        { text: 'Eksik Var', style: 'destructive' },
        { text: 'Hepsi Hazır', style: 'default' },
      ]
    );
  };

  // İpuçları sistemi kaldırıldı - tutarsızlık ve yanıltıcı bilgiler nedeniyle

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'stir':
        Alert.alert(
          '🥄 Karıştırma Rehberi', 
          'Hangi karıştırma tekniğini kullanıyorsunuz?',
          [
            { text: 'İptal', style: 'cancel' },
            { text: 'Nazikçe Karıştır', onPress: () => {
              Alert.alert('🥄 Nazik Karıştırma', 'Tahta kaşık kullanarak yavaş dairesel hareketler yapın.\n\n• Malzemeleri ezmemeye dikkat\n• Alt-üst getirme hareketi\n• 30 saniyede bir karıştırın');
            }},
            { text: 'Hızlı Karıştır', onPress: () => {
              Alert.alert('🥄 Hızlı Karıştırma', 'Enerjik hareketlerle karıştırın.\n\n• Yapışmasını önler\n• Eşit pişirme sağlar\n• Sürekli hareket halinde');
            }},
            { text: 'Hatırlatma Kur', onPress: () => {
              Alert.alert('⏰ Karıştırma Hatırlatması', '30 saniyede bir karıştırma hatırlatması kuruldu!\n\n(Gerçek uygulamada background timer çalışacak)');
            }}
          ]
        );
        break;
      case 'check':
        const checkList = [
          '• Renk değişimi var mı?',
          '• Koku çıkmaya başladı mı?',
          '• Dokuda değişiklik var mı?',
          '• Isı seviyesi doğru mu?',
          '• Yapışma var mı?',
          '• Ses değişti mi? (cızırdama vs.)'
        ].join('\n');
        
        Alert.alert(
          '👀 Kontrol Listesi',
          `Bu adımda kontrol edilecekler:\n\n${checkList}`,
          [
            { text: 'Tamam', style: 'default' },
            { text: 'Problem Var', style: 'destructive', onPress: () => {
              Alert.alert('🆘 Sorun Giderme', 'Hangi sorunla karşılaştınız?', [
                { text: 'Yanıyor', onPress: () => Alert.alert('🔥 Yanma Sorunu', 'Hemen ateşi kısın!\n• Tavayı ateşten alın\n• Soğuk yağ ekleyin\n• Karıştırarak soğutun') },
                { text: 'Yapışıyor', onPress: () => Alert.alert('🥄 Yapışma Sorunu', 'Biraz sıvı ekleyin!\n• Su veya yağ ekleyin\n• Nazikçe karıştırın\n• Ateşi biraz kısın') },
                { text: 'Çok Yavaş', onPress: () => Alert.alert('⏱️ Yavaş Pişirme', 'Ateşi biraz artırın!\n• Orta-yüksek ateşe çıkın\n• Tava yeterince sıcak mı kontrol edin') }
              ]);
            }}
          ]
        );
        break;
      case 'reminder':
        Alert.prompt(
          '⏰ Hatırlatma Kur',
          'Kaç dakika sonra bu adımı kontrol etmek için hatırlatayım?',
          [
            { text: 'İptal', style: 'cancel' },
            { text: 'Kur', onPress: (minutes) => {
              const time = parseInt(minutes || '5');
              if (time > 0) {
                Alert.alert('⏰ Hatırlatma Kuruldu', `${time} dakika sonra "${recipe?.instructions[currentStep]}" adımını kontrol etmeniz için hatırlatacağım!\n\n(Gerçek uygulamada background notification gelecek)`);
                // TODO: Gerçek notification scheduling
                console.log(`Reminder set for ${time} minutes: ${recipe?.instructions[currentStep]}`);
              }
            }}
          ],
          'plain-text',
          '5'
        );
        break;
    }
  };

  const toggleStepCompletion = (stepIndex: number) => {
    const newCompleted = [...completedSteps];
    newCompleted[stepIndex] = !newCompleted[stepIndex];
    setCompletedSteps(newCompleted);
  };

  const goToNextStep = () => {
    if (recipe && currentStep < recipe.instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getActiveTimer = (): Timer | null => {
    return timers.find(timer => timer.stepIndex === currentStep && timer.isActive) || null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Tarif yükleniyor...</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Tarif bulunamadı</Text>
      </View>
    );
  }

  const activeTimer = getActiveTimer();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.primary + 'DD']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{recipe.title}</Text>
          <Text style={styles.headerSubtitle}>
            Adım {currentStep + 1} / {recipe.instructions.length}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.modeToggle}
          onPress={() => setIsCompactMode(!isCompactMode)}
        >
          <Ionicons 
            name={isCompactMode ? "list" : "apps"} 
            size={24} 
            color={Colors.white} 
          />
        </TouchableOpacity>
      </LinearGradient>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentStep + 1) / recipe.instructions.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(((currentStep + 1) / recipe.instructions.length) * 100)}%
        </Text>
      </View>

      {isCompactMode ? (
        /* Compact Mode */
        <View style={styles.compactContainer}>
          <ScrollView style={styles.compactContent} showsVerticalScrollIndicator={false}>
            {/* Current Step */}
            <View style={styles.currentStepCard}>
              <Text style={styles.stepNumber}>Adım {currentStep + 1}</Text>
              <Text style={styles.stepInstruction}>
                {recipe.instructions[currentStep]}
              </Text>
              
              {/* Timer Display */}
              {activeTimer && (
                <View style={styles.timerContainer}>
                  <Ionicons name="timer" size={24} color={Colors.primary} />
                  <Text style={styles.timerText}>
                    {formatTime(activeTimer.remaining)} kaldı
                  </Text>
                </View>
              )}
              
              {/* Step Actions */}
              <View style={styles.stepActions}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    completedSteps[currentStep] && styles.completedButton
                  ]}
                  onPress={() => toggleStepCompletion(currentStep)}
                >
                  <Ionicons 
                    name={completedSteps[currentStep] ? "checkmark-circle" : "checkmark-circle-outline"} 
                    size={20} 
                    color={completedSteps[currentStep] ? Colors.white : Colors.primary} 
                  />
                  <Text style={[
                    styles.actionButtonText,
                    completedSteps[currentStep] && styles.completedButtonText
                  ]}>
                    {completedSteps[currentStep] ? 'Tamamlandı' : 'Tamamla'}
                  </Text>
                </TouchableOpacity>
                
                {extractTimeFromInstruction(recipe.instructions[currentStep]) && (
                  <TouchableOpacity
                    style={[
                      styles.timerButton,
                      activeTimer?.isActive && styles.timerButtonActive,
                      activeTimer && !activeTimer.isActive && styles.timerButtonPaused
                    ]}
                    onPress={() => handleTimerAction(currentStep)}
                  >
                    <Ionicons 
                      name={activeTimer ? (activeTimer.isActive ? "pause" : "play") : "timer-outline"} 
                      size={20} 
                      color={activeTimer?.isActive ? Colors.white : Colors.primary} 
                    />
                    <Text style={[
                      styles.timerButtonText,
                      activeTimer?.isActive && styles.timerButtonTextActive
                    ]}>
                      {activeTimer ? (activeTimer.isActive ? 'Durdur' : 'Devam Et') : 'Timer Başlat'}
                    </Text>
                  </TouchableOpacity>
                )}
                
                {activeTimer && (
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={() => resetTimer(currentStep)}
                  >
                    <Ionicons name="refresh" size={20} color={Colors.error} />
                    <Text style={styles.resetButtonText}>Sıfırla</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {/* Additional Actions */}
              <View style={styles.additionalActions}>
                <TouchableOpacity
                  style={styles.aiAnalysisButton}
                  onPress={handleAIAnalysis}
                >
                  <Ionicons name="camera" size={20} color={Colors.primary} />
                  <Text style={styles.aiAnalysisButtonText}>AI Kontrol</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.ingredientCheckButton}
                  onPress={handleIngredientCheck}
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color={Colors.success} />
                  <Text style={styles.ingredientCheckButtonText}>Malzeme Kontrolü</Text>
                </TouchableOpacity>
              </View>
              
              {/* İpuçları bölümü kaldırıldı - tutarsızlık nedeniyle */}
            </View>
          </ScrollView>
          
          {/* Navigation */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
              onPress={goToPreviousStep}
              disabled={currentStep === 0}
            >
              <Ionicons name="chevron-back" size={24} color={currentStep === 0 ? Colors.textSecondary : Colors.white} />
              <Text style={[styles.navButtonText, currentStep === 0 && styles.navButtonTextDisabled]}>
                Önceki
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.navButton, currentStep === recipe.instructions.length - 1 && styles.navButtonDisabled]}
              onPress={goToNextStep}
              disabled={currentStep === recipe.instructions.length - 1}
            >
              <Text style={[styles.navButtonText, currentStep === recipe.instructions.length - 1 && styles.navButtonTextDisabled]}>
                Sonraki
              </Text>
              <Ionicons name="chevron-forward" size={24} color={currentStep === recipe.instructions.length - 1 ? Colors.textSecondary : Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Full Mode */
        <ScrollView style={styles.fullContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.fullContent}>
            <Text style={styles.fullModeTitle}>Tüm Adımlar</Text>
            
            {recipe.instructions.map((instruction, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.fullStepCard,
                  index === currentStep && styles.activeStepCard,
                  completedSteps[index] && styles.completedStepCard,
                ]}
                onPress={() => setCurrentStep(index)}
              >
                <View style={styles.fullStepHeader}>
                  <View style={[
                    styles.fullStepNumber,
                    index === currentStep && styles.activeStepNumber,
                    completedSteps[index] && styles.completedStepNumber,
                  ]}>
                    {completedSteps[index] ? (
                      <Ionicons name="checkmark" size={16} color={Colors.white} />
                    ) : (
                      <Text style={[
                        styles.fullStepNumberText,
                        index === currentStep && styles.activeStepNumberText,
                      ]}>
                        {index + 1}
                      </Text>
                    )}
                  </View>
                  
                  <View style={styles.fullStepContent}>
                    <Text style={[
                      styles.fullStepInstruction,
                      index === currentStep && styles.activeStepInstruction,
                      completedSteps[index] && styles.completedStepInstruction,
                    ]}>
                      {instruction}
                    </Text>
                    
                    {extractTimeFromInstruction(instruction) && (
                      <View style={styles.stepTimerInfo}>
                        <Ionicons name="timer-outline" size={16} color={Colors.primary} />
                        <Text style={styles.stepTimerText}>
                          {Math.ceil(extractTimeFromInstruction(instruction)! / 60)} dakika
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
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
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.white,
    opacity: 0.8,
  },
  modeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Progress
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.gray[700],
    borderRadius: 2,
    marginRight: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  
  // Compact Mode
  compactContainer: {
    flex: 1,
  },
  compactContent: {
    flex: 1,
    padding: Spacing.md,
  },
  currentStepCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  stepNumber: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  stepInstruction: {
    fontSize: FontSize.lg,
    color: Colors.text,
    lineHeight: 28,
    marginBottom: Spacing.md,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '20',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  timerText: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: Colors.primary,
    marginLeft: Spacing.sm,
  },
  stepActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '20',
    borderRadius: 12,
    padding: Spacing.md,
  },
  completedButton: {
    backgroundColor: Colors.success,
  },
  actionButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: Spacing.xs,
  },
  completedButtonText: {
    color: Colors.white,
  },
  timerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '20',
    borderRadius: 12,
    padding: Spacing.md,
    minWidth: 120,
  },
  timerButtonActive: {
    backgroundColor: Colors.primary,
  },
  timerButtonPaused: {
    backgroundColor: Colors.warning + '20',
  },
  timerButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: Spacing.xs,
  },
  timerButtonTextActive: {
    color: Colors.white,
  },
  
  // Navigation
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minWidth: 100,
  },
  navButtonDisabled: {
    backgroundColor: Colors.gray[700],
  },
  navButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.white,
  },
  navButtonTextDisabled: {
    color: Colors.textSecondary,
  },
  
  // Full Mode
  fullContainer: {
    flex: 1,
  },
  fullContent: {
    padding: Spacing.md,
  },
  fullModeTitle: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  fullStepCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeStepCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  completedStepCard: {
    backgroundColor: Colors.success + '10',
    borderColor: Colors.success + '30',
  },
  fullStepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  fullStepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.gray[700],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  activeStepNumber: {
    backgroundColor: Colors.primary,
  },
  completedStepNumber: {
    backgroundColor: Colors.success,
  },
  fullStepNumberText: {
    fontSize: FontSize.sm,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  activeStepNumberText: {
    color: Colors.white,
  },
  fullStepContent: {
    flex: 1,
  },
  fullStepInstruction: {
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 22,
  },
  activeStepInstruction: {
    fontWeight: '600',
    color: Colors.primary,
  },
  completedStepInstruction: {
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  stepTimerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  stepTimerText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    marginLeft: Spacing.xs,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error + '20',
    borderRadius: 12,
    padding: Spacing.md,
    minWidth: 100,
  },
  resetButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.error,
    marginLeft: Spacing.xs,
  },
  additionalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  aiAnalysisButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '20',
    borderRadius: 12,
    padding: Spacing.md,
  },
  aiAnalysisButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: Spacing.xs,
  },
  ingredientCheckButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success + '20',
    borderRadius: 12,
    padding: Spacing.md,
  },
  ingredientCheckButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.success,
    marginLeft: Spacing.xs,
  },
  // Tips styles kaldırıldı - ipuçları sistemi kaldırıldığı için
});

export default CookingModeScreen; 