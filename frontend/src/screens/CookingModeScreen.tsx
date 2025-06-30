import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Spacing, FontSize } from '../constants/Spacing';

const CookingModeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yemek Yapıyorum</Text>
      <Text style={styles.subtitle}>Adım adım yemek yapma rehberi burada olacak</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default CookingModeScreen; 