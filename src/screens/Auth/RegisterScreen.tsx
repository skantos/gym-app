import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useNavigation } from '@react-navigation/native';

export default function RegisterScreen() {
  const theme = useTheme();
  const { registerWithEmail } = useUser();
  const navigation = useNavigation<any>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      await registerWithEmail(firstName.trim(), lastName.trim(), email.trim(), password);
      // Tras registrarse, el stack cambia a autenticado. Solo volvemos si existe una ruta previa.
      if (navigation && typeof (navigation as any).canGoBack === 'function' && (navigation as any).canGoBack()) {
        navigation.goBack();
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      {/* Header with back button */}
      <Animated.View 
        entering={FadeInUp.delay(200).springify()} 
        style={styles.headerSection}
      >
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Crear cuenta
        </Text>
      </Animated.View>

      {/* Registration Form */}
      <Animated.View 
        entering={FadeInDown.delay(400).springify()} 
        style={styles.formContainer}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.registerCard, { backgroundColor: theme.colors.card + '40', borderColor: theme.colors.borderNeon }]}>
            
            {/* First Name Input */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, { borderColor: theme.colors.borderNeon }]}>
                <User size={20} color={'#9CA3AF'} style={styles.inputIcon} />
                <TextInput
                  placeholder="Nombre"
                  placeholderTextColor={'#9CA3AF'}
                  value={firstName}
                  onChangeText={setFirstName}
                  editable={!loading}
                  autoCapitalize="words"
                  style={[styles.input, { color: theme.colors.text }]}
                />
              </View>
            </View>

            {/* Last Name Input */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, { borderColor: theme.colors.borderNeon }]}>
                <User size={20} color={'#9CA3AF'} style={styles.inputIcon} />
                <TextInput
                  placeholder="Apellido"
                  placeholderTextColor={'#9CA3AF'}
                  value={lastName}
                  onChangeText={setLastName}
                  editable={!loading}
                  autoCapitalize="words"
                  style={[styles.input, { color: theme.colors.text }]}
                />
              </View>
            </View>

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

            {/* Register Button */}
            <TouchableOpacity 
              onPress={onRegister} 
              disabled={loading} 
              style={[styles.registerButton, { opacity: loading ? 0.7 : 1 }]}
            >
              <LinearGradient
                colors={[theme.colors.accent, theme.colors.accent + 'CC']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={[styles.buttonText, { color: theme.colors.background }]}>
                  {loading ? 'Cargando...' : 'Crear cuenta'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    marginBottom: 30,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  formContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  registerCard: {
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
  registerButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
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
});