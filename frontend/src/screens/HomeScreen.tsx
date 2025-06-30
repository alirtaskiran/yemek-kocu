import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';
import { Spacing, FontSize, BorderRadius } from '../constants/Spacing';
import { useAuthStore } from '../store/authStore';

const HomeScreen = () => {
  const { user } = useAuthStore();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section - "Bugün ne yemek yapsam?" */}
      <View style={styles.heroSection}>
        <Text style={styles.greeting}>
          Merhaba, {user?.username || 'Kullanıcı'}! 👋
        </Text>
        <Text style={styles.heroTitle}>Bugün ne yemek yapsam?</Text>
        <TouchableOpacity style={styles.heroButton}>
          <Text style={styles.heroButtonText}>Rastgele Tarif Öner</Text>
        </TouchableOpacity>
      </View>

      {/* Daily Calories Section */}
      <View style={styles.caloriesSection}>
        <Text style={styles.sectionTitle}>Günlük Kalori Takibi</Text>
        <View style={styles.caloriesCard}>
          <View style={styles.caloriesInfo}>
            <Text style={styles.caloriesNumber}>{user?.dailyCalories || 0}</Text>
            <Text style={styles.caloriesLabel}>kalori</Text>
          </View>
          <View style={styles.caloriesRing}>
            {/* Placeholder for calorie ring - we'll implement this later */}
            <Text style={styles.caloriesRingText}>📊</Text>
          </View>
        </View>
      </View>

      {/* Family Votes Section */}
      <View style={styles.familySection}>
        <Text style={styles.sectionTitle}>Aile Oylamaları</Text>
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>
            Ailenizle "Bu akşam ne yesek?" oylamaları burada görünecek
          </Text>
        </View>
      </View>

      {/* Recent Recipes Section */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Son Tarifler</Text>
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>
            Son eklenen tarifler burada görünecek
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroSection: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  greeting: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  heroTitle: {
    fontSize: FontSize.title,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  heroButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  heroButtonText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  caloriesSection: {
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  caloriesCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caloriesInfo: {
    alignItems: 'flex-start',
  },
  caloriesNumber: {
    fontSize: FontSize.title,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  caloriesLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  caloriesRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  caloriesRingText: {
    fontSize: 24,
  },
  familySection: {
    padding: Spacing.md,
  },
  recentSection: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  placeholderCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  placeholderText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    textAlign: 'center',
  },
});

export default HomeScreen; 