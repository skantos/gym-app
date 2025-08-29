import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RoutineSectionCard } from '../../components/RoutineSectionCard';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { requestAIRoutine, GeneratedRoutine, fetchLatestGeneratedRoutine, fetchLatestRoutineForUser } from '../../services/ai';
import { buildRoutineFromDB } from '../../services/routineBuilder';
import { fetchMuscleGroupsForExerciseNames } from '../../services/exercises';
import { getObjectives } from '../../services/objectives';
import { supabase } from '../../services/supabase';

export default function AIRoutineScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedRoutine | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sections, setSections] = useState<Array<{ title: string; description?: string; exercises: Array<{ name: string; sets: number; reps: string | number; rest_seconds: number; notes?: string }> }> | null>(null);
  const [surveyInfo, setSurveyInfo] = useState<{ daysPerWeek?: number; experience?: 'beginner'|'intermediate'|'advanced'; equipmentAccess?: 'full_gym'|'home_dumbbells_bands'|'bodyweight' } | null>(null);

  useEffect(() => {
    // Al entrar, intentar cargar la última rutina generada guardada
    (async () => {
      // cargar survey básico para enriquecer descripciones
      try {
        const session = await supabase.auth.getSession();
        const userId = session.data.session?.user?.id;
        if (userId) {
          const { data: survey } = await supabase
            .from('initial_survey')
            .select('days_per_week, experience, equipment_access')
            .eq('user_id', userId)
            .maybeSingle();
          setSurveyInfo({
            daysPerWeek: survey?.days_per_week ?? undefined,
            experience: (survey?.experience ?? undefined) as any,
            equipmentAccess: (survey?.equipment_access ?? undefined) as any,
          });
        }
      } catch {}

      const saved = await fetchLatestGeneratedRoutine();
      if (saved) { setResult(saved); return; }
      const fallback = await fetchLatestRoutineForUser();
      if (fallback) setResult(fallback);
    })();
  }, []);

  // Refrescar automáticamente al volver a esta pantalla
  useFocusEffect(
    React.useCallback(() => {
      onRefresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const saved = await fetchLatestGeneratedRoutine();
      if (saved) { setResult(saved); return; }
      const fallback = await fetchLatestRoutineForUser();
      if (fallback) setResult(fallback);
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.warn('[AI] refresh error:', e?.message || e);
    } finally {
      setRefreshing(false);
    }
  };

  const onGenerate = async () => {
    try {
      setLoading(true);
      // Priorizar IA
      try {
        const data = await requestAIRoutine('Rutina generada por IA');
        setResult(data.generated);
        Alert.alert('Listo', 'Rutina generada por IA');
        return;
      } catch (e: any) {
        console.warn('[AI] error:', e?.message || e);
        Alert.alert('IA', e?.message ?? 'Fallo IA, usando fallback');
        // Fallback a BD si la IA falla
      }

      // Fallback: construir desde BD según objetivos y preferencias
      const session = await supabase.auth.getSession();
      const userId = session.data.session?.user?.id;
      const objectives = userId ? await getObjectives(userId) : null;
      const muscleGroups = objectives?.muscleGroups?.length ? objectives.muscleGroups : ['chest','upper-back','quadriceps','hamstring','gluteal','deltoids','biceps','triceps','calves','abs'];
      const { data: survey } = await supabase
        .from('initial_survey')
        .select('days_per_week, experience, equipment_access')
        .eq('user_id', userId)
        .maybeSingle();
      const daysPerWeek = survey?.days_per_week ?? 5;
      const experience = (survey?.experience ?? 'beginner') as 'beginner'|'intermediate'|'advanced';
      const equipmentAccess = (survey?.equipment_access ?? 'full_gym') as 'full_gym'|'home_dumbbells_bands'|'bodyweight';
      const built = await buildRoutineFromDB({
        muscleGroups,
        daysPerWeek,
        experience,
        equipmentAccess,
      });
      setResult({ name: built.name, description: built.description, days: built.days });
      Alert.alert('Listo', 'Rutina generada desde tus datos');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo generar la rutina');
    } finally {
      setLoading(false);
    }
  };

  const Header = () => (
    <View style={[styles.header, { paddingTop: Math.max(12, insets.top + 8), paddingHorizontal: 20, paddingBottom: 12 }] }>
      <Text style={[styles.headerTitle, { color: theme.colors.text }]}>IA Rutina</Text>
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: theme.colors.accent }]}
        onPress={onGenerate}
        disabled={loading}
      >
        <Ionicons name="flash" size={18} color="#000" />
        <Text style={styles.createButtonText}>{loading ? 'Generando...' : 'Generar'}</Text>
      </TouchableOpacity>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.colors.card }]}> 
        <Ionicons name="flash" size={48} color={theme.colors.accent} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Genera tu rutina con IA</Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.text + '80' }]}>Usaremos tus objetivos y preferencias para crear una rutina óptima.</Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: theme.colors.accent }]}
        onPress={onGenerate}
        disabled={loading}
      >
        <Text style={styles.emptyButtonText}>{loading ? 'Generando...' : 'Generar Rutina con IA'}</Text>
      </TouchableOpacity>
    </View>
  );

  // Mapeo: de días a secciones con títulos tipo "Pecho - Tríceps", "Espalda - Bíceps", etc.
  const toSections = () => {
    const days = result?.days || [];
    return days.map((d, i) => {
      // título inferido si viene un patrón común, si no usamos el 'day'
      const title = d.day || `Sección ${i + 1}`;
      const description = 'Diseñada según tus objetivos y experiencia; prioriza grupos clave y recuperación.';
      return { title, description, exercises: d.exercises };
    });
  };

  const enrichSections = async () => {
    const sections = toSections();
    const allNames = sections.flatMap((s) => s.exercises.map((e) => e.name));
    if (allNames.length === 0) return sections;
    try {
      const nameToGroup = await fetchMuscleGroupsForExerciseNames(allNames);
      return sections.map((s) => {
        const groups = Array.from(new Set(s.exercises.map((e) => nameToGroup[e.name]).filter(Boolean))) as string[];
        const inferred = inferTitleFromGroups(groups) || s.title;
        const desc = buildDescriptionFromGroups(groups, surveyInfo || undefined) || s.description;
        return { ...s, title: inferred, description: desc };
      });
    } catch {
      return sections;
    }
  };

  const inferTitleFromGroups = (groups: string[]): string | null => {
    const set = new Set(groups.map((g) => (g || '').toLowerCase()));
    if (set.has('chest') && set.has('triceps')) return 'Pecho - Tríceps';
    if ((set.has('upper-back') || set.has('lats')) && set.has('biceps')) return 'Espalda - Bíceps';
    if (set.has('quadriceps') || set.has('hamstring') || set.has('gluteal') || set.has('calves')) return 'Piernas';
    if (set.has('deltoids')) return 'Hombros';
    if (set.has('abs') || set.has('core') || set.has('obliques')) return 'Core';
    return null;
  };

  const buildDescriptionFromGroups = (groups: string[], info?: { daysPerWeek?: number; experience?: string; equipmentAccess?: string }): string | null => {
    if (!groups.length) return null;
    const friendly: Record<string, string> = {
      'chest': 'pecho', 'triceps': 'tríceps', 'biceps': 'bíceps', 'upper-back': 'espalda alta',
      'lats': 'dorsales', 'quadriceps': 'cuádriceps', 'hamstring': 'isquios', 'gluteal': 'glúteos',
      'calves': 'pantorrillas', 'deltoids': 'hombros', 'abs': 'abdominales', 'core': 'core', 'obliques': 'oblicuos'
    };
    const readable = Array.from(new Set(groups)).map((g) => friendly[g] || g).join(', ');
    const expMap: any = { beginner: 'principiante', intermediate: 'intermedio', advanced: 'avanzado' };
    const parts: string[] = [];
    parts.push(`Enfoque: ${readable}.`);
    if (info?.experience) parts.push(`Nivel ${expMap[info.experience] ?? info.experience}.`);
    if (info?.daysPerWeek) parts.push(`${info.daysPerWeek} días/semana.`);
    if (info?.equipmentAccess) {
      const equipLabel = info.equipmentAccess === 'full_gym' ? 'gimnasio completo' : info.equipmentAccess === 'home_dumbbells_bands' ? 'mancuernas/bandas en casa' : 'peso corporal';
      parts.push(`Equipo: ${equipLabel}.`);
    }
    parts.push('Priorizamos técnica, volumen adecuado y recuperación.');
    return parts.join(' ');
  };

  // Mantener títulos/descripcion estables
  useEffect(() => {
    (async () => {
      if (!result?.days) { setSections(null); return; }
      const enriched = await enrichSections();
      setSections(enriched);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(result?.days), surveyInfo?.daysPerWeek, surveyInfo?.experience, surveyInfo?.equipmentAccess]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.accent}
            colors={[theme.colors.accent]}
          />
        }
      >
        {!result ? (
          <EmptyState />
        ) : (
          <View style={styles.generatedWrapper}>
            <View style={[styles.generatedHeader, { borderColor: '#333' }]}> 
              <Text style={[styles.generatedTitle, { color: theme.colors.text }]}>{result.name}</Text>
              {!!result.description && (
                <Text style={[styles.generatedDesc, { color: theme.colors.text + '99' }]}>{result.description}</Text>
              )}
            </View>
            {sections ? sections.map((s, idx) => (
              <RoutineSectionCard key={`${s.title}-${idx}`} title={s.title} description={s.description} exercises={s.exercises} onPress={() => {
                const rid = (result as any)?.meta?.routine_id;
                navigation.navigate('RoutineDetail', {
                  routineId: rid,
                  sectionIndex: idx,
                  title: s.title,
                  exercises: s.exercises,
                });
              }} />
            )) : (
              <Text style={{ color: theme.colors.text + '80', paddingVertical: 8 }}>Cargando secciones…</Text>
            )}
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: theme.colors.accent, marginTop: 16 }]}
              onPress={onGenerate}
              disabled={loading}
            >
              <Text style={styles.emptyButtonText}>{loading ? 'Regenerando...' : 'Regenerar Rutina con IA'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// Obsoleto: se reemplazó por render directo con estado 'sections'

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  generatedWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  generatedHeader: {
    borderBottomWidth: 1,
    paddingBottom: 10,
    marginBottom: 10,
  },
  generatedTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  generatedDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  routineCard: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  exercisesList: {},
  exerciseItem: {
    fontSize: 14,
    marginBottom: 4,
  },
});