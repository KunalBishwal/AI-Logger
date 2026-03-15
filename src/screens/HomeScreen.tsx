import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { GradientBackground } from '../components/GradientBackground';
import { storageService } from '../services/storageService';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const features = [
  {
    icon: 'create-outline' as const,
    title: 'Log Visits',
    desc: 'Record customer visits with detailed notes',
    num: '01',
  },
  {
    icon: 'sparkles' as const,
    title: 'AI Summaries',
    desc: 'Generate structured summaries from raw notes',
    num: '02',
  },
  {
    icon: 'cloud-offline-outline' as const,
    title: 'Offline First',
    desc: 'Work without internet, sync when ready',
    num: '03',
  },
  {
    icon: 'sync-outline' as const,
    title: 'Smart Sync',
    desc: 'Auto-sync with retry support',
    num: '04',
  },
];

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ total: 0, synced: 0, pending: 0 });

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(30)).current;
  const featureAnims = features.map(() => useRef(new Animated.Value(0)).current);
  const statsSlide = useRef(new Animated.Value(50)).current;

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
      startAnimations();
    }, [])
  );

  const loadStats = async () => {
    const visits = await storageService.getAllVisits();
    const userVisits = visits.filter((v) => v.userId === user?.uid);
    setStats({
      total: userVisits.length,
      synced: userVisits.filter((v) => v.syncStatus === 'synced').length,
      pending: userVisits.filter((v) => v.syncStatus !== 'synced').length,
    });
  };

  const startAnimations = () => {
    fadeAnim.setValue(0);
    heroSlide.setValue(30);
    statsSlide.setValue(50);
    featureAnims.forEach((a) => a.setValue(0));

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(heroSlide, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(statsSlide, {
        toValue: 0,
        duration: 700,
        delay: 200,
        useNativeDriver: true,
      }),
      ...featureAnims.map((anim, i) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          delay: 400 + i * 100,
          useNativeDriver: true,
        })
      ),
    ]).start();
  };

  return (
    <GradientBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>Welcome back,</Text>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.email?.split('@')[0] || 'User'} 👋
            </Text>
          </View>
          <View style={styles.headerRight}>
            <ThemeToggle />
            <TouchableOpacity
              onPress={logout}
              style={[styles.logoutBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Section */}
        <Animated.View
          style={[
            {
              opacity: fadeAnim,
              transform: [{ translateY: heroSlide }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.15)', 'rgba(124, 58, 237, 0.08)']}
            style={[styles.heroCard, { borderColor: colors.primary + '30' }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={[styles.heroIconBox, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="briefcase" size={36} color={colors.primary} />
            </View>
            <Text style={[styles.heroTitle, { color: colors.text }]}>
              AI Sales Visit Logger
            </Text>
            <Text style={[styles.heroDesc, { color: colors.textSecondary }]}>
              Log customer visits, generate AI-powered summaries, and keep track of your follow-ups — all in one place. Works offline, syncs when you're ready.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('VisitsTab')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.ctaButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.ctaText}>My Visits</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* Stats */}
        <Animated.View
          style={[
            styles.statsRow,
            {
              opacity: fadeAnim,
              transform: [{ translateY: statsSlide }],
            },
          ]}
        >
          {[
            { label: 'Total Visits', value: stats.total, icon: 'document-text-outline', color: colors.primary },
            { label: 'Synced', value: stats.synced, icon: 'cloud-done-outline', color: colors.success },
            { label: 'Pending', value: stats.pending, icon: 'time-outline', color: colors.warning },
          ].map((stat, i) => (
            <View
              key={i}
              style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            >
              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{stat.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Features */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>How It Works</Text>
        <View style={styles.featureGrid}>
          {features.map((feature, i) => (
            <Animated.View
              key={i}
              style={[
                styles.featureCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  opacity: featureAnims[i],
                  transform: [
                    {
                      translateY: featureAnims[i].interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.featureNumRow}>
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.featureNum}
                >
                  <Text style={styles.featureNumText}>{feature.num}</Text>
                </LinearGradient>
              </View>
              <View style={[styles.featureIconBox, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name={feature.icon} size={26} color={colors.primary} />
              </View>
              <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
              <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
                {feature.desc}
              </Text>
            </Animated.View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  greeting: {
    fontSize: 14,
    letterSpacing: 0.3,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 2,
  },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  heroCard: {
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    marginBottom: 24,
    alignItems: 'center',
  },
  heroIconBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  heroDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    gap: 8,
  },
  ctaText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    gap: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: (width - 52) / 2,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
  },
  featureNumRow: {
    marginBottom: 14,
  },
  featureNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureNumText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  featureIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  featureDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
});
