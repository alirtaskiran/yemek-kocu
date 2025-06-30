import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Colors } from '../constants/Colors';
import { Spacing, FontSize, BorderRadius } from '../constants/Spacing';
import { useAuthStore } from '../store/authStore';
import AddCalorieModal from './AddCalorieModal';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const [addCalorieModalVisible, setAddCalorieModalVisible] = useState(false);
  const [todayCalories, setTodayCalories] = useState(1200); // TODO: Get from API

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  const handleAddCalorie = (calories: number, description: string) => {
    setTodayCalories(prev => prev + calories);
    Alert.alert(
      'Kalori Eklendi',
      `${calories} kalori eklendi: ${description}`,
      [{ text: 'Tamam' }]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>👨‍🍳</Text>
        </View>
        <Text style={styles.username}>{user?.username}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.joinDate}>
          Üye olma: {user?.createdAt ? formatDate(user.createdAt) : '-'}
        </Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Günlük İstatistikler</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{user?.totalPoints || 0}</Text>
            <Text style={styles.statLabel}>Toplam Puan</Text>
          </View>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => setAddCalorieModalVisible(true)}
          >
            <Text style={styles.statNumber}>
              {todayCalories} / {user?.dailyCalories || 2000}
            </Text>
            <Text style={styles.statLabel}>Alınan / Hedef Kalori</Text>
            <Text style={styles.addCalorieHint}>Dokunarak kalori ekle</Text>
          </TouchableOpacity>
        </View>
        
        {/* Calorie Progress Bar */}
        <View style={styles.calorieProgressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { 
              width: `${Math.min(100, (todayCalories / (user?.dailyCalories || 2000)) * 100)}%` 
            }]} />
          </View>
          <Text style={styles.progressText}>
            Kalan: {Math.max(0, (user?.dailyCalories || 2000) - todayCalories)} kalori
          </Text>
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Ayarlar</Text>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => navigation.navigate('EditCalorieGoal')}
        >
          <Text style={styles.settingText}>📊 Kalori Hedefini Düzenle</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.settingText}>✏️ Profil Bilgilerini Düzenle</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>🔔 Bildirim Ayarları</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>ℹ️ Uygulama Hakkında</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>🚪 Çıkış Yap</Text>
      </TouchableOpacity>

      {/* Add Calorie Modal */}
      <AddCalorieModal
        visible={addCalorieModalVisible}
        onClose={() => setAddCalorieModalVisible(false)}
        onAddCalorie={handleAddCalorie}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  profileHeader: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 40,
  },
  username: {
    fontSize: FontSize.title,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  email: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  joinDate: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  statsSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    flex: 0.48,
  },
  statNumber: {
    fontSize: FontSize.title,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  statLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  settingsSection: {
    marginBottom: Spacing.xl,
  },
  settingItem: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingText: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  settingArrow: {
    fontSize: FontSize.lg,
    color: Colors.textTertiary,
  },
  logoutButton: {
    backgroundColor: Colors.error,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoutButtonText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  calorieProgressSection: {
    marginTop: Spacing.lg,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.gray[700],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  addCalorieHint: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});

export default ProfileScreen; 