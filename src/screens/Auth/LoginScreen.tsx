import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
// import BackgroundTheme from '../../components/BackgroundTheme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();
  const { loginWithEmail } = useUser();
  const navigation = useNavigation<any>();

  const onLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      await loginWithEmail(email.trim(), password);
      Alert.alert('¡Bienvenido!', 'Sesión iniciada correctamente');
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const onCreateAccount = () => {
    try {
      (navigation as any).navigate('Register');
    } catch {
      Alert.alert('Crear cuenta', 'Función de registro en desarrollo');
    }
  };

  const onForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Recuperar contraseña', 'Ingresa tu email para enviarte un enlace de recuperación.');
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw error;
      Alert.alert('Revisa tu correo', 'Te enviamos un enlace para restablecer tu contraseña.');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo enviar el correo de recuperación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}> 
      {/* BackgroundTheme removed to keep solid black background */}
      
      {/* Header Section */}
      <Animated.View 
        entering={FadeInUp.delay(200).springify()} 
        style={styles.headerSection}
      >

        <Text style={[styles.welcomeText, { color: '#9CA3AF' }]}> 
          Bienvenido de vuelta
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.text }]}> 
          Iniciar sesión
        </Text>
      </Animated.View>

      {/* Login Form */}
      <Animated.View 
        entering={FadeInDown.delay(400).springify()} 
        style={styles.formContainer}
      >
        <View style={[styles.loginCard, { backgroundColor: theme.colors.card + '40', borderColor: theme.colors.borderNeon }]}> 
          
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, { borderColor: theme.colors.borderNeon }]}> 
              <Mail size={20} color={'#9CA3AF'} style={styles.inputIcon} />
              <TextInput
                placeholder="Email"
                placeholderTextColor={'#9CA3AF'}
                value={email}
                onChangeText={setEmail}
                editable={!loading}
                autoCapitalize="none"
                keyboardType="email-address"
                style={[styles.input, { color: theme.colors.text }]}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, { borderColor: theme.colors.borderNeon }]}> 
              <Lock size={20} color={'#9CA3AF'} style={styles.inputIcon} />
              <TextInput
                placeholder="Contraseña"
                placeholderTextColor={'#9CA3AF'}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                secureTextEntry={!showPassword}
                style={[styles.input, { color: theme.colors.text }]}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                {showPassword ? (
                  <EyeOff size={20} color={'#9CA3AF'} />
                ) : (
                  <Eye size={20} color={'#9CA3AF'} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity 
            onPress={onForgotPassword} 
            disabled={loading} 
            style={styles.forgotPasswordButton}
          >
            <Text style={[styles.forgotPasswordText, { color: theme.colors.accent }]}> 
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity 
            onPress={onLogin} 
            disabled={loading} 
            style={[styles.loginButton, { opacity: loading ? 0.7 : 1 }]}
          >
            <LinearGradient
              colors={[theme.colors.accent, theme.colors.accent + 'CC']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[styles.buttonText, { color: theme.colors.background }]}> 
                {loading ? 'Cargando...' : 'ENTRAR'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.borderNeon }]} />
            <Text style={[styles.dividerText, { color: '#9CA3AF' }]}>o</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.borderNeon }]} />
          </View>

          {/* Create Account Button */}
          <TouchableOpacity 
            onPress={onCreateAccount} 
            disabled={loading} 
            style={[styles.createAccountButton, { borderColor: theme.colors.borderNeon }]}
          >
            <Text style={[styles.createAccountText, { color: theme.colors.text }]}> 
              Crear cuenta
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: 80,
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  loginCard: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  createAccountButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  createAccountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSection: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  bottomText: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 16,
  },
});