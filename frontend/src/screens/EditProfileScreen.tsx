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

interface EditProfileScreenProps {
  navigation: any;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation }) => {
  const { user, updateUser } = useAuthStore();
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    age: user?.age?.toString() || '',
    gender: user?.gender || 'female',
    height: user?.height?.toString() || '',
    weight: user?.weight?.toString() || '',
  });
  
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      Alert.alert('Hata', 'Kullanıcı adı boş olamaz.');
      return false;
    }
    
    if (formData.age && (parseInt(formData.age) < 13 || parseInt(formData.age) > 100)) {
      Alert.alert('Hata', 'Yaş 13-100 arasında olmalıdır.');
      return false;
    }
    
    if (formData.height && (parseInt(formData.height) < 100 || parseInt(formData.height) > 250)) {
      Alert.alert('Hata', 'Boy 100-250 cm arasında olmalıdır.');
      return false;
    }
    
    if (formData.weight && (parseInt(formData.weight) < 30 || parseInt(formData.weight) > 300)) {
      Alert.alert('Hata', 'Kilo 30-300 kg arasında olmalıdır.');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // TODO: API call to update profile
      // await updateProfile(formData);
      
      // Temporarily update local state
      if (user) {
        updateUser({
          ...user,
          username: formData.username,
          bio: formData.bio || undefined,
          age: formData.age ? parseInt(formData.age) : undefined,
          gender: formData.gender as 'male' | 'female',
          height: formData.height ? parseInt(formData.height) : undefined,
          weight: formData.weight ? parseInt(formData.weight) : undefined,
        });
      }

      Alert.alert(
        'Başarılı',
        'Profil bilgileriniz güncellendi!',
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
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
          <Text style={styles.title}>Profili Düzenle</Text>
        </View>

        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Temel Bilgiler</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Kullanıcı Adı</Text>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(text) => setFormData({...formData, username: text})}
              placeholder="Kullanıcı adınız"
              placeholderTextColor={Colors.textTertiary}
              maxLength={20}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Hakkımda</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(text) => setFormData({...formData, bio: text})}
              placeholder="Kendiniz hakkında kısa bir açıklama..."
              placeholderTextColor={Colors.textTertiary}
              multiline
              numberOfLines={3}
              maxLength={150}
            />
          </View>
        </View>

        {/* Physical Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Fiziksel Bilgiler</Text>
          <Text style={styles.sectionSubtitle}>
            Bu bilgiler kalori hesaplama için kullanılır (opsiyonel)
          </Text>
          
          {/* Gender Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cinsiyet</Text>
            <View style={styles.genderButtons}>
              <TouchableOpacity
                style={[styles.genderButton, formData.gender === 'female' && styles.genderButtonActive]}
                onPress={() => setFormData({...formData, gender: 'female'})}
              >
                <Text style={[styles.genderButtonText, formData.gender === 'female' && styles.genderButtonTextActive]}>
                  👩 Kadın
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderButton, formData.gender === 'male' && styles.genderButtonActive]}
                onPress={() => setFormData({...formData, gender: 'male'})}
              >
                <Text style={[styles.genderButtonText, formData.gender === 'male' && styles.genderButtonTextActive]}>
                  👨 Erkek
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Age, Height, Weight */}
          <View style={styles.physicalInputs}>
            <View style={styles.physicalInputGroup}>
              <Text style={styles.inputLabel}>Yaş</Text>
              <TextInput
                style={styles.physicalInput}
                value={formData.age}
                onChangeText={(text) => setFormData({...formData, age: text})}
                placeholder="25"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
            
            <View style={styles.physicalInputGroup}>
              <Text style={styles.inputLabel}>Boy (cm)</Text>
              <TextInput
                style={styles.physicalInput}
                value={formData.height}
                onChangeText={(text) => setFormData({...formData, height: text})}
                placeholder="170"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
            
            <View style={styles.physicalInputGroup}>
              <Text style={styles.inputLabel}>Kilo (kg)</Text>
              <TextInput
                style={styles.physicalInput}
                value={formData.weight}
                onChangeText={(text) => setFormData({...formData, weight: text})}
                placeholder="70"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
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
  section: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.gray[800],
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    fontSize: FontSize.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.gray[700],
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  physicalInputs: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  physicalInputGroup: {
    flex: 1,
  },
  physicalInput: {
    backgroundColor: Colors.gray[800],
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    fontSize: FontSize.md,
    color: Colors.text,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.gray[700],
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

export default EditProfileScreen; 