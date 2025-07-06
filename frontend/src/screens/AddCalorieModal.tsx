import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Spacing, FontSize, BorderRadius } from '../constants/Spacing';
import { APP_CONSTANTS, validateDailyCalories } from '../constants/AppConstants';

interface AddCalorieModalProps {
  visible: boolean;
  onClose: () => void;
  onAddCalorie: (calories: number, description: string) => Promise<void>;
}

const AddCalorieModal: React.FC<AddCalorieModalProps> = ({ 
  visible, 
  onClose, 
  onAddCalorie 
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'photo' | 'manual' | 'search' | null>(null);
  const [manualCalories, setManualCalories] = useState('');
  const [foodDescription, setFoodDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const resetModal = () => {
    setSelectedMethod(null);
    setManualCalories('');
    setFoodDescription('');
    setLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handlePhotoCapture = async () => {
    setLoading(true);
    try {
      // Kamera ve AI analizi gelecek sürümlerde eklenecek
      Alert.alert(
        'Fotoğraf Analizi',
        'Bu özellik yakında gelecek! Şimdilik manuel giriş kullanabilirsiniz.',
        [{ text: 'Tamam' }]
      );
    } catch (error) {
      Alert.alert('Hata', 'Fotoğraf analizi sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    const calories = parseInt(manualCalories);
    if (isNaN(calories) || calories <= 0 || !validateDailyCalories(calories)) {
      Alert.alert('Hata', `Geçerli bir kalori değeri giriniz (1-${APP_CONSTANTS.MAX_DAILY_CALORIES}).`);
      return;
    }
    if (!foodDescription.trim()) {
      Alert.alert('Hata', 'Yemek açıklaması giriniz.');
      return;
    }

    setLoading(true);
    try {
      await onAddCalorie(calories, foodDescription.trim());
      handleClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setLoading(false);
    }
  };

  const handleFoodSearch = () => {
    // Yemek veritabanı arama özelliği gelecek sürümlerde eklenecek
    Alert.alert(
      'Yemek Arama',
      'Bu özellik yakında gelecek! Şimdilik manuel giriş kullanabilirsiniz.',
      [{ text: 'Tamam' }]
    );
  };

  const renderMethodSelection = () => (
    <View style={styles.methodContainer}>
      <Text style={styles.title}>Kalori Nasıl Eklemek İstersiniz?</Text>
      
      <TouchableOpacity 
        style={styles.methodCard}
        onPress={() => setSelectedMethod('photo')}
      >
        <Text style={styles.methodIcon}>📸</Text>
        <View style={styles.methodContent}>
          <Text style={styles.methodTitle}>Fotoğraf Çek</Text>
          <Text style={styles.methodDescription}>
            Yemeğinizin fotoğrafını çekin, AI kalori analizi yapsın
          </Text>
        </View>
        <Text style={styles.methodArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.methodCard}
        onPress={() => setSelectedMethod('manual')}
      >
        <Text style={styles.methodIcon}>✏️</Text>
        <View style={styles.methodContent}>
          <Text style={styles.methodTitle}>Manuel Giriş</Text>
          <Text style={styles.methodDescription}>
            Kalori değerini ve yemek açıklamasını kendiniz girin
          </Text>
        </View>
        <Text style={styles.methodArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.methodCard}
        onPress={() => setSelectedMethod('search')}
      >
        <Text style={styles.methodIcon}>🔍</Text>
        <View style={styles.methodContent}>
          <Text style={styles.methodTitle}>Yemek Ara</Text>
          <Text style={styles.methodDescription}>
            Hazır yemek veritabanından arayarak seçin
          </Text>
        </View>
        <Text style={styles.methodArrow}>›</Text>
      </TouchableOpacity>
    </View>
  );

  const renderManualEntry = () => (
    <View style={styles.manualContainer}>
      <Text style={styles.title}>Manuel Kalori Girişi</Text>
      
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Yemek Açıklaması</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Örn: Tavuk döner, pilav, salata"
          placeholderTextColor={Colors.textTertiary}
          value={foodDescription}
          onChangeText={setFoodDescription}
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Kalori Miktarı</Text>
        <View style={styles.calorieInputContainer}>
          <TextInput
            style={styles.calorieInput}
            placeholder="500"
            placeholderTextColor={Colors.textTertiary}
            value={manualCalories}
            onChangeText={setManualCalories}
            keyboardType="numeric"
            maxLength={4}
          />
          <Text style={styles.calorieUnit}>kalori</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setSelectedMethod(null)}
        >
          <Text style={styles.backButtonText}>Geri</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleManualSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Ekleniyor...' : 'Ekle'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPhotoCapture = () => (
    <View style={styles.photoContainer}>
      <Text style={styles.title}>Fotoğraf ile Kalori Analizi</Text>
      
      <View style={styles.photoPlaceholder}>
        <Text style={styles.photoIcon}>📷</Text>
        <Text style={styles.photoText}>
          Yemeğinizin fotoğrafını çekin{'\n'}
          AI otomatik kalori analizi yapacak
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setSelectedMethod(null)}
        >
          <Text style={styles.backButtonText}>Geri</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handlePhotoCapture}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Analiz Ediliyor...' : 'Fotoğraf Çek'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (selectedMethod) {
      case 'manual':
        return renderManualEntry();
      case 'photo':
        return renderPhotoCapture();
      case 'search':
        handleFoodSearch();
        setSelectedMethod(null);
        return renderMethodSelection();
      default:
        return renderMethodSelection();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kalori Ekle</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderContent()}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[700],
  },
  closeButton: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    width: 30,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  headerSpacer: {
    width: 30,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  
  // Method Selection
  methodContainer: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  methodCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  methodDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  methodArrow: {
    fontSize: FontSize.lg,
    color: Colors.textTertiary,
  },
  
  // Manual Entry
  manualContainer: {
    flex: 1,
  },
  inputSection: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.gray[700],
    minHeight: 60,
    textAlignVertical: 'top',
  },
  calorieInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray[700],
  },
  calorieInput: {
    flex: 1,
    padding: Spacing.md,
    fontSize: FontSize.lg,
    color: Colors.text,
    textAlign: 'center',
  },
  calorieUnit: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  
  // Photo Capture
  photoContainer: {
    flex: 1,
  },
  photoPlaceholder: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 2,
    borderColor: Colors.gray[600],
    borderStyle: 'dashed',
  },
  photoIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  photoText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Buttons
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: 'auto',
    paddingTop: Spacing.lg,
  },
  backButton: {
    flex: 1,
    backgroundColor: Colors.gray[700],
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  backButtonText: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: Colors.gray[600],
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});

export default AddCalorieModal; 