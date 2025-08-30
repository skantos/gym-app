import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions, ScrollView, Image } from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../services/supabase';

const { width, height } = Dimensions.get('window');

const OPTIONS = [
  { id: 'slim', label: 'Delgado', desc: 'Complexión delgada, bajo peso corporal' },
  { id: 'normal', label: 'Normal', desc: 'Peso y complexión promedio saludable' },
  { id: 'muscular', label: 'Musculoso', desc: 'Buena masa muscular desarrollada' },
  { id: 'fat', label: 'Gordo', desc: 'Sobrepeso, necesita reducir grasa' },
  { id: 'obese', label: 'Obeso', desc: 'Obesidad, requiere plan especializado' },
];

const IMAGE_BY_ID: Record<string, any> = {
  slim: require('../../assets/images/delgado.png'),
  normal: require('../../assets/images/normal.jpg'),
  muscular: require('../../assets/images/musculoso.png'),
  fat: require('../../assets/images/gordo.png'),
  obese: require('../../assets/images/obeso.png'),
};

export default function CurrentPhysiqueQuestionScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const userId = sess.session?.user?.id;
      if (!userId) return;
      const { data } = await supabase
        .from('initial_survey')
        .select('current_physique')
        .eq('user_id', userId)
        .maybeSingle();
      if (data?.current_physique) setValue(data.current_physique);
    })();
  }, []);

  const onNext = async () => {
    try {
      setLoading(true);
      const { data: sess } = await supabase.auth.getSession();
      const userId = sess.session?.user?.id;
      if (!userId) throw new Error('Sin sesión');
      await supabase.from('initial_survey').upsert({ user_id: userId, current_physique: value });
      navigation.navigate('WeightHeightQuestion');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}> 
      <Animated.View 
        entering={FadeInUp.delay(200).springify()} 
        style={styles.headerSection}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { borderColor: theme.colors.borderNeon }]}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.title, { color: theme.colors.accent }]}>Tu físico actual</Text>
        <Text style={[styles.subtitle, { color: '#9CA3AF' }]}>Selecciona la opción que mejor te describa</Text>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(400).springify()} 
        style={styles.optionsSection}
      >
        <ScrollView contentContainerStyle={styles.optionsContainer}>
          {OPTIONS.map((opt, idx) => {
            const selected = value === opt.id;
            const CardInner = (
              <View style={[styles.row, { gap: 12 }]}>
                {/* Imagen izquierda */}
                <View style={styles.leadingGroup}>
                  <View style={[styles.leadImageWrap, { borderColor: selected ? theme.colors.accent : theme.colors.borderNeon }]}> 
                    <Image source={IMAGE_BY_ID[opt.id] || IMAGE_BY_ID['normal']} style={styles.leadImage} resizeMode="cover" />
                  </View>
                </View>

                {/* Texto */}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.optionTitle, { color: selected ? theme.colors.accent : theme.colors.text }]} numberOfLines={1}>
                    {opt.label}
                  </Text>
                  <Text style={[styles.optionDesc, { color: selected ? theme.colors.accent + 'CC' : '#9CA3AF' }]} numberOfLines={2}>
                    {opt.desc}
                  </Text>
                </View>

                {/* Indicador derecha */}
                <View style={styles.trailingWrap}>
                  {selected ? (
                    <Ionicons name="checkmark-circle" size={22} color={theme.colors.accent} />
                  ) : (
                    <Ionicons name="ellipse-outline" size={22} color={theme.colors.text + '66'} />
                  )}
                </View>
              </View>
            );

            return (
              <TouchableOpacity key={opt.id} activeOpacity={0.9} onPress={() => setValue(opt.id)}>
                {selected ? (
                  <LinearGradient
                    colors={[theme.colors.accent + '30', theme.colors.accent + '10']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.optionGradient, { borderColor: theme.colors.accent }]}
                  >
                    {CardInner}
                  </LinearGradient>
                ) : (
                  <View style={[styles.optionButton, { borderColor: theme.colors.borderNeon }]}> 
                    {CardInner}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>

      <Animated.View 
        entering={FadeInUp.delay(800).springify()} 
        style={styles.buttonSection}
      >
        <TouchableOpacity 
          style={[styles.nextBtn, { opacity: loading || !value ? 0.6 : 1 }]} 
          onPress={onNext} 
          disabled={loading || !value}
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
    paddingHorizontal: 16,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: height * 0.05,
    marginBottom: 20,
  },
  headerRow: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  title: { 
    fontSize: 28, 
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
  optionsSection: {
    flex: 1,
    marginBottom: 20,
  },
  optionsContainer: {
    paddingHorizontal: 8,
    gap: 12,
  },
  optionButton: {
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 6,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  optionGradient: {
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 6,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leadingGroup: {
    width: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leadImageWrap: {
    width: 64,
    height: 64,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  leadImage: {
    width: '100%',
    height: '100%',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 13,
    fontWeight: '500',
  },
  trailingWrap: {
    width: 28,
    alignItems: 'center',
  },
  buttonSection: {
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
