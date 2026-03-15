import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Toast, ToastType } from '../components/Toast';

const { width, height } = Dimensions.get('window');

export const LoginScreen: React.FC = () => {
  const { login, register, resetPassword } = useAuth();
  const { colors, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: ToastType;
    subtitle?: string;
  }>({ visible: false, message: '', type: 'success' });

  const showToast = (message: string, type: ToastType, subtitle?: string) => {
    setToast({ visible: true, message, type, subtitle });
  };

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const formSlide = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(formSlide, {
        toValue: 0,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      showToast('Error', 'error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password);
      }
    } catch (error: any) {
      let message = 'An error occurred';
      if (error.code === 'auth/user-not-found') message = 'No account found with this email';
      else if (error.code === 'auth/wrong-password') message = 'Incorrect password';
      else if (error.code === 'auth/invalid-email') message = 'Invalid email address';
      else if (error.code === 'auth/email-already-in-use') message = 'Email already registered';
      else if (error.code === 'auth/weak-password') message = 'Password should be at least 6 characters';
      else if (error.code === 'auth/invalid-credential') message = 'Invalid email or password';
      showToast('Error', 'error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      showToast('Error', 'warning', 'Please enter your email address first');
      return;
    }

    setResetLoading(true);
    try {
      await resetPassword(email.trim());
      showToast('Success', 'success', 'Password reset email sent');
    } catch (error: any) {
      let message = 'Failed to send reset email';
      if (error.code === 'auth/user-not-found') message = 'No account found with this email';
      else if (error.code === 'auth/invalid-email') message = 'Invalid email address';
      showToast('Error', 'error', message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={isDark
        ? ['#0A0A1A', '#0F0F23', '#1A1035', '#0F0F23']
        : ['#F5F3FF', '#EDE9FE', '#DDD6FE', '#EDE9FE']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Decorative circles */}
      <View style={[styles.circle1, { backgroundColor: colors.primary + '08' }]} />
      <View style={[styles.circle2, { backgroundColor: colors.primary + '06' }]} />
      <View style={[styles.circle3, { backgroundColor: colors.accent + '06' }]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        {/* Logo Section */}
        <Animated.View
          style={[
            styles.logoSection,
            {
              opacity: fadeAnim,
              transform: [{ scale: logoScale }, { translateY: slideAnim }],
            },
          ]}
        >
          <View style={[styles.logoContainer, { backgroundColor: colors.primary + '20', borderColor: colors.primary + '40' }]}>
            <Ionicons name="briefcase" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>SalesVisit</Text>
          <Text style={[styles.appTagline, { color: colors.textSecondary }]}>
            AI-Powered Visit Logger
          </Text>
        </Animated.View>

        {/* Form Section */}
        <Animated.View
          style={[
            styles.formSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: formSlide }],
            },
          ]}
        >
          <View style={[styles.formCard, { backgroundColor: colors.card + (isDark ? '' : 'F0'), borderColor: colors.cardBorder }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </Text>
            <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
              {isLogin ? 'Sign in to continue' : 'Register to get started'}
            </Text>

            {/* Email */}
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
              <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
              <TextInput
                style={[styles.input, { color: colors.inputText }]}
                placeholder="Email address"
                placeholderTextColor={colors.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, marginBottom: isLogin ? 8 : 14 }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
              <TextInput
                style={[styles.input, { color: colors.inputText }]}
                placeholder="Password"
                placeholderTextColor={colors.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                textContentType="password"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            {isLogin && (
              <TouchableOpacity
                onPress={handleForgotPassword}
                disabled={resetLoading}
                style={styles.forgotPasswordContainer}
              >
                <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                  {resetLoading ? 'Sending...' : 'Forgot Password?'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
                style={styles.submitButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.submitText}>
                      {isLogin ? 'Sign In' : 'Create Account'}
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Toggle */}
            <TouchableOpacity
              onPress={() => setIsLogin(!isLogin)}
              style={styles.toggleButton}
            >
              <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <Text style={{ color: colors.primary, fontWeight: '700' }}>
                  {isLogin ? 'Register' : 'Sign In'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Toast */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        subtitle={toast.subtitle}
        onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  circle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -50,
    right: -80,
  },
  circle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    bottom: -30,
    left: -60,
  },
  circle3: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    top: height * 0.3,
    left: -40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
  },
  appTagline: {
    fontSize: 15,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  formSection: {
    width: '100%',
  },
  formCard: {
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    marginBottom: 28,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
    marginTop: 8,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  toggleButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  toggleText: {
    fontSize: 14,
  },
});
