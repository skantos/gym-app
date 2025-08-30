import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import Body from 'react-native-body-highlighter';
import type { ExtendedBodyPart, Slug } from 'react-native-body-highlighter';
import { useUser } from '../../context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';

type ObjectiveSelectorProps = {
  selected: string[];
  onChange: (nextSelected: string[]) => void;
};

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

const MUSCLE_CATEGORIES = {
  brazos: ['biceps', 'triceps', 'deltoids', 'forearm'],
  pecho: ['chest'],
  espalda: ['trapezius', 'upper-back', 'lower-back'],
  core: ['obliques', 'abs'],
  piernas: ['quadriceps', 'hamstring', 'gluteal', 'calves', 'adductors'],
  cuello: ['neck']
};

const CATEGORY_LABELS: Record<string, string> = {
  brazos: 'Brazos',
  pecho: 'Pecho',
  espalda: 'Espalda',
  core: 'Core',
  piernas: 'Piernas',
  cuello: 'Cuello'
};

const ALLOWED_SLUGS = Object.keys(MUSCLE_LABELS);

export default function ObjectiveSelector({ selected, onChange }: ObjectiveSelectorProps) {
  const theme = useTheme();
  const { user } = useUser();
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [gender, setGender] = useState<'male'|'female'>(user?.gender === 'female' ? 'female' : 'male');
  const [activeCategory, setActiveCategory] = useState<string>('pecho');
  const { width } = useWindowDimensions();
  
  const isSmallScreen = width < 768;

  useEffect(() => {
    (async () => {
      try {
        const { supabase } = await import('../../services/supabase');
        const { data: sess } = await supabase.auth.getSession();
        const uid = sess.session?.user?.id;
        if (uid) {
          const { data } = await supabase.from('initial_survey').select('gender').eq('user_id', uid).maybeSingle();
          const g = (data?.gender as any) || (user?.gender === 'female' ? 'female' : 'male');
          setGender(g === 'female' ? 'female' : 'male');
        }
      } catch {}
    })();
  }, [user?.gender]);

  const data: ExtendedBodyPart[] = useMemo(
    () => selected.map((slug) => ({ slug: slug as Slug, intensity: 2 })) as ExtendedBodyPart[],
    [selected]
  );

  const toggle = (slug: string) => {
    if (!ALLOWED_SLUGS.includes(slug)) return;
    if (selected.includes(slug)) {
      onChange(selected.filter((s) => s !== slug));
    } else {
      onChange([...selected, slug]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header con botón de girar */}
      <View style={styles.header}>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: theme.colors.card + '40', borderColor: theme.colors.borderNeon }]} 
            onPress={() => setSide((p) => (p === 'front' ? 'back' : 'front'))}
          >
            <Ionicons name="refresh-outline" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenedor holográfico del modelo */}
      <LinearGradient
        colors={['#00F5FF', '#FF00FF', '#00FF94']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientWrapper}
      >
        <View style={styles.bodyGlow}>
          <Body
            data={data}
            gender={gender}
            side={side}
            scale={isSmallScreen ? 1.0 : 1.3}
            border={theme.colors.borderNeon}
            colors={['#00F5FF', '#FF00FFAA', '#00FF94']} // degradado neón
            onBodyPartPress={(bp: any) => toggle(bp.slug)}
          />
        </View>
      </LinearGradient>

      {/* Selector de categorías */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.categoriesContainer}
      >
        {Object.keys(MUSCLE_CATEGORIES).map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryPill, 
              { 
                borderColor: activeCategory === category ? theme.colors.accent : theme.colors.borderNeon, 
                backgroundColor: activeCategory === category ? theme.colors.accent + '20' : theme.colors.card + '40'
              }
            ]}
            onPress={() => setActiveCategory(category)}
          >
            <Text style={[
              styles.categoryText, 
              { color: activeCategory === category ? theme.colors.accent : theme.colors.text }
            ]}>
              {CATEGORY_LABELS[category] ?? category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Músculos de la categoría seleccionada */}
      <View style={styles.musclesGrid}>
        {MUSCLE_CATEGORIES[activeCategory]?.map((slug) => {
          const isSelected = selected.includes(slug);
          return (
            <TouchableOpacity
              key={slug}
              style={[
                styles.musclePill, 
                { 
                  borderColor: isSelected ? theme.colors.accent : theme.colors.borderNeon, 
                  backgroundColor: isSelected ? theme.colors.accent + '20' : theme.colors.card + '40',
                  width: isSmallScreen ? '48%' : '30%'
                }
              ]}
              onPress={() => toggle(slug)}
            >
              <Text style={[
                styles.muscleText, 
                { color: isSelected ? theme.colors.accent : theme.colors.text }
              ]}>
                {MUSCLE_LABELS[slug] ?? slug}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    alignItems: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  gradientWrapper: {
    borderRadius: 20,
    padding: 3,
    marginVertical: 8,
  },
  bodyGlow: {
    backgroundColor: '#000',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    height: 250,
    width: '100%',
    shadowColor: '#00F5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12, // Android glow
  },
  categoriesContainer: {
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  musclesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 5,
    justifyContent: 'center',
    width: '100%',
  },
  musclePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 8,
  },
  muscleText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
