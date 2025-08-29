import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { supabase } from '../../services/supabase';
import { Ionicons } from '@expo/vector-icons';
import ObjectiveSelector from './ObjectiveSelector';
import { saveObjectives, getObjectives } from '../../services/objectives';

type SurveyData = {
  goal: string;
  daysPerWeek: number | null;
  sessionDurationMinutes: number | null;
  equipmentAccess: 'full_gym' | 'home_dumbbells_bands' | 'bodyweight' | '';
  experience: 'beginner' | 'intermediate' | 'advanced' | '';
  hasInjury: boolean | null;
  injuries: string[];
  mobilityRestriction: '' | 'knees' | 'hips' | 'shoulders' | 'spine' | 'none';
  trainingPreference: 'gym_classic' | 'circuits_hiit' | 'bodyweight' | 'mixed' | '';
  aestheticGoal: 'athletic' | 'slim' | 'muscular' | 'defined' | 'curvy' | '';
  sleepHoursRange: '' | 'lt6' | '6_7' | '7_8' | 'gt8';
  weightKg: number | null;
  heightCm: number | null;
  // Nuevas preferencias (solo selección)
  splitPreference: '' | 'full_body' | 'upper_lower' | 'push_pull_legs';
  preferredTime: '' | 'morning' | 'afternoon' | 'evening';
  intensity: '' | 'low' | 'moderate' | 'high';
  restPreference: '' | 'short' | 'standard' | 'long';
  warmupPreference: '' | 'short' | 'standard' | 'extended';
  supersetsPreference: '' | 'none' | 'sometimes' | 'frequent';
  dropsetsPreference: '' | 'none' | 'sometimes' | 'frequent';
};

const GOALS = [
  { id: 'lose_weight', label: 'Perder peso', icon: 'trending-down' },
  { id: 'gain_muscle', label: 'Ganar músculo', icon: 'fitness' },
  { id: 'maintain', label: 'Mantener forma', icon: 'heart' },
  { id: 'strength', label: 'Aumentar fuerza', icon: 'flash' },
  { id: 'endurance', label: 'Mejorar resistencia', icon: 'timer' },
];

const AESTHETIC_GOALS = [
  { id: 'athletic', label: 'Atlético', icon: 'body' },
  { id: 'slim', label: 'Delgado', icon: 'person' },
  { id: 'muscular', label: 'Musculoso', icon: 'fitness' },
  { id: 'defined', label: 'Definido', icon: 'flash' },
  { id: 'curvy', label: 'Curvilíneo', icon: 'body' },
];

const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Principiante', description: 'Nunca entrené o < 6 meses' },
  { id: 'intermediate', label: 'Intermedio', description: '6 meses – 2 años' },
  { id: 'advanced', label: 'Avanzado', description: '> 2 años' },
];

const DAYS_PER_WEEK_OPTIONS = [2, 3, 4, 5, 6];
const SESSION_DURATION_OPTIONS = [
  { id: 30, label: '30 min' },
  { id: 45, label: '45 min' },
  { id: 60, label: '1 hora' },
  { id: 90, label: '1h 30m' },
  { id: 120, label: '2h o más' },
];

const EQUIPMENT_OPTIONS = [
  { id: 'full_gym', label: 'Sí, gimnasio completo', icon: 'fitness' },
  { id: 'home_dumbbells_bands', label: 'Casa: mancuernas / bandas', icon: 'home' },
  { id: 'bodyweight', label: 'Solo peso corporal', icon: 'body' },
] as const;

const INJURY_OPTIONS = [
  { id: 'knee', label: 'Problemas de rodilla' },
  { id: 'back', label: 'Problemas de espalda' },
  { id: 'shoulder', label: 'Problemas de hombro' },
  { id: 'asthma', label: 'Asma' },
  { id: 'hypertension', label: 'Hipertensión' },
  { id: 'diabetes', label: 'Diabetes' },
  { id: 'other', label: 'Otra condición' },
];

const MOBILITY_RESTRICTIONS = [
  { id: 'none', label: 'No' },
  { id: 'knees', label: 'Sí, en rodillas' },
  { id: 'hips', label: 'Sí, en cadera' },
  { id: 'shoulders', label: 'Sí, en hombros' },
  { id: 'spine', label: 'Sí, en columna' },
];

const TRAINING_STYLES = [
  { id: 'gym_classic', label: 'Rutinas clásicas de gimnasio' },
  { id: 'circuits_hiit', label: 'Circuitos / HIIT' },
  { id: 'bodyweight', label: 'Peso corporal / Calistenia' },
  { id: 'mixed', label: 'Mixto' },
];

const SLEEP_OPTIONS = [
  { id: 'lt6', label: 'Menos de 6h' },
  { id: '6_7', label: '6-7h' },
  { id: '7_8', label: '7-8h' },
  { id: 'gt8', label: 'Más de 8h' },
];

// Nuevos conjuntos de opciones
const SPLIT_OPTIONS = [
  { id: 'full_body', label: 'Full body' },
  { id: 'upper_lower', label: 'Upper / Lower' },
  { id: 'push_pull_legs', label: 'Push / Pull / Legs' },
] as const;

const TIME_OPTIONS = [
  { id: 'morning', label: 'Mañana' },
  { id: 'afternoon', label: 'Tarde' },
  { id: 'evening', label: 'Noche' },
] as const;

const INTENSITY_OPTIONS = [
  { id: 'low', label: 'Baja' },
  { id: 'moderate', label: 'Moderada' },
  { id: 'high', label: 'Alta' },
] as const;

const REST_OPTIONS = [
  { id: 'short', label: 'Corta (30-60s)' },
  { id: 'standard', label: 'Estándar (60-90s)' },
  { id: 'long', label: 'Larga (90-120s)' },
] as const;

const WARMUP_OPTIONS = [
  { id: 'short', label: 'Breve (5 min)' },
  { id: 'standard', label: 'Estándar (10 min)' },
  { id: 'extended', label: 'Extendido (15+ min)' },
] as const;

const SUPERSETS_OPTIONS = [
  { id: 'none', label: 'No usar' },
  { id: 'sometimes', label: 'A veces' },
  { id: 'frequent', label: 'Frecuente' },
] as const;

const DROPSETS_OPTIONS = [
  { id: 'none', label: 'No usar' },
  { id: 'sometimes', label: 'A veces' },
  { id: 'frequent', label: 'Frecuente' },
] as const;

export default function InitialSurveyScreen({ navigation }: any) {
  const theme = useTheme();
  const { user, markSurveyCompleted } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    goal: '',
    daysPerWeek: null,
    sessionDurationMinutes: null,
    equipmentAccess: '',
    experience: '',
    hasInjury: null,
    injuries: [],
    mobilityRestriction: '',
    trainingPreference: '',
    aestheticGoal: '',
    sleepHoursRange: '',
    weightKg: null,
    heightCm: null,
    splitPreference: '',
    preferredTime: '',
    intensity: '',
    restPreference: '',
    warmupPreference: '',
    supersetsPreference: '',
    dropsetsPreference: '',
  });

  type Step = {
    key: string;
    title: string;
    subtitle: string;
    component: React.ReactNode;
    isValid: () => boolean;
  };

  const steps: Step[] = useMemo(() => {
    const list: Step[] = [];

    list.push({
      key: 'muscles',
      title: 'Elige tus músculos objetivo',
      subtitle: 'Toca en el cuerpo o elige de la lista',
      component: (
        <ObjectiveSelector
          selected={selectedMuscles}
          onChange={setSelectedMuscles}
        />
      ),
      isValid: () => selectedMuscles.length > 0,
    });

    list.push({
      key: 'goal',
      title: '¿Cuál es tu meta principal?',
      subtitle: 'Elige lo que más te motiva',
      component: (
        <View style={styles.optionsContainer}>
          {GOALS.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.optionCard,
                { backgroundColor: theme.colors.card },
                surveyData.goal === goal.id && { borderColor: theme.colors.accent, borderWidth: 2 }
              ]}
              onPress={() => setSurveyData({ ...surveyData, goal: goal.id })}
            >
              <Ionicons name={goal.icon as any} size={24} color={theme.colors.accent} />
              <Text style={[styles.optionText, { color: theme.colors.text }]}>{goal.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ),
      isValid: () => !!surveyData.goal,
    });

    list.push({
      key: 'days_per_week',
      title: 'Disponibilidad semanal',
      subtitle: '¿Cuántos días puedes entrenar por semana?',
      component: (
        <View style={styles.optionsContainer}>
          {DAYS_PER_WEEK_OPTIONS.map((d) => (
            <TouchableOpacity
              key={d}
              style={[
                styles.optionCard,
                { backgroundColor: theme.colors.card },
                surveyData.daysPerWeek === d && { borderColor: theme.colors.accent, borderWidth: 2 }
              ]}
              onPress={() => setSurveyData({ ...surveyData, daysPerWeek: d })}
            >
              <Ionicons name="calendar" size={24} color={theme.colors.accent} />
              <Text style={[styles.optionText, { color: theme.colors.text }]}>{d} días</Text>
            </TouchableOpacity>
          ))}
        </View>
      ),
      isValid: () => typeof surveyData.daysPerWeek === 'number',
    });

    list.push({
      key: 'session_duration',
      title: 'Disponibilidad semanal',
      subtitle: '¿Cuánto tiempo por sesión?',
      component: (
        <View style={styles.optionsContainer}>
          {SESSION_DURATION_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.optionCard,
                { backgroundColor: theme.colors.card },
                surveyData.sessionDurationMinutes === opt.id && { borderColor: theme.colors.accent, borderWidth: 2 }
              ]}
              onPress={() => setSurveyData({ ...surveyData, sessionDurationMinutes: opt.id })}
            >
              <Ionicons name="time" size={24} color={theme.colors.accent} />
              <Text style={[styles.optionText, { color: theme.colors.text }]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ),
      isValid: () => typeof surveyData.sessionDurationMinutes === 'number',
    });

    list.push({
      key: 'equipment',
      title: 'Acceso a equipamiento',
      subtitle: 'Esto nos ayudará a personalizar tu rutina',
      component: (
        <View style={styles.optionsContainer}>
          {EQUIPMENT_OPTIONS.map((e) => (
            <TouchableOpacity
              key={e.id}
              style={[
                styles.optionCard,
                { backgroundColor: theme.colors.card },
                surveyData.equipmentAccess === e.id && { borderColor: theme.colors.accent, borderWidth: 2 }
              ]}
              onPress={() => setSurveyData({ ...surveyData, equipmentAccess: e.id })}
            >
              <Ionicons name={e.icon as any} size={24} color={theme.colors.accent} />
              <Text style={[styles.optionText, { color: theme.colors.text }]}>{e.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ),
      isValid: () => !!surveyData.equipmentAccess,
    });

    list.push({
      key: 'metrics',
      title: 'Tus medidas',
      subtitle: 'Ingresa tu peso y altura',
      component: (
        <MetricsWheels
          themeColors={theme.colors}
          weightKg={surveyData.weightKg}
          heightCm={surveyData.heightCm}
          onChangeWeight={(w) => setSurveyData({ ...surveyData, weightKg: w })}
          onChangeHeight={(h) => setSurveyData({ ...surveyData, heightCm: h })}
        />
      ),
      isValid: () => {
        const w = surveyData.weightKg ?? 0;
        const h = surveyData.heightCm ?? 0;
        return w > 20 && w < 350 && h > 80 && h < 250;
      },
    });

    list.push({
      key: 'experience',
      title: '¿Cuál es tu nivel de experiencia?',
      subtitle: 'Para adaptar la dificultad',
      component: (
        <View style={styles.optionsContainer}>
          {EXPERIENCE_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.optionCard,
                { backgroundColor: theme.colors.card },
                surveyData.experience === level.id && { borderColor: theme.colors.accent, borderWidth: 2 }
              ]}
              onPress={() => setSurveyData({ ...surveyData, experience: level.id as SurveyData['experience'] })}
            >
              <View style={styles.experienceContent}>
                <Text style={[styles.optionText, { color: theme.colors.text }]}>{level.label}</Text>
                <Text style={[styles.experienceDescription, { color: theme.colors.text }]}>{level.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ),
      isValid: () => !!surveyData.experience,
    });

    list.push({
      key: 'has_injury',
      title: 'Lesiones, enfermedades o limitaciones',
      subtitle: '¿Tienes alguna lesión o condición que afecte tu entrenamiento?',
      component: (
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              { backgroundColor: theme.colors.card },
              surveyData.hasInjury === false && { borderColor: theme.colors.accent, borderWidth: 2 }
            ]}
            onPress={() => setSurveyData({ ...surveyData, hasInjury: false, injuries: [], mobilityRestriction: 'none' })}
          >
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.accent} />
            <Text style={[styles.optionText, { color: theme.colors.text }]}>No</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionCard,
              { backgroundColor: theme.colors.card },
              surveyData.hasInjury === true && { borderColor: theme.colors.accent, borderWidth: 2 }
            ]}
            onPress={() => setSurveyData({ ...surveyData, hasInjury: true })}
          >
            <Ionicons name="alert-circle" size={24} color={theme.colors.accent} />
            <Text style={[styles.optionText, { color: theme.colors.text }]}>Sí</Text>
          </TouchableOpacity>
        </View>
      ),
      isValid: () => surveyData.hasInjury !== null,
    });

    if (surveyData.hasInjury) {
      list.push({
        key: 'injuries',
        title: 'Selecciona tus condiciones',
        subtitle: 'Elige todas las que apliquen',
        component: (
          <View style={styles.optionsContainer}>
            {INJURY_OPTIONS.map((inj) => {
              const active = surveyData.injuries.includes(inj.id);
              return (
                <TouchableOpacity
                  key={inj.id}
                  style={[
                    styles.optionCard,
                    { backgroundColor: theme.colors.card },
                    active && { borderColor: theme.colors.accent, borderWidth: 2 }
                  ]}
                  onPress={() => {
                    const exists = surveyData.injuries.includes(inj.id);
                    const next = exists
                      ? surveyData.injuries.filter((x) => x !== inj.id)
                      : [...surveyData.injuries, inj.id];
                    setSurveyData({ ...surveyData, injuries: next });
                  }}
                >
                  <Ionicons name="medical" size={24} color={theme.colors.accent} />
                  <Text style={[styles.optionText, { color: theme.colors.text }]}>{inj.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ),
        isValid: () => surveyData.injuries.length > 0,
      });

      list.push({
        key: 'mobility',
        title: 'Restricciones de movilidad',
        subtitle: '¿Tienes restricciones específicas de movimiento?',
        component: (
          <View style={styles.optionsContainer}>
            {MOBILITY_RESTRICTIONS.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.optionCard,
                  { backgroundColor: theme.colors.card },
                  surveyData.mobilityRestriction === m.id && { borderColor: theme.colors.accent, borderWidth: 2 }
                ]}
                onPress={() => setSurveyData({ ...surveyData, mobilityRestriction: m.id as SurveyData['mobilityRestriction'] })}
              >
                <Ionicons name="walk" size={24} color={theme.colors.accent} />
                <Text style={[styles.optionText, { color: theme.colors.text }]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ),
        isValid: () => !!surveyData.mobilityRestriction,
      });
    }

    list.push({
      key: 'style',
      title: 'Preferencias de entrenamiento',
      subtitle: '¿Qué estilo prefieres?',
      component: (
        <View style={styles.optionsContainer}>
          {TRAINING_STYLES.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[
                styles.optionCard,
                { backgroundColor: theme.colors.card },
                surveyData.trainingPreference === s.id && { borderColor: theme.colors.accent, borderWidth: 2 }
              ]}
              onPress={() => setSurveyData({ ...surveyData, trainingPreference: s.id as SurveyData['trainingPreference'] })}
            >
              <Ionicons name="fitness" size={24} color={theme.colors.accent} />
              <Text style={[styles.optionText, { color: theme.colors.text }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ),
      isValid: () => !!surveyData.trainingPreference,
    });

    // Nuevos pasos (solo selección, lineales)
    list.push({
      key: 'split',
      title: 'División preferida',
      subtitle: '¿Cómo prefieres distribuir tus días?',
      component: (
        <View style={styles.optionsContainer}>
          {SPLIT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[styles.optionCard, { backgroundColor: theme.colors.card }, surveyData.splitPreference === opt.id && { borderColor: theme.colors.accent, borderWidth: 2 }]}
              onPress={() => setSurveyData({ ...surveyData, splitPreference: opt.id })}
            >
              <Ionicons name="grid" size={24} color={theme.colors.accent} />
              <Text style={[styles.optionText, { color: theme.colors.text }]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ),
      isValid: () => !!surveyData.splitPreference,
    });

    list.push({
      key: 'time',
      title: 'Horario habitual',
      subtitle: '¿A qué hora sueles entrenar?',
      component: (
        <View style={styles.optionsContainer}>
          {TIME_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[styles.optionCard, { backgroundColor: theme.colors.card }, surveyData.preferredTime === opt.id && { borderColor: theme.colors.accent, borderWidth: 2 }]}
              onPress={() => setSurveyData({ ...surveyData, preferredTime: opt.id })}
            >
              <Ionicons name="time" size={24} color={theme.colors.accent} />
              <Text style={[styles.optionText, { color: theme.colors.text }]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ),
      isValid: () => !!surveyData.preferredTime,
    });

    list.push({
      key: 'intensity',
      title: 'Intensidad deseada',
      subtitle: 'Elige cómo quieres sentir el entrenamiento',
      component: (
        <View style={styles.optionsContainer}>
          {INTENSITY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[styles.optionCard, { backgroundColor: theme.colors.card }, surveyData.intensity === opt.id && { borderColor: theme.colors.accent, borderWidth: 2 }]}
              onPress={() => setSurveyData({ ...surveyData, intensity: opt.id })}
            >
              <Ionicons name="flame" size={24} color={theme.colors.accent} />
              <Text style={[styles.optionText, { color: theme.colors.text }]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ),
      isValid: () => !!surveyData.intensity,
    });

    list.push({
      key: 'rest',
      title: 'Descansos entre series',
      subtitle: 'Preferencia de descanso',
      component: (
        <View style={styles.optionsContainer}>
          {REST_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[styles.optionCard, { backgroundColor: theme.colors.card }, surveyData.restPreference === opt.id && { borderColor: theme.colors.accent, borderWidth: 2 }]}
              onPress={() => setSurveyData({ ...surveyData, restPreference: opt.id })}
            >
              <Ionicons name="pause" size={24} color={theme.colors.accent} />
              <Text style={[styles.optionText, { color: theme.colors.text }]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ),
      isValid: () => !!surveyData.restPreference,
    });

    list.push({
      key: 'warmup',
      title: 'Calentamiento',
      subtitle: '¿Cuánto quieres dedicar al calentamiento?',
      component: (
        <View style={styles.optionsContainer}>
          {WARMUP_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[styles.optionCard, { backgroundColor: theme.colors.card }, surveyData.warmupPreference === opt.id && { borderColor: theme.colors.accent, borderWidth: 2 }]}
              onPress={() => setSurveyData({ ...surveyData, warmupPreference: opt.id })}
            >
              <Ionicons name="hand-left" size={24} color={theme.colors.accent} />
              <Text style={[styles.optionText, { color: theme.colors.text }]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ),
      isValid: () => !!surveyData.warmupPreference,
    });

    list.push({
      key: 'supersets',
      title: 'Superseries',
      subtitle: '¿Quieres usar superseries?',
      component: (
        <View style={styles.optionsContainer}>
          {SUPERSETS_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[styles.optionCard, { backgroundColor: theme.colors.card }, surveyData.supersetsPreference === opt.id && { borderColor: theme.colors.accent, borderWidth: 2 }]}
              onPress={() => setSurveyData({ ...surveyData, supersetsPreference: opt.id })}
            >
              <Ionicons name="repeat" size={24} color={theme.colors.accent} />
              <Text style={[styles.optionText, { color: theme.colors.text }]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ),
      isValid: () => !!surveyData.supersetsPreference,
    });

    list.push({
      key: 'dropsets',
      title: 'Dropsets',
      subtitle: '¿Quieres incluir dropsets?',
      component: (
        <View style={styles.optionsContainer}>
          {DROPSETS_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[styles.optionCard, { backgroundColor: theme.colors.card }, surveyData.dropsetsPreference === opt.id && { borderColor: theme.colors.accent, borderWidth: 2 }]}
              onPress={() => setSurveyData({ ...surveyData, dropsetsPreference: opt.id })}
            >
              <Ionicons name="download" size={24} color={theme.colors.accent} />
              <Text style={[styles.optionText, { color: theme.colors.text }]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ),
      isValid: () => !!surveyData.dropsetsPreference,
    });

    list.push({
      key: 'aesthetic',
      title: 'Objetivo físico final (estético)',
      subtitle: 'Elige tu objetivo físico',
      component: (
        <View style={styles.optionsContainer}>
          {AESTHETIC_GOALS.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.optionCard,
                { backgroundColor: theme.colors.card },
                surveyData.aestheticGoal === type.id && { borderColor: theme.colors.accent, borderWidth: 2 }
              ]}
              onPress={() => setSurveyData({ ...surveyData, aestheticGoal: type.id as SurveyData['aestheticGoal'] })}
            >
              <Ionicons name={type.icon as any} size={24} color={theme.colors.accent} />
              <Text style={[styles.optionText, { color: theme.colors.text }]}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ),
      isValid: () => !!surveyData.aestheticGoal,
    });

    list.push({
      key: 'sleep',
      title: 'Descanso y recuperación',
      subtitle: '¿Cuántas horas duermes al día?',
      component: (
        <View style={styles.optionsContainer}>
          {SLEEP_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.optionCard,
                { backgroundColor: theme.colors.card },
                surveyData.sleepHoursRange === opt.id && { borderColor: theme.colors.accent, borderWidth: 2 }
              ]}
              onPress={() => setSurveyData({ ...surveyData, sleepHoursRange: opt.id as SurveyData['sleepHoursRange'] })}
            >
              <Ionicons name="moon" size={24} color={theme.colors.accent} />
              <Text style={[styles.optionText, { color: theme.colors.text }]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ),
      isValid: () => !!surveyData.sleepHoursRange,
    });

    return list;
  }, [selectedMuscles, surveyData, theme.colors.accent, theme.colors.card, theme.colors.text]);

  // Si el usuario ya completó la encuesta, saltar directamente al Home
  useEffect(() => {
    if (user?.hasCompletedSurvey) {
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    }
  }, [user?.hasCompletedSurvey]);

  // Precargar objetivos guardados del usuario (si existen)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user?.id) return;
      try {
        const doc = await getObjectives(user.id);
        if (mounted && doc?.muscleGroups?.length) {
          setSelectedMuscles(doc.muscleGroups);
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, [user?.id]);

  // Manejo del botón físico atrás en Android: retrocede pasos o bloquea si es el primero
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (currentStep > 0) {
          setCurrentStep((s) => Math.max(0, s - 1));
          return true; // consumimos el evento
        }
        return true; // bloqueamos para que no intente salir del stack (no hay ruta previa)
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [currentStep])
  );

  useEffect(() => {
    if (currentStep > steps.length - 1) {
      setCurrentStep(steps.length - 1);
    }
  }, [steps.length]);

  const canProceed = () => steps[currentStep]?.isValid?.() ?? false;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    let stage: 'save_objectives' | 'save_survey' | 'update_user' | 'navigate' | 'idle' = 'idle';
    try {
      setSaving(true);
      if (!user?.id) return;
      
      // Guardar objetivos en colección aparte
      stage = 'save_objectives';
      await saveObjectives(user.id, selectedMuscles);
      // Guardar respuestas del survey
      stage = 'save_survey';
      const goalLabel = (GOALS.find((g) => g.id === surveyData.goal)?.label) || surveyData.goal;
      await supabase.from('initial_survey').upsert({
        user_id: user.id,
        goal: goalLabel,
        days_per_week: surveyData.daysPerWeek,
        session_duration_minutes: surveyData.sessionDurationMinutes,
        equipment_access: surveyData.equipmentAccess,
        weight_kg: surveyData.weightKg,
        height_cm: surveyData.heightCm,
        experience: surveyData.experience,
        has_injury: surveyData.hasInjury,
        injuries: surveyData.injuries,
        mobility_restriction: surveyData.mobilityRestriction || null,
        training_preference: surveyData.trainingPreference,
        aesthetic_goal: surveyData.aestheticGoal,
        sleep_hours_range: surveyData.sleepHoursRange,
        split_preference: surveyData.splitPreference || null,
        preferred_time: surveyData.preferredTime || null,
        intensity: surveyData.intensity || null,
        rest_preference: surveyData.restPreference || null,
        warmup_preference: surveyData.warmupPreference || null,
        supersets_preference: surveyData.supersetsPreference || null,
        dropsets_preference: surveyData.dropsetsPreference || null,
        // compatibilidad antigua (no se usan en la nueva lógica)
        target_days: null,
        body_type: null,
        hours_per_week: null,
        has_gym: surveyData.equipmentAccess === 'full_gym',
        motivation: null,
        completed_at: new Date().toISOString(),
      });

      // Marcar que el usuario ya completó el survey
      stage = 'update_user';
      await supabase.from('profiles').update({
        has_completed_survey: true,
        survey_completed_at: new Date().toISOString(),
      }).eq('id', user.id);

      // Actualizar estado local y navegar a Home
      markSurveyCompleted && markSurveyCompleted();
      stage = 'navigate';
      Alert.alert(
        '¡Perfecto!',
        'Tu perfil ha sido configurado. Ahora podemos crear rutinas personalizadas para ti.',
        [{ text: 'Continuar', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] }) }]
      );
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('[InitialSurvey] Error guardando encuesta', { stage, error });
      const code = error?.code ? ` (${String(error.code)})` : '';
      const msg = error?.message ? `\nDetalle: ${String(error.message)}` : '';
      Alert.alert('Error', `No se pudo guardar tu información en la etapa: ${stage}${code}.${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.card }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: theme.colors.accent,
                  width: `${((currentStep + 1) / steps.length) * 100}%`
                }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.text }]}>
            {currentStep + 1} de {steps.length}
          </Text>
        </View>

        {/* Step Content */}
        <View style={styles.stepContainer}>
          <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
            {currentStepData.title}
          </Text>
          <Text style={[styles.stepSubtitle, { color: theme.colors.text }]}>
            {currentStepData.subtitle}
          </Text>
          
          <View style={styles.stepContent}>
            {currentStepData.component}
          </View>
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={[styles.navButton, styles.backButton, { borderColor: theme.colors.card }]}
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
            <Text style={[styles.navButtonText, { color: theme.colors.text }]}>Atrás</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[
            styles.navButton, 
            styles.nextButton, 
            { backgroundColor: theme.colors.accent },
            (!canProceed() || saving) && { opacity: 0.5 }
          ]}
          onPress={handleNext}
          disabled={!canProceed() || saving}
        >
          <Text style={[styles.navButtonText, { color: '#000' }]}>
            {saving ? 'Guardando...' : currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
          </Text>
          {currentStep < steps.length - 1 && (
            <Ionicons name="arrow-forward" size={20} color="#000" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  progressContainer: {
    marginBottom: 40,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 40,
  },
  stepContent: {
    flex: 1,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
  },
  experienceContent: {
    flex: 1,
    marginLeft: 16,
  },
  experienceDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  numberInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  inputHint: {
    fontSize: 14,
    opacity: 0.7,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 16,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flex: 1,
  },
  backButton: {
    borderWidth: 1,
  },
  nextButton: {
    flex: 2,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
});

// Componente local: ruedas para peso y altura
function MetricsWheels({
  themeColors,
  weightKg,
  heightCm,
  onChangeWeight,
  onChangeHeight,
}: {
  themeColors: any;
  weightKg: number | null;
  heightCm: number | null;
  onChangeWeight: (w: number) => void;
  onChangeHeight: (h: number) => void;
}) {
  const weights = useMemo(() => Array.from({ length: 331 }, (_, i) => 20 + i), []); // 20..350
  const heights = useMemo(() => Array.from({ length: 161 }, (_, i) => 80 + i), []); // 80..240
  const wIndex = Math.max(0, (weightKg ?? 70) - 20);
  const hIndex = Math.max(0, (heightCm ?? 170) - 80);

  return (
    <View style={{ flexDirection: 'row', gap: 16, justifyContent: 'space-between' }}>
      <Wheel
        items={weights}
        unit="kg"
        initialIndex={wIndex}
        onChange={(val) => onChangeWeight(val)}
        themeColors={themeColors}
        label="Peso"
      />
      <Wheel
        items={heights}
        unit="cm"
        initialIndex={hIndex}
        onChange={(val) => onChangeHeight(val)}
        themeColors={themeColors}
        label="Altura"
      />
    </View>
  );
}

function Wheel({
  items,
  unit,
  initialIndex,
  onChange,
  themeColors,
  label,
}: {
  items: number[];
  unit: string;
  initialIndex: number;
  onChange: (val: number) => void;
  themeColors: any;
  label: string;
}) {
  const itemHeight = 36;
  const listRef = useRef<ScrollView | null>(null);
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    setTimeout(() => {
      listRef.current?.scrollTo({ y: initialIndex * itemHeight, animated: false });
    }, 0);
  }, [initialIndex]);

  const onScrollEnd = (e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.round(y / itemHeight);
    const bounded = Math.max(0, Math.min(items.length - 1, idx));
    setIndex(bounded);
    onChange(items[bounded]);
  };

  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ color: themeColors.text, fontWeight: '600', marginBottom: 8 }}>{label}</Text>
      <View style={{ height: itemHeight * 5, overflow: 'hidden', width: '100%' }}>
        <ScrollView
          ref={(r) => { listRef.current = r; }}
          showsVerticalScrollIndicator={false}
          snapToInterval={itemHeight}
          decelerationRate="fast"
          onMomentumScrollEnd={onScrollEnd}
          onScrollEndDrag={onScrollEnd}
        >
          <View style={{ height: itemHeight * 2 }} />
          {items.map((val, i) => {
            const selected = i === index;
            return (
              <View key={val} style={{ height: itemHeight, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{
                  color: selected ? themeColors.accent : themeColors.text + '88',
                  fontSize: selected ? 18 : 16,
                  fontWeight: selected ? '700' : '500',
                }}>
                  {val} {unit}
                </Text>
              </View>
            );
          })}
          <View style={{ height: itemHeight * 2 }} />
        </ScrollView>
        {/* indicador central */}
        <View style={{
          position: 'absolute', top: itemHeight * 2, left: 0, right: 0, height: itemHeight,
          borderTopWidth: 1, borderBottomWidth: 1, borderColor: themeColors.accent + '55'
        }} />
      </View>
    </View>
  );
}

