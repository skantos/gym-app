import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { upsertRoutineExercises } from '../../services/routines';
import { fetchMuscleGroupsForExerciseNames } from '../../services/exercises';

type Ex = { name: string; sets: number; reps: string | number; rest_seconds: number; notes?: string; muscle_group?: string };

export default function RoutineDetailScreen() {
  const theme = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { title, exercises, routineId, sectionIndex } = route.params as { title: string; exercises: Ex[]; routineId?: string; sectionIndex?: number };
  const [list, setList] = useState<Ex[]>(exercises || []);
  const [nameToGroup, setNameToGroup] = useState<Record<string, string | undefined>>({});

  React.useEffect(() => {
    const loadGroups = async () => {
      try {
        const map = await fetchMuscleGroupsForExerciseNames((list || []).map((e) => e.name));
        setNameToGroup(map);
      } catch {}
    };
    loadGroups();
  }, [list]);

  const onStart = () => {
    Alert.alert('Iniciar', 'Iniciando rutina...', [{ text: 'OK' }]);
  };

  const onRemove = (idx: number) => {
    setList((prev) => prev.filter((_, i) => i !== idx));
  };

  const onAdd = () => {
    setList((prev) => prev.concat({ name: 'Nuevo ejercicio', sets: 3, reps: '10-12', rest_seconds: 60 }));
  };

  const onSave = async () => {
    try {
      if (routineId && typeof sectionIndex === 'number') {
        await upsertRoutineExercises({ routineId, dayIndex: sectionIndex, exercises: list });
        Alert.alert('Guardado', 'Rutina actualizada');
      } else {
        Alert.alert('Info', 'Rutina local actualizada');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo guardar');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={styles.header}> 
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        <TouchableOpacity onPress={onStart} style={[styles.playBtn, { backgroundColor: theme.colors.accent }]}>
          <Ionicons name="play" size={16} color="#000" />
          <Text style={styles.playTxt}>Iniciar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {list.map((ex, idx) => (
          <View key={`${ex.name}-${idx}`} style={[styles.item, { borderColor: '#333' }]}> 
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemName, { color: theme.colors.text }]}>{ex.name}</Text>
              <Text style={[styles.itemMeta, { color: theme.colors.text + '99' }]}>
                {ex.sets}x{ex.reps} · descanso {ex.rest_seconds}s
              </Text>
              {(() => { const mg = ex.muscle_group ?? nameToGroup[ex.name]; return mg ? (
                <View style={styles.chipsRow}>
                  <View style={[styles.chip, { borderColor: theme.colors.accent + '80' }]}> 
                    <Text style={[styles.chipTxt, { color: theme.colors.accent }]}>{mg}</Text>
                  </View>
                </View>
              ) : null })()}
            </View>
            <TouchableOpacity onPress={() => onRemove(idx)} style={styles.removeBtn}>
              <Ionicons name="trash" size={18} color="#ff6b6b" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity onPress={onAdd} style={[styles.addBtn, { borderColor: theme.colors.accent }]}> 
          <Ionicons name="add" size={18} color={theme.colors.accent} />
          <Text style={[styles.addTxt, { color: theme.colors.accent }]}>Agregar ejercicio</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onSave} style={[styles.saveBtn, { backgroundColor: theme.colors.accent }]}> 
          <Ionicons name="save" size={18} color="#000" />
          <Text style={styles.saveTxt}>Guardar cambios</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
  },
  backBtn: { padding: 8 },
  title: { fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center' },
  playBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  playTxt: { color: '#000', fontWeight: '700' },
  item: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 },
  itemName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  itemMeta: { fontSize: 13 },
  removeBtn: { padding: 6 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 10, padding: 12, justifyContent: 'center' },
  addTxt: { fontWeight: '700' },
  saveBtn: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, padding: 12, justifyContent: 'center' },
  saveTxt: { fontWeight: '700', color: '#000' },
  chipsRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  chip: { borderWidth: 1, paddingVertical: 2, paddingHorizontal: 8, borderRadius: 999 },
  chipTxt: { fontSize: 12, fontWeight: '700' },
});


