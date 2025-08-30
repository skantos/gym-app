import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions, ScrollView, FlatList } from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../services/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Body from 'react-native-body-highlighter';
import type { ExtendedBodyPart, Slug } from 'react-native-body-highlighter';

const { width, height } = Dimensions.get('window');

// Definición de categorías y músculos
const MUSCLE_CATEGORIES = [
  {
    id: 'brazos',
    name: 'Brazos',
    muscles: ['biceps', 'triceps', 'deltoids', 'forearm'],
    icon: 'fitness'
  },
  {
    id: 'pecho',
    name: 'Pecho',
    muscles: ['chest'],
    icon: 'body'
  },
  {
    id: 'espalda',
    name: 'Espalda',
    muscles: ['trapezius', 'upper-back', 'lower-back'],
    icon: 'accessibility'
  },
  {
    id: 'core',
    name: 'Core',
    muscles: ['obliques', 'abs'],
    icon: 'ellipse'
  },
  {
    id: 'piernas',
    name: 'Piernas',
    muscles: ['quadriceps', 'hamstring', 'gluteal', 'calves', 'adductors'],
    icon: 'walk'
  },
  {
    id: 'cuello',
    name: 'Cuello',
    muscles: ['neck'],
    icon: 'person'
  }
];

const MUSCLE_LABELS: Record<string, string> = {
  chest: 'Pectorales',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  deltoids: 'Hombros',
  forearm: 'Antebrazos',
  trapezius: 'Trapecio',
  "upper-back": 'Espalda alta',
  "lower-back": 'Espalda baja',
  obliques: 'Oblicuos',
  abs: 'Abdomen',
  quadriceps: 'Cuádriceps',
  hamstring: 'Isquiotibiales',
  gluteal: 'Glúteos',
  adductors: 'Aductores',
  calves: 'Pantorrillas',
  neck: 'Cuello',
};

export default function ObjectivesQuestionScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [selected, setSelected] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('brazos');
  const [loading, setLoading] = useState(false);
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [screenHeight, setScreenHeight] = useState(height);

  // Detectar cambios en las dimensiones de la pantalla
  const onLayout = (event: any) => {
    const { height: newHeight } = event.nativeEvent.layout;
    setScreenHeight(newHeight);
  };

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const userId = sess.session?.user?.id;
      if (!userId) return;
      const { data: obj } = await supabase.from('objectives').select('muscle_groups').eq('user_id', userId).maybeSingle();
      if (obj?.muscle_groups && Array.isArray(obj.muscle_groups)) {
        setSelected(obj.muscle_groups as string[]);
        return;
      }
      const { data: surv } = await supabase.from('initial_survey').select('muscle_groups').eq('user_id', userId).maybeSingle();
      if (surv?.muscle_groups) {
        try {
          const parsed = Array.isArray(surv.muscle_groups) ? surv.muscle_groups : JSON.parse(surv.muscle_groups);
          if (Array.isArray(parsed)) setSelected(parsed as string[]);
        } catch { }
      }
      const { data: g } = await supabase.from('initial_survey').select('gender').eq('user_id', userId).maybeSingle();
      const gg = (g?.gender as any) || 'male';
      setGender(gg === 'female' ? 'female' : 'male');
    })();
  }, []);

  const data: ExtendedBodyPart[] = useMemo(
    () => selected.map((slug) => ({ slug: slug as Slug, intensity: 2 })) as ExtendedBodyPart[],
    [selected]
  );

  const toggleMuscle = (muscle: string) => {
    if (selected.includes(muscle)) {
      setSelected(selected.filter(m => m !== muscle));
    } else {
      setSelected([...selected, muscle]);
    }
  };

  const toggleCategory = (categoryId: string) => {
    if (activeCategory === categoryId) return;
    setActiveCategory(categoryId);
  };

  const currentCategory = MUSCLE_CATEGORIES.find(cat => cat.id === activeCategory);
  const currentMuscles = currentCategory ? currentCategory.muscles : [];

  const onNext = async () => {
    try {
      setLoading(true);
      const { data: sess } = await supabase.auth.getSession();
      const userId = sess.session?.user?.id;
      if (!userId) throw new Error('Sin sesión');
      await supabase.from('objectives').upsert({ user_id: userId, muscle_groups: selected });
      (navigation as any).navigate('CurrentPhysiqueQuestion');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo guardar');
    } finally {
      setLoading(false);
    }
  };

  // Calcular tamaños dinámicos basados en la altura de la pantalla
  const getDynamicSizes = () => {
    if (screenHeight < 700) {
      // Pantallas pequeñas (menos de 700px de altura)
      return {
        modelHeight: 180,
        modelScale: 0.9,
        muscleButtonMinWidth: 100,
        muscleButtonMaxWidth: 120,
        headerMarginTop: screenHeight * 0.03,
        muscleSectionMaxHeight: 60,
      };
    } else if (screenHeight < 800) {
      // Pantallas medianas (700px - 800px)
      return {
        modelHeight: 220,
        modelScale: 1.0,
        muscleButtonMinWidth: 110,
        muscleButtonMaxWidth: 130,
        headerMarginTop: screenHeight * 0.04,
        muscleSectionMaxHeight: 70,
      };
    } else {
      // Pantallas grandes (más de 800px)
      return {
        modelHeight: 250,
        modelScale: 1.1,
        muscleButtonMinWidth: 120,
        muscleButtonMaxWidth: 140,
        headerMarginTop: screenHeight * 0.05,
        muscleSectionMaxHeight: 80,
      };
    }
  };

  const dynamicSizes = getDynamicSizes();

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]} onLayout={onLayout}>

      {/* Header Section - Optimizado para diferentes tamaños */}
      <Animated.View
        entering={FadeInUp.delay(200).springify()}
        style={[styles.headerSection, { marginTop: dynamicSizes.headerMarginTop }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { borderColor: theme.colors.borderNeon }]}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.title, { color: theme.colors.accent, fontSize: screenHeight < 700 ? 24 : 28 }]}>
          Selecciona tus objetivos
        </Text>
        <Text style={[styles.subtitle, { color: '#9CA3AF', fontSize: screenHeight < 700 ? 14 : 16 }]}>
          Elige los grupos musculares que quieres priorizar
        </Text>
      </Animated.View>

      {/* Categorías - Scroll horizontal compacto */}
      <Animated.View
        entering={FadeInDown.delay(400).springify()}
        style={styles.categorySection}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {MUSCLE_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                {
                  backgroundColor: activeCategory === category.id
                    ? theme.colors.accent + '20'
                    : 'rgba(255, 255, 255, 0.05)',
                  borderColor: activeCategory === category.id
                    ? theme.colors.accent
                    : theme.colors.borderNeon,
                  paddingVertical: screenHeight < 700 ? 8 : 10,
                  paddingHorizontal: screenHeight < 700 ? 12 : 14,
                }
              ]}
              onPress={() => toggleCategory(category.id)}
            >
              <Ionicons
                name={category.icon as any}
                size={screenHeight < 700 ? 16 : 18}
                color={activeCategory === category.id ? theme.colors.accent : theme.colors.text}
              />
              <Text style={[
                styles.categoryText,
                { 
                  color: activeCategory === category.id ? theme.colors.accent : theme.colors.text,
                  fontSize: screenHeight < 700 ? 12 : 13,
                  marginLeft: screenHeight < 700 ? 4 : 6,
                }
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Body Model - Tamaño dinámico */}
      <Animated.View
        entering={FadeInDown.delay(300).springify()}
        style={styles.modelSection}
      >
        <View style={[styles.modelCard]}>
          <View style={styles.modelHeader}>
            <Text style={[styles.sectionTitle, { 
              color: theme.colors.text,
              fontSize: screenHeight < 700 ? 15 : 16 
            }]}>
              Modelo corporal
            </Text>
            <View style={styles.modelActions}>
              <TouchableOpacity 
                style={[styles.iconBtn, { 
                  borderColor: theme.colors.card,
                  width: screenHeight < 700 ? 28 : 32,
                  height: screenHeight < 700 ? 28 : 32,
                }]} 
                onPress={() => setSide((p) => (p === 'front' ? 'back' : 'front'))}
              >
                <Ionicons name="refresh-outline" size={screenHeight < 700 ? 14 : 16} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.modelWrapper, { height: dynamicSizes.modelHeight }]}>
            <Body
              data={data}
              gender={gender}
              side={side}
              scale={dynamicSizes.modelScale}
              border={theme.colors.card}
              colors={["#6B7280", "#9CA3AF"]}
              onBodyPartPress={(bp: any) => {
                const slug = String(bp.slug);
                setSelected((prev) => prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]);
              }}
            />
          </View>
        </View>
      </Animated.View>

      {/* Muscle Grid - Scroll horizontal compacto */}
      <Animated.View
        entering={FadeInDown.delay(600).springify()}
        style={[styles.muscleSection, { maxHeight: dynamicSizes.muscleSectionMaxHeight }]}
      >
        <FlatList
          data={currentMuscles}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.muscleRow}
          renderItem={({ item }) => {
            const isSelected = selected.includes(item);
            return (
              <TouchableOpacity
                style={[
                  styles.muscleButton,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.accent + '20'
                      : 'rgba(255, 255, 255, 0.05)',
                    borderColor: isSelected
                      ? theme.colors.accent
                      : theme.colors.borderNeon,
                    minWidth: dynamicSizes.muscleButtonMinWidth,
                    maxWidth: dynamicSizes.muscleButtonMaxWidth,
                    paddingVertical: screenHeight < 700 ? 10 : 12,
                    paddingHorizontal: screenHeight < 700 ? 12 : 14,
                  }
                ]}
                onPress={() => toggleMuscle(item)}
              >
                <Text style={[
                  styles.muscleText,
                  { 
                    color: isSelected ? theme.colors.accent : theme.colors.text,
                    fontSize: screenHeight < 700 ? 12 : 13,
                  }
                ]}>
                  {MUSCLE_LABELS[item] || item}
                </Text>
                {isSelected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={screenHeight < 700 ? 16 : 18}
                    color={theme.colors.accent}
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            );
          }}
        />
      </Animated.View>

      {/* Next Button - Siempre visible */}
      <Animated.View
        entering={FadeInUp.delay(800).springify()}
        style={styles.buttonSection}
      >
        <TouchableOpacity
          style={[styles.nextBtn, { opacity: loading ? 0.6 : 1 }]}
          onPress={onNext}
          disabled={loading}
        >
          <LinearGradient
            colors={[theme.colors.accent, theme.colors.accent + 'CC']}
            style={[styles.buttonGradient, { paddingVertical: screenHeight < 700 ? 14 : 16 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[
              styles.nextTxt, 
              { 
                color: theme.colors.background,
                fontSize: screenHeight < 700 ? 14 : 15,
              }
            ]}>
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
    marginBottom: 16,
  },
  headerRow: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  title: {
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontWeight: '400',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryContainer: {
    paddingHorizontal: 8,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
  },
  categoryText: {
    fontWeight: '600',
  },
  modelSection: {
    marginBottom: 60,
  },
  modelCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  modelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 50,
    paddingHorizontal: 4,
  },
  modelActions: {
    flexDirection: 'row',
    paddingBottom: 0,
    gap: 6,
  },
  iconBtn: {
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  modelWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontWeight: '700',
  },

  muscleSection: {
    marginTop: 16,  
    marginBottom: 16,
  },
  muscleRow: {
    paddingHorizontal: 8,
    gap: 8,
  },
  muscleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  muscleText: {
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  checkIcon: {
    marginLeft: 6,
  },
  buttonSection: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  nextBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 280,
  },
  buttonGradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextTxt: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});