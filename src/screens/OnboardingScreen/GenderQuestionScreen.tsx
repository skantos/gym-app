import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase';

const { width, height } = Dimensions.get('window');

export default function GenderQuestionScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [gender, setGender] = useState<'male'|'female'|null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const userId = sess.session?.user?.id;
      if (!userId) return;
      const { data } = await supabase.from('initial_survey').select('gender').eq('user_id', userId).maybeSingle();
      if (data?.gender) setGender(data.gender as any);
    })();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      
      {/* Header Section - ARRIBA */}
      <Animated.View 
        entering={FadeInUp.delay(200).springify()} 
        style={styles.headerSection}
      >
        <Text style={[styles.title, { color: theme.colors.accent }]}>
          ¿Cuál es tu género?
        </Text>
        <Text style={[styles.subtitle, { color: '#9CA3AF' }]}>
          Selecciona una opción para personalizar tu experiencia
        </Text>
      </Animated.View>

      {/* Gender Selection - CENTRO */}
      <Animated.View 
        entering={FadeInDown.delay(400).springify()} 
        style={styles.selectionContainer}
      >
        <View style={styles.row}>
          
          {/* Masculino Card */}
          <TouchableOpacity
            style={[
              styles.card, 
              { 
                borderColor: gender === 'male' ? theme.colors.accent : theme.colors.borderNeon,
                backgroundColor: gender === 'male' ? theme.colors.accent + '20' : 'rgba(255, 255, 255, 0.02)'
              }
            ]}
            onPress={() => setGender('male')}
            disabled={loading}
          >
            <View style={[
              styles.iconContainer,
              { 
                backgroundColor: gender === 'male' ? theme.colors.accent + '40' : 'transparent',
                borderColor: gender === 'male' ? theme.colors.accent : theme.colors.borderNeon
              }
            ]}>
              <Ionicons 
                name="male" 
                size={40} 
                color={gender === 'male' ? theme.colors.accent : theme.colors.borderNeon} 
              />
            </View>
            
            <Text style={[
              styles.cardText, 
              { color: gender === 'male' ? theme.colors.accent : theme.colors.text }
            ]}>
              Masculino
            </Text>
          </TouchableOpacity>

          {/* Femenino Card */}
          <TouchableOpacity
            style={[
              styles.card, 
              { 
                borderColor: gender === 'female' ? theme.colors.accent : theme.colors.borderNeon,
                backgroundColor: gender === 'female' ? theme.colors.accent + '20' : 'rgba(255, 255, 255, 0.02)'
              }
            ]}
            onPress={() => setGender('female')}
            disabled={loading}
          >
            <View style={[
              styles.iconContainer,
              { 
                backgroundColor: gender === 'female' ? theme.colors.accent + '40' : 'transparent',
                borderColor: gender === 'female' ? theme.colors.accent : theme.colors.borderNeon
              }
            ]}>
              <Ionicons 
                name="female" 
                size={40} 
                color={gender === 'female' ? theme.colors.accent : theme.colors.borderNeon} 
              />
            </View>
            
            <Text style={[
              styles.cardText, 
              { color: gender === 'female' ? theme.colors.accent : theme.colors.text }
            ]}>
              Femenino
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Next Button - ABAJO */}
      <Animated.View 
        entering={FadeInUp.delay(600).springify()} 
        style={styles.buttonSection}
      >
        <TouchableOpacity 
          style={[styles.nextBtn, { opacity: loading || !gender ? 0.6 : 1 }]} 
          onPress={async () => {
            try {
              if (!gender) return;
              setLoading(true);
              const { data: sess } = await supabase.auth.getSession();
              const userId = sess.session?.user?.id;
              if (!userId) throw new Error('Sin sesión');
              await supabase.from('initial_survey').upsert({ user_id: userId, gender });
              (navigation as any).navigate('ObjectivesQuestion');
            } catch (e:any) {
              Alert.alert('Error', e?.message ?? 'No se pudo guardar');
            } finally { setLoading(false); }
          }}
          disabled={loading || !gender}
        >
          <LinearGradient
            colors={[theme.colors.accent, theme.colors.accent + 'CC']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.nextTxt, { color: theme.colors.background }]}>
              {loading ? 'Guardando...' : 'Siguiente'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  headerSection: {
    alignItems: 'center',
    marginTop: height * 0.1,
    flex: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  selectionContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: { 
    flexDirection: 'row', 
    gap: 20,
    justifyContent: 'center',
    width: '100%',
  },
  card: { 
    width: width * 0.4,
    borderWidth: 1, 
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardText: { 
    fontSize: 18, 
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
    alignItems: 'center',
  },
  nextBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 300,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextTxt: { 
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
  },
});