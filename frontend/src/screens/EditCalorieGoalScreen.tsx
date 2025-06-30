import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Spacing, FontSize, BorderRadius } from '../constants/Spacing';
import { useAuthStore } from '../store/authStore';

interface EditCalorieGoalScreenProps {
  navigation: any;
}

const EditCalorieGoalScreen: React.FC<EditCalorieGoalScreenProps> = ({ navigation }) => {
  const { user, updateUser } = useAuthStore();
  const [calorieGoal, setCalorieGoal] = useState(user?.dailyCalories?.toString() || '2000');
  const [loading, setLoading] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  
  // Calculator state - Auto-fill from user profile if available
  const [calculatorData, setCalculatorData] = useState({
    age: user?.age?.toString() || '',
    gender: (user?.gender as 'male' | 'female') || 'female',
    height: user?.height?.toString() || '',
    weight: user?.weight?.toString() || '',
    activityLevel: 'moderate' as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
    goal: 'maintain' as 'lose' | 'maintain' | 'gain'
  });

  const validateCalorieGoal = (value: string): boolean => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 800 || numValue > 5000) {
      Alert.alert(
        'Geçersiz Değer',
        'Kalori hedefi 800 ile 5000 arasında olmalıdır.'
      );
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateCalorieGoal(calorieGoal)) {
      return;
    }

    setLoading(true);
    try {
      // TODO: API call to update calorie goal
      // await updateCalorieGoal(parseInt(calorieGoal));
      
      // Temporarily update local state
      if (user) {
        updateUser({
          ...user,
          dailyCalories: parseInt(calorieGoal)
        });
      }

      Alert.alert(
        'Başarılı',
        'Kalori hedefiniz güncellendi!',
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Hata', 'Kalori hedefi güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const calculateBMR = (age: number, gender: 'male' | 'female', height: number, weight: number): number => {
    if (gender === 'male') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  };

  const getActivityMultiplier = (level: string): number => {
    const multipliers = {
      sedentary: 1.2,    // Masa başı iş, az hareket
      light: 1.375,      // Hafif egzersiz (haftada 1-3 gün)
      moderate: 1.55,    // Orta egzersiz (haftada 3-5 gün)
      active: 1.725,     // Yoğun egzersiz (haftada 6-7 gün)
      very_active: 1.9   // Çok yoğun egzersiz (günde 2 kez)
    };
    return multipliers[level as keyof typeof multipliers] || 1.55;
  };

  const calculateDailyCalories = (): number => {
    const { age, gender, height, weight, activityLevel, goal } = calculatorData;
    
    if (!age || !height || !weight) return 0;
    
    const bmr = calculateBMR(parseInt(age), gender, parseInt(height), parseInt(weight));
    const tdee = bmr * getActivityMultiplier(activityLevel);
    
    // Hedefe göre ayarlama
    switch (goal) {
      case 'lose':
        return Math.round(tdee - 500); // Haftada 0.5kg için 500 kalori açık
      case 'gain':
        return Math.round(tdee + 300); // Haftada 0.3kg için 300 kalori fazlası
      default:
        return Math.round(tdee);
    }
  };

  const handleUseCalculatedCalories = () => {
    const calculated = calculateDailyCalories();
    if (calculated > 0) {
      setCalorieGoal(calculated.toString());
      setShowCalculator(false);
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>‹ Geri</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Kalori Hedefi</Text>
        </View>

        {/* Current Goal Info */}
        <View style={styles.currentGoalSection}>
          <Text style={styles.sectionTitle}>Mevcut Hedefiniz</Text>
          <View style={styles.currentGoalCard}>
            <Text style={styles.currentGoalNumber}>{user?.dailyCalories || 2000}</Text>
            <Text style={styles.currentGoalLabel}>kalori/gün</Text>
          </View>
        </View>

        {/* New Goal Input */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Yeni Hedef Belirleyin</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={calorieGoal}
              onChangeText={setCalorieGoal}
              placeholder="Örn: 2000"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="numeric"
              maxLength={4}
            />
            <Text style={styles.inputUnit}>kalori/gün</Text>
          </View>
          
          {/* Quick Validation */}
          {calorieGoal && !isNaN(parseInt(calorieGoal)) && (
            <View style={[
              styles.adviceContainer,
              parseInt(calorieGoal) < 1200 ? styles.warningContainer : 
              parseInt(calorieGoal) > 3000 ? styles.cautionContainer : styles.successContainer
            ]}>
              <Text style={styles.adviceText}>
                {parseInt(calorieGoal) < 1200 ? "⚠️ Çok düşük - Sağlık uzmanına danışın" :
                 parseInt(calorieGoal) > 3000 ? "🔥 Yüksek kalori hedefi" :
                 "✅ Uygun kalori aralığında"}
              </Text>
            </View>
          )}
        </View>

        {/* Smart Calculator */}
        <View style={styles.calculatorSection}>
          <View style={styles.calculatorHeader}>
            <Text style={styles.sectionTitle}>🧮 Akıllı Kalori Hesaplayıcı</Text>
            <Text style={styles.calculatorSubtitle}>
              Kişisel bilgilerinize göre ideal kalori hedefinizi hesaplayın
            </Text>
          </View>
          
          {!showCalculator ? (
            <TouchableOpacity 
              style={styles.calculatorButton}
              onPress={() => setShowCalculator(true)}
            >
              <Text style={styles.calculatorButtonText}>📊 Hesaplamaya Başla</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.calculatorForm}>
              {/* Gender Selection */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Cinsiyet</Text>
                <View style={styles.genderButtons}>
                  <TouchableOpacity
                    style={[styles.genderButton, calculatorData.gender === 'female' && styles.genderButtonActive]}
                    onPress={() => setCalculatorData({...calculatorData, gender: 'female'})}
                  >
                    <Text style={[styles.genderButtonText, calculatorData.gender === 'female' && styles.genderButtonTextActive]}>
                      👩 Kadın
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.genderButton, calculatorData.gender === 'male' && styles.genderButtonActive]}
                    onPress={() => setCalculatorData({...calculatorData, gender: 'male'})}
                  >
                    <Text style={[styles.genderButtonText, calculatorData.gender === 'male' && styles.genderButtonTextActive]}>
                      👨 Erkek
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Age, Height, Weight */}
              <View style={styles.formRow}>
                <View style={styles.formGroupSmall}>
                  <Text style={styles.formLabel}>Yaş</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={calculatorData.age}
                    onChangeText={(text) => setCalculatorData({...calculatorData, age: text})}
                    placeholder="25"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
                <View style={styles.formGroupSmall}>
                  <Text style={styles.formLabel}>Boy (cm)</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={calculatorData.height}
                    onChangeText={(text) => setCalculatorData({...calculatorData, height: text})}
                    placeholder="170"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                </View>
                <View style={styles.formGroupSmall}>
                  <Text style={styles.formLabel}>Kilo (kg)</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={calculatorData.weight}
                    onChangeText={(text) => setCalculatorData({...calculatorData, weight: text})}
                    placeholder="70"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                </View>
              </View>

              {/* Activity Level */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Aktivite Seviyesi</Text>
                <View style={styles.activityButtons}>
                  {[
                    { key: 'sedentary', label: '🪑 Masa başı', desc: 'Az hareket' },
                    { key: 'light', label: '🚶 Hafif aktif', desc: 'Haftada 1-3 gün' },
                    { key: 'moderate', label: '🏃 Orta aktif', desc: 'Haftada 3-5 gün' },
                    { key: 'active', label: '💪 Çok aktif', desc: 'Haftada 6-7 gün' },
                    { key: 'very_active', label: '🔥 Süper aktif', desc: 'Günde 2 kez' }
                  ].map((activity) => (
                    <TouchableOpacity
                      key={activity.key}
                      style={[
                        styles.activityButton,
                        calculatorData.activityLevel === activity.key && styles.activityButtonActive
                      ]}
                      onPress={() => setCalculatorData({...calculatorData, activityLevel: activity.key as any})}
                    >
                      <Text style={[
                        styles.activityButtonText,
                        calculatorData.activityLevel === activity.key && styles.activityButtonTextActive
                      ]}>
                        {activity.label}
                      </Text>
                      <Text style={styles.activityButtonDesc}>{activity.desc}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Goal Selection */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Hedefiniz</Text>
                <View style={styles.goalButtons}>
                  {[
                    { key: 'lose', label: '📉 Kilo Ver', desc: '-500 kal/gün' },
                    { key: 'maintain', label: '⚖️ Koru', desc: 'Mevcut ağırlık' },
                    { key: 'gain', label: '📈 Kilo Al', desc: '+300 kal/gün' }
                  ].map((goal) => (
                    <TouchableOpacity
                      key={goal.key}
                      style={[
                        styles.goalButton,
                        calculatorData.goal === goal.key && styles.goalButtonActive
                      ]}
                      onPress={() => setCalculatorData({...calculatorData, goal: goal.key as any})}
                    >
                      <Text style={[
                        styles.goalButtonText,
                        calculatorData.goal === goal.key && styles.goalButtonTextActive
                      ]}>
                        {goal.label}
                      </Text>
                      <Text style={styles.goalButtonDesc}>{goal.desc}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Result */}
              {calculateDailyCalories() > 0 && (
                <View style={styles.calculatorResult}>
                  <Text style={styles.resultLabel}>Önerilen Günlük Kalori:</Text>
                  <Text style={styles.resultValue}>{calculateDailyCalories()} kalori</Text>
                  <View style={styles.resultActions}>
                    <TouchableOpacity
                      style={styles.useResultButton}
                      onPress={handleUseCalculatedCalories}
                    >
                      <Text style={styles.useResultButtonText}>Bu Değeri Kullan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setShowCalculator(false)}
                    >
                      <Text style={styles.cancelButtonText}>İptal</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Kaydediliyor...' : 'Hedefi Kaydet'}
          </Text>
        </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl * 2, // Extra space for keyboard
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  backButtonText: {
    fontSize: FontSize.lg,
    color: Colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: 'bold',
    color: Colors.text,
  },
  currentGoalSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  currentGoalCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  currentGoalNumber: {
    fontSize: FontSize.hero,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  currentGoalLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  inputSection: {
    marginBottom: Spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray[700],
  },
  input: {
    flex: 1,
    padding: Spacing.md,
    fontSize: FontSize.lg,
    color: Colors.text,
    textAlign: 'center',
  },
  inputUnit: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  adviceContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    borderWidth: 1,
  },
  successContainer: {
    backgroundColor: '#10B981' + '20',
    borderColor: '#10B981' + '40',
  },
  warningContainer: {
    backgroundColor: '#F59E0B' + '20',
    borderColor: '#F59E0B' + '40',
  },
  cautionContainer: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary + '40',
  },
  adviceText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  calculatorSection: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  calculatorHeader: {
    marginBottom: Spacing.lg,
  },
  calculatorSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  calculatorButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  calculatorButtonText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  calculatorForm: {
    gap: Spacing.lg,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  formLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  formRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  formGroupSmall: {
    flex: 1,
  },
  smallInput: {
    backgroundColor: Colors.gray[800],
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    fontSize: FontSize.md,
    color: Colors.text,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.gray[700],
  },
  genderButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  genderButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[800],
    borderWidth: 1,
    borderColor: Colors.gray[700],
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  genderButtonText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  genderButtonTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  activityButtons: {
    gap: Spacing.sm,
  },
  activityButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[800],
    borderWidth: 1,
    borderColor: Colors.gray[700],
  },
  activityButtonActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  activityButtonText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  activityButtonTextActive: {
    color: Colors.primary,
  },
  activityButtonDesc: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  goalButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  goalButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[800],
    borderWidth: 1,
    borderColor: Colors.gray[700],
    alignItems: 'center',
  },
  goalButtonActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  goalButtonText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  goalButtonTextActive: {
    color: Colors.primary,
  },
  goalButtonDesc: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
    textAlign: 'center',
  },
  calculatorResult: {
    backgroundColor: Colors.primary + '10',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  resultValue: {
    fontSize: FontSize.xl,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.lg,
  },
  resultActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  useResultButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  useResultButtonText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: Colors.gray[700],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: FontSize.sm,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.gray[600],
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
});

export default EditCalorieGoalScreen; 