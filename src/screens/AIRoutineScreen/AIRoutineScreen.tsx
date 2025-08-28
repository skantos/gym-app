import React, { useState } from 'react';
import { View, Text, Button, Alert, ScrollView } from 'react-native';
import { requestAIRoutine, GeneratedRoutine } from '../../services/ai';
import { buildRoutineFromDB } from '../../services/routineBuilder';
import { getObjectives } from '../../services/objectives';
import { supabase } from '../../services/supabase';

export default function AIRoutineScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedRoutine | null>(null);

  const onGenerate = async () => {
    try {
      setLoading(true);
      // 1) Informacion del usuario
      const session = await supabase.auth.getSession();
      const userId = session.data.session?.user?.id;
      // 2) Objetivos/músculos
      const objectives = userId ? await getObjectives(userId) : null;
      const muscleGroups = objectives?.muscleGroups?.length ? objectives.muscleGroups : ['chest','upper-back','quadriceps','hamstring','gluteal','deltoids','biceps','triceps','calves','abs'];

      // 3) Leer initial_survey para días/experiencia/equipamiento
      const { data: survey } = await supabase
        .from('initial_survey')
        .select('days_per_week, experience, equipment_access')
        .eq('user_id', userId)
        .maybeSingle();

      const daysPerWeek = survey?.days_per_week ?? 5;
      const experience = (survey?.experience ?? 'beginner') as 'beginner'|'intermediate'|'advanced';
      const equipmentAccess = (survey?.equipment_access ?? 'full_gym') as 'full_gym'|'home_dumbbells_bands'|'bodyweight';

      // 4) Intentar construir desde BD
      try {
        const built = await buildRoutineFromDB({
          muscleGroups,
          daysPerWeek,
          experience,
          equipmentAccess,
        });
        setResult({ name: built.name, description: built.description, days: built.days });
        Alert.alert('Listo', 'Rutina generada desde BD');
        return;
      } catch (e) {
        // fallback a IA si falla o si la BD está vacía
      }

      const data = await requestAIRoutine('Rutina generada por IA');
      setResult(data.generated);
      Alert.alert('Listo', 'Rutina generada por IA');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo generar la rutina');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>Pantalla Rutina AI</Text>
      <Button title={loading ? 'Generando...' : 'Generar rutina'} onPress={onGenerate} disabled={loading} />
      {result && (
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>{result.name}</Text>
          {!!result.description && (
            <Text style={{ marginTop: 8 }}>{result.description}</Text>
          )}
          {result.days?.map((d, idx) => (
            <View key={idx} style={{ marginTop: 12 }}>
              <Text style={{ fontWeight: '600' }}>{d.day}</Text>
              {d.exercises?.map((ex, j) => (
                <Text key={j}>
                  {ex.name} — {ex.sets}x{ex.reps} descanso {ex.rest_seconds}s
                </Text>
              ))}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}


