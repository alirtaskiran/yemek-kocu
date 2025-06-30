import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { Colors } from '../constants/Colors';
import { Spacing, FontSize, BorderRadius } from '../constants/Spacing';

// Mock data - Later we'll connect to backend
const mockRecipes = [
  { id: '1', title: 'Köfte', category: 'Türk', difficulty: 'Kolay', cookTime: '30 dk', image: '🍖' },
  { id: '2', title: 'Makarna', category: 'İtalyan', difficulty: 'Kolay', cookTime: '20 dk', image: '🍝' },
  { id: '3', title: 'Pilav', category: 'Türk', difficulty: 'Orta', cookTime: '45 dk', image: '🍚' },
  { id: '4', title: 'Pizza', category: 'İtalyan', difficulty: 'Zor', cookTime: '60 dk', image: '🍕' },
  { id: '5', title: 'Çorba', category: 'Türk', difficulty: 'Kolay', cookTime: '25 dk', image: '🍲' },
  { id: '6', title: 'Salata', category: 'Sağlıklı', difficulty: 'Kolay', cookTime: '10 dk', image: '🥗' },
];

const categories = ['Tümü', 'Türk', 'İtalyan', 'Sağlıklı', 'Çabuk'];

const ExploreScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');

  const filteredRecipes = mockRecipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tümü' || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderRecipeCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.recipeCard}>
      <Text style={styles.recipeImage}>{item.image}</Text>
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle}>{item.title}</Text>
        <Text style={styles.recipeCategory}>{item.category}</Text>
        <View style={styles.recipeDetails}>
          <Text style={styles.recipeDetail}>⏱️ {item.cookTime}</Text>
          <Text style={styles.recipeDetail}>📊 {item.difficulty}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryButton = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === item && styles.categoryButtonTextActive
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tarif ara... (örn: köfte, pilav)"
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Kategoriler</Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryButton}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesList}
          />
        </View>

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.sectionTitle}>
            {filteredRecipes.length} tarif bulundu
          </Text>
        </View>

        {/* Recipes Grid */}
        <FlatList
          data={filteredRecipes}
          renderItem={renderRecipeCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.recipeRow}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  searchSection: {
    marginBottom: Spacing.lg,
  },
  searchInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  categoriesSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  categoriesList: {
    flexGrow: 0,
  },
  categoryButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
  },
  categoryButtonText: {
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  categoryButtonTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  resultsHeader: {
    marginBottom: Spacing.md,
  },
  recipeRow: {
    justifyContent: 'space-between',
  },
  recipeCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    width: '48%',
  },
  recipeImage: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  recipeInfo: {
    alignItems: 'center',
  },
  recipeTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  recipeCategory: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  recipeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  recipeDetail: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
});

export default ExploreScreen; 