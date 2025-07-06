import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Spacing, FontSize } from '../constants/Spacing';

const FamilyVotingScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aile Oylaması</Text>
      <Text style={styles.subtitle}>
        Aile oylaması özelliği gelecek sürümlerde eklenecek.{'\n\n'}
        Bu özellik ile aile üyeleri birlikte ne yemek yapacağına karar verebilecek.
      </Text>
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

export default FamilyVotingScreen; 