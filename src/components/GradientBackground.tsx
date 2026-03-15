import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
  colors?: string[];
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  style,
  colors,
}) => {
  const { isDark, colors: themeColors } = useTheme();

  const bgColors = colors || (isDark
    ? ['#0A0A1A', '#0F0F23', '#1A1035', '#0F0F23', '#0A0A1A']
    : ['#F5F3FF', '#EDE9FE', '#F5F3FF']);

  return (
    <LinearGradient
      colors={bgColors as any}
      style={[styles.container, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
