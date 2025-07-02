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
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/Colors';
import { Spacing, FontSize, BorderRadius } from '../constants/Spacing';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { getBaseUrl } from '../config/environment';

interface EditProfileScreenProps {
  navigation: any;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation }) => {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    age: user?.age?.toString() || '',
    gender: user?.gender || '',
    height: user?.height?.toString() || '',
    weight: user?.weight?.toString() || '',
  });
  
  const handleSave = async () => {
    if (!formData.username.trim()) {
      Alert.alert('Hata', 'Kullanıcı adı boş olamaz.');
      return;
    }
    
    if (formData.username.length < 3) {
      Alert.alert('Hata', 'Kullanıcı adı en az 3 karakter olmalıdır.');
      return;
    }
    
    setLoading(true);
    try {
      const updateData: any = {
        username: formData.username.trim(),
        bio: formData.bio.trim(),
      };

      // Add numeric fields if provided
      if (formData.age) {
        const age = parseInt(formData.age);
        if (!isNaN(age)) updateData.age = age;
      }

      if (formData.height) {
        const height = parseInt(formData.height);
        if (!isNaN(height)) updateData.height = height;
      }

      if (formData.weight) {
        const weight = parseInt(formData.weight);
        if (!isNaN(weight)) updateData.weight = weight;
      }

      if (formData.gender) {
        updateData.gender = formData.gender;
      }

      // API call to update profile
      const updatedUser = await authService.updateProfile(updateData);
      
      // Update local state
      updateUser(updatedUser);

      Alert.alert(
        'Başarılı',
        'Profiliniz güncellendi!',
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Profil güncellenirken bir hata oluştu.';
      Alert.alert('Hata', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const selectProfileImage = () => {
    Alert.alert(
      'Profil Fotoğrafı Seç',
      'Fotoğrafı nereden seçmek istiyorsunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Kamera', onPress: () => openCamera() },
        { text: 'Galeri', onPress: () => openGallery() },
      ]
    );
  };

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Hata', 'Kamera izni gerekli!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadProfileImage(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Hata', 'Galeri izni gerekli!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadProfileImage(result.assets[0].uri);
    }
  };

  const uploadProfileImage = async (imageUri: string) => {
    setImageUploading(true);
    try {
      console.log('Uploading image:', imageUri);
      const response = await authService.uploadProfileImage(imageUri);
      console.log('Upload response:', response);
      updateUser(response.user);
      Alert.alert('Başarılı', 'Profil fotoğrafınız güncellendi!');
    } catch (error: any) {
      console.log('Upload error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Fotoğraf yüklenirken bir hata oluştu.';
      Alert.alert('Hata', errorMessage);
    } finally {
      setImageUploading(false);
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
            <Text style={styles.title}>Profil Düzenle</Text>
        </View>

        {/* Profile Image Section */}
        <View style={styles.profileImageSection}>
          <TouchableOpacity 
            style={styles.profileImageContainer} 
            onPress={selectProfileImage}
            disabled={imageUploading}
          >
            {user?.profileImage ? (
              <Image 
                source={{ uri: `${getBaseUrl()}${user.profileImage}` }} 
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImagePlaceholderText}>👤</Text>
              </View>
            )}
            {imageUploading && (
              <View style={styles.uploadingOverlay}>
                <Text style={styles.uploadingText}>Yükleniyor...</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.changePhotoButton} 
            onPress={selectProfileImage}
            disabled={imageUploading}
          >
            <Text style={styles.changePhotoButtonText}>
              {imageUploading ? 'Yükleniyor...' : '📷 Fotoğraf Değiştir'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Basic Info Section */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Temel Bilgiler</Text>
          
          <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kullanıcı Adı *</Text>
            <TextInput
              style={styles.input}
              value={formData.username}
                onChangeText={(value) => updateFormData('username', value)}
              placeholder="Kullanıcı adınız"
              placeholderTextColor={Colors.textTertiary}
                autoCapitalize="none"
                maxLength={30}
            />
          </View>

          <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
                onChangeText={(value) => updateFormData('bio', value)}
              placeholder="Kendiniz hakkında kısa bir açıklama..."
              placeholderTextColor={Colors.textTertiary}
              multiline
              numberOfLines={3}
                maxLength={200}
            />
              <Text style={styles.characterCount}>
                {formData.bio.length}/200
              </Text>
          </View>
        </View>

        {/* Physical Info Section */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fiziksel Bilgiler</Text>
          <Text style={styles.sectionSubtitle}>
              Bu bilgiler kalori hesaplaması için kullanılır (isteğe bağlı)
          </Text>
          
          <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Yaş</Text>
              <TextInput
                style={styles.input}
                value={formData.age}
                onChangeText={(value) => updateFormData('age', value)}
                placeholder="Örn: 25"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cinsiyet</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    formData.gender === 'female' && styles.genderButtonActive
                  ]}
                  onPress={() => updateFormData('gender', 'female')}
                >
                  <Text style={[
                    styles.genderButtonText,
                    formData.gender === 'female' && styles.genderButtonTextActive
                  ]}>
                    👩 Kadın
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    formData.gender === 'male' && styles.genderButtonActive
                  ]}
                  onPress={() => updateFormData('gender', 'male')}
                >
                  <Text style={[
                    styles.genderButtonText,
                    formData.gender === 'male' && styles.genderButtonTextActive
                  ]}>
                    👨 Erkek
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Boy (cm)</Text>
              <TextInput
                  style={styles.input}
                value={formData.height}
                  onChangeText={(value) => updateFormData('height', value)}
                  placeholder="Örn: 170"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
            
              <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kilo (kg)</Text>
              <TextInput
                  style={styles.input}
                value={formData.weight}
                  onChangeText={(value) => updateFormData('weight', value)}
                  placeholder="Örn: 70"
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
              {loading ? 'Kaydediliyor...' : '💾 Kaydet'}
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
    paddingBottom: Spacing.xl,
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
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  inputLabel: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.gray[700],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    minHeight: 50,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  genderButton: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.gray[700],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderButtonText: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '500',
  },
  genderButtonTextActive: {
    color: Colors.white,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.gray[600],
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  profileImageSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.gray[700],
    borderWidth: 3,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 40,
    color: Colors.textSecondary,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  changePhotoButton: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  changePhotoButtonText: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default EditProfileScreen; 