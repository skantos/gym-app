import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { createRoutine } from '../../services/routines';
import { Exercise, CreateRoutineData } from '../../types/routines';

export default function CreateRoutineScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [routineName, setRoutineName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<
    'beginner' | 'intermediate' | 'advanced'
  >('beginner');
  const [category, setCategory] = useState<
    'strength' | 'cardio' | 'flexibility' | 'mixed'
  >('strength');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: '',
      sets: 3,
      reps: 10,
      weight: 0,
      restTime: 60,
      notes: '',
    };
    setExercises([...exercises, newExercise]);
  };

  const updateExercise = (index: number, field: keyof Exercise, value: any) => {
    const updatedExercises = [...exercises];
    updatedExercises[index] = { ...updatedExercises[index], [field]: value };
    setExercises(updatedExercises);
  };

  const removeExercise = (index: number) => {
    const updatedExercises = exercises.filter((_, i) => i !== index);
    setExercises(updatedExercises);
  };

  const handleSaveRoutine = async () => {
    if (!routineName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la rutina');
      return;
    }

    if (exercises.length === 0) {
      Alert.alert('Error', 'Debes agregar al menos un ejercicio');
      return;
    }

    // Validar que todos los ejercicios tengan nombre
    const hasEmptyNames = exercises.some((ex) => !ex.name.trim());
    if (hasEmptyNames) {
      Alert.alert('Error', 'Todos los ejercicios deben tener un nombre');
      return;
    }

    setIsLoading(true);

    try {
      const routineData: CreateRoutineData = {
        name: routineName.trim(),
        description: description.trim(),
        exercises,
        difficulty,
        category,
        estimatedDuration: parseInt(estimatedDuration) || 30,
        isPublic,
      };

      await createRoutine(routineData);
      Alert.alert('Éxito', 'Rutina creada correctamente', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la rutina. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const ExerciseCard = ({
    exercise,
    index,
  }: {
    exercise: Exercise;
    index: number;
  }) => (
    <View style={[styles.exerciseCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.exerciseHeader}>
        <Text style={[styles.exerciseNumber, { color: theme.colors.accent }]}>
          Ejercicio {index + 1}
        </Text>
        <TouchableOpacity
          onPress={() => removeExercise(index)}
          style={styles.removeButton}
        >
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[
          styles.input,
          { color: theme.colors.text, borderColor: theme.colors.border },
        ]}
        placeholder="Nombre del ejercicio"
        placeholderTextColor={theme.colors.text + '80'}
        value={exercise.name}
        onChangeText={(text) => updateExercise(index, 'name', text)}
      />

      <View style={styles.exerciseRow}>
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            Series
          </Text>
          <TextInput
            style={[
              styles.numberInput,
              { color: theme.colors.text, borderColor: theme.colors.border },
            ]}
            value={exercise.sets.toString()}
            onChangeText={(text) =>
              updateExercise(index, 'sets', parseInt(text) || 0)
            }
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            Repeticiones
          </Text>
          <TextInput
            style={[
              styles.numberInput,
              { color: theme.colors.text, borderColor: theme.colors.border },
            ]}
            value={exercise.reps.toString()}
            onChangeText={(text) =>
              updateExercise(index, 'reps', parseInt(text) || 0)
            }
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            Peso (kg)
          </Text>
          <TextInput
            style={[
              styles.numberInput,
              { color: theme.colors.text, borderColor: theme.colors.border },
            ]}
            value={exercise.weight?.toString() || '0'}
            onChangeText={(text) =>
              updateExercise(index, 'weight', parseFloat(text) || 0)
            }
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.exerciseRow}>
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            Descanso (seg)
          </Text>
          <TextInput
            style={[
              styles.numberInput,
              { color: theme.colors.text, borderColor: theme.colors.border },
            ]}
            value={exercise.restTime.toString()}
            onChangeText={(text) =>
              updateExercise(index, 'restTime', parseInt(text) || 0)
            }
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            Notas
          </Text>
          <TextInput
            style={[
              styles.notesInput,
              { color: theme.colors.text, borderColor: theme.colors.border },
            ]}
            placeholder="Notas opcionales"
            placeholderTextColor={theme.colors.text + '80'}
            value={exercise.notes}
            onChangeText={(text) => updateExercise(index, 'notes', text)}
            multiline
          />
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.backButtonText, { color: theme.colors.text }]}>
              ←
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Crear Rutina
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Información básica
          </Text>

          <TextInput
            style={[
              styles.input,
              { color: theme.colors.text, borderColor: theme.colors.border },
            ]}
            placeholder="Nombre de la rutina"
            placeholderTextColor={theme.colors.text + '80'}
            value={routineName}
            onChangeText={setRoutineName}
          />

          <TextInput
            style={[
              styles.textArea,
              { color: theme.colors.text, borderColor: theme.colors.border },
            ]}
            placeholder="Descripción (opcional)"
            placeholderTextColor={theme.colors.text + '80'}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Dificultad
              </Text>
              <View style={styles.pickerContainer}>
                {(['beginner', 'intermediate', 'advanced'] as const).map(
                  (level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.pickerOption,
                        difficulty === level && {
                          backgroundColor: theme.colors.accent,
                        },
                      ]}
                      onPress={() => setDifficulty(level)}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          {
                            color:
                              difficulty === level ? '#000' : theme.colors.text,
                          },
                        ]}
                      >
                        {level === 'beginner'
                          ? 'Principiante'
                          : level === 'intermediate'
                          ? 'Intermedio'
                          : 'Avanzado'}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Categoría
              </Text>
              <View style={styles.pickerContainer}>
                {(['strength', 'cardio', 'flexibility', 'mixed'] as const).map(
                  (cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.pickerOption,
                        category === cat && {
                          backgroundColor: theme.colors.accent,
                        },
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          {
                            color:
                              category === cat ? '#000' : theme.colors.text,
                          },
                        ]}
                      >
                        {cat === 'strength'
                          ? 'Fuerza'
                          : cat === 'cardio'
                          ? 'Cardio'
                          : cat === 'flexibility'
                          ? 'Flexibilidad'
                          : 'Mixto'}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Duración estimada (min)
              </Text>
              <TextInput
                style={[
                  styles.numberInput,
                  {
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={estimatedDuration}
                onChangeText={setEstimatedDuration}
                keyboardType="numeric"
                placeholder="30"
                placeholderTextColor={theme.colors.text + '80'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Rutina pública
              </Text>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  isPublic && { backgroundColor: theme.colors.accent },
                ]}
                onPress={() => setIsPublic(!isPublic)}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    { color: isPublic ? '#000' : theme.colors.text },
                  ]}
                >
                  {isPublic ? 'Sí' : 'No'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Exercises */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Ejercicios ({exercises.length})
            </Text>
            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: theme.colors.accent },
              ]}
              onPress={addExercise}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {exercises.map((exercise, index) => (
            <ExerciseCard key={exercise.id} exercise={exercise} index={index} />
          ))}

          {exercises.length === 0 && (
            <View
              style={[
                styles.emptyState,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <Text
                style={[styles.emptyStateText, { color: theme.colors.text }]}
              >
                No hay ejercicios agregados
              </Text>
              <Text
                style={[
                  styles.emptyStateSubtext,
                  { color: theme.colors.text + '80' },
                ]}
              >
                Toca el botón + para agregar tu primer ejercicio
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View
        style={[styles.saveButtonContainer, { paddingBottom: insets.bottom }]}
      >
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: theme.colors.accent },
            isLoading && { opacity: 0.6 },
          ]}
          onPress={handleSaveRoutine}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Guardando...' : 'Guardar Rutina'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  numberInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  pickerOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  pickerOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
  },
  exerciseCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  exerciseNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  exerciseRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  emptyState: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});
