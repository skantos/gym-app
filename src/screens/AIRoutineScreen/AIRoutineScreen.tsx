import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { requestAIRoutine, GeneratedRoutine, fetchLatestGeneratedRoutine, fetchLatestRoutineForUser } from '../../services/ai';
import { buildRoutineFromDB } from '../../services/routineBuilder';
import { getObjectives } from '../../services/objectives';
import { supabase } from '../../services/supabase';

export default function AIRoutineScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedRoutine | null>(null);

  useEffect(() => {
    // Al entrar, intentar cargar la última rutina generada guardada
    (async () => {
      const saved = await fetchLatestGeneratedRoutine();
      if (saved) { setResult(saved); return; }
      const fallback = await fetchLatestRoutineForUser();
      if (fallback) setResult(fallback);
    })();
  }, []);

  const onGenerate = async () => {
    try {
      setLoading(true);
      // Priorizar IA
      try {
        const data = await requestAIRoutine('Rutina generada por IA');
        setResult(data.generated);
        Alert.alert('Listo', 'Rutina generada por IA');
        return;
      } catch (_) {
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
    <View style={styles.header}>
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

  const DayCard = ({ day, exercises }: { day: string; exercises: Array<{ name: string; sets: number; reps: number; rest_seconds: number }> }) => (
    <View style={[styles.routineCard, { backgroundColor: theme.colors.card }]}> 
      <Text style={[styles.dayTitle, { color: theme.colors.text }]}>{day}</Text>
      <View style={styles.exercisesList}>
        {exercises.map((ex, idx) => (
          <Text key={idx} style={[styles.exerciseItem, { color: theme.colors.text + 'CC' }]}>• {ex.name} — {ex.sets}x{ex.reps} · descanso {ex.rest_seconds}s</Text>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
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
            {result.days?.map((d, idx) => (
              <DayCard key={idx} day={d.day} exercises={d.exercises} />
            ))}
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
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  generatedHeader: {
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 12,
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
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
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
    marginBottom: 6,
  },
});