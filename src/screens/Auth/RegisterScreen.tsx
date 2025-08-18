import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useNavigation } from '@react-navigation/native';

export default function RegisterScreen() {
  const theme = useTheme();
  const { registerWithEmail } = useUser();
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState<'male' | 'female'>('male');

  const onRegister = async () => {
    try {
      setLoading(true);
      await registerWithEmail(name.trim(), email.trim(), password, gender);
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Crear cuenta</Text>

      <Text style={[styles.label, { color: theme.colors.text }]}>Género</Text>
      <View style={styles.genderRow}>
        <TouchableOpacity
          onPress={() => setGender('male')}
          style={[
            styles.genderButton,
            { borderColor: gender === 'male' ? theme.colors.accent : theme.colors.card, backgroundColor: theme.colors.card + '50' },
          ]}
        >
          <Text style={[styles.genderText, { color: theme.colors.text }]}>Hombre</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setGender('female')}
          style={[
            styles.genderButton,
            { borderColor: gender === 'female' ? theme.colors.accent : theme.colors.card, backgroundColor: theme.colors.card + '50' },
          ]}
        >
          <Text style={[styles.genderText, { color: theme.colors.text }]}>Mujer</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.card }]}
        placeholder="Nombre"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.card }]}
        placeholder="Email"
        placeholderTextColor="#aaa"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.card }]}
        placeholder="Contraseña"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity onPress={onRegister} disabled={loading} style={[styles.button, { backgroundColor: theme.colors.accent }] }>
        <Text style={styles.buttonText}>{loading ? 'Cargando...' : 'Crear cuenta'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  genderButton: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 10,
  },
  genderText: {
    fontWeight: '700',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#000',
    fontWeight: '700',
  },
});


