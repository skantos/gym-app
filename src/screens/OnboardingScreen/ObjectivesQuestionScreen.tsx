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

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>

      {/* Header Section - ARRIBA */}
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

        <Text style={[styles.title, { color: theme.colors.accent }]}>
          Selecciona tus objetivos
        </Text>
        <Text style={[styles.subtitle, { color: '#9CA3AF' }]}>
          Elige los grupos musculares que quieres priorizar
        </Text>
      </Animated.View>

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
                    : theme.colors.borderNeon
                }
              ]}
              onPress={() => toggleCategory(category.id)}
            >
              <Ionicons
                name={category.icon as any}
                size={20}
                color={activeCategory === category.id ? theme.colors.accent : theme.colors.text}
              />
              <Text style={[
                styles.categoryText,
                { color: activeCategory === category.id ? theme.colors.accent : theme.colors.text }
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Body Model */}
      <Animated.View
        entering={FadeInDown.delay(300).springify()}
        style={styles.modelSection}
      >
        <View style={[styles.modelCard]}>
          <View style={styles.modelHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Modelo corporal</Text>
            <View style={styles.modelActions}>
              <TouchableOpacity style={[styles.iconBtn, { borderColor: theme.colors.card }]} onPress={() => setSide((p) => (p === 'front' ? 'back' : 'front'))}>
                <Ionicons name="refresh-outline" size={18} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.modelWrapper}>
            <Body
              data={data}
              gender={gender}
              side={side}
              scale={1.2}
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

      {/* Muscle Grid */}
      <Animated.View
        entering={FadeInDown.delay(600).springify()}
        style={styles.muscleSection}
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
                    minWidth: 120, 
                    maxWidth: 140,
                  }
                ]}
                onPress={() => toggleMuscle(item)}
              >
                <Text style={[
                  styles.muscleText,
                  { color: isSelected ? theme.colors.accent : theme.colors.text }
                ]}>
                  {MUSCLE_LABELS[item] || item}
                </Text>
                {isSelected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={theme.colors.accent}
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            );
          }}
        />
      </Animated.View>


      {/* Next Button - ABAJO */}
      <Animated.View
        entering={FadeInUp.delay(800).springify()}
        style={styles.buttonSection}
      >
        <TouchableOpacity
          style={[styles.nextBtn, { opacity: loading ? 0.6 : 1 }]}
          disabled={loading}
        >
          <LinearGradient
            colors={[theme.colors.accent, theme.colors.accent + 'CC']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.nextTxt, { color: theme.colors.background }]}>
              {loading ? 'Guardando...' : 'Finalizar'}
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
    paddingHorizontal: 20,
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
  categorySection: {
    marginBottom: 20,
  },
  modelSection: {
    marginBottom: 12,
  },
  modelCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  modelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  modelActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modelWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  categoryContainer: {
    paddingHorizontal: 8,
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  muscleSection: {
    flex: 1,
    marginBottom: 20,
  },
  muscleGrid: {
    paddingHorizontal: 8,
    gap: 12,
  },
  muscleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    margin: 6,
    alignSelf: 'flex-start',
  },
  muscleText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  checkIcon: {
    marginLeft: 8,
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

  muscleRow: {
    paddingHorizontal: 1,
    marginBottom: 12,
    gap: 10,
  },
});