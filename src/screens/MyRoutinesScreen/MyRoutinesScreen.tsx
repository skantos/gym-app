import React, { useState, useEffect } from 'react';
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
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { getUserRoutines, deleteRoutine } from '../../services/routines';
import { Routine } from '../../types/routines';

export default function MyRoutinesScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadRoutines = async () => {
    try {
      setIsLoading(true);
      const userRoutines = await getUserRoutines();
      setRoutines(userRoutines);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las rutinas');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRoutines();
    setRefreshing(false);
  };

  useEffect(() => {
    loadRoutines();
  }, []);

  const handleDeleteRoutine = (routine: Routine) => {
    Alert.alert(
      'Eliminar rutina',
      `¿Estás seguro de que quieres eliminar "${routine.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRoutine(routine.id!);
              await loadRoutines(); // Recargar la lista
              Alert.alert('Éxito', 'Rutina eliminada correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la rutina');
            }
          },
        },
      ]
    );
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Principiante';
      case 'intermediate':
        return 'Intermedio';
      case 'advanced':
        return 'Avanzado';
      default:
        return difficulty;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'strength':
        return 'Fuerza';
      case 'cardio':
        return 'Cardio';
      case 'flexibility':
        return 'Flexibilidad';
      case 'mixed':
        return 'Mixto';
      default:
        return category;
    }
  };

  const RoutineCard = ({ routine }: { routine: Routine }) => (
    <View style={[styles.routineCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.routineHeader}>
        <View style={styles.routineInfo}>
          <Text style={[styles.routineName, { color: theme.colors.text }]}>
            {routine.name}
          </Text>
          {routine.description && (
            <Text
              style={[
                styles.routineDescription,
                { color: theme.colors.text + '80' },
              ]}
            >
              {routine.description}
            </Text>
          )}
        </View>
        <View style={styles.routineActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.accent },
            ]}
            onPress={() => {
              // TODO: Implementar edición de rutina
              Alert.alert(
                'Próximamente',
                'La edición de rutinas estará disponible pronto'
              );
            }}
          >
            <Ionicons name="pencil" size={16} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FF6B6B' }]}
            onPress={() => handleDeleteRoutine(routine)}
          >
            <Ionicons name="trash" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.routineStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.colors.text + '80' }]}>
            Ejercicios
          </Text>
          <Text style={[styles.statValue, { color: theme.colors.accent }]}>
            {routine.exercises.length}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.colors.text + '80' }]}>
            Duración
          </Text>
          <Text style={[styles.statValue, { color: theme.colors.accent }]}>
            {routine.estimatedDuration} min
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.colors.text + '80' }]}>
            Dificultad
          </Text>
          <Text style={[styles.statValue, { color: theme.colors.accent }]}>
            {getDifficultyText(routine.difficulty)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.colors.text + '80' }]}>
            Categoría
          </Text>
          <Text style={[styles.statValue, { color: theme.colors.accent }]}>
            {getCategoryText(routine.category)}
          </Text>
        </View>
      </View>

      <View style={styles.exercisesPreview}>
        <Text style={[styles.exercisesTitle, { color: theme.colors.text }]}>
          Ejercicios:
        </Text>
        {routine.exercises.slice(0, 3).map((exercise, index) => (
          <Text
            key={index}
            style={[styles.exerciseItem, { color: theme.colors.text + '80' }]}
          >
            • {exercise.name} ({exercise.sets} x {exercise.reps})
          </Text>
        ))}
        {routine.exercises.length > 3 && (
          <Text style={[styles.moreExercises, { color: theme.colors.accent }]}>
            +{routine.exercises.length - 3} ejercicios más
          </Text>
        )}
      </View>

      <View style={styles.routineFooter}>
        <Text style={[styles.createdAt, { color: theme.colors.text + '60' }]}>
          Creada el {new Date(routine.createdAt!).toLocaleDateString('es-ES')}
        </Text>
        {routine.isPublic && (
          <View
            style={[
              styles.publicBadge,
              { backgroundColor: theme.colors.accent + '20' },
            ]}
          >
            <Text
              style={[styles.publicBadgeText, { color: theme.colors.accent }]}
            >
              Pública
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
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
          Mis Rutinas
        </Text>
        <TouchableOpacity
          style={[
            styles.createButton,
            { backgroundColor: theme.colors.accent },
          ]}
          onPress={() => navigation.navigate('CreateRoutine' as never)}
        >
          <Text style={styles.createButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.accent}
          />
        }
      >
        {routines.length === 0 && !isLoading ? (
          <View style={styles.emptyState}>
            <View
              style={[styles.emptyIcon, { backgroundColor: theme.colors.card }]}
            >
              <Ionicons name="fitness" size={48} color={theme.colors.accent} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No tienes rutinas aún
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                { color: theme.colors.text + '80' },
              ]}
            >
              Crea tu primera rutina personalizada para comenzar a entrenar
            </Text>
            <TouchableOpacity
              style={[
                styles.emptyButton,
                { backgroundColor: theme.colors.accent },
              ]}
              onPress={() => navigation.navigate('CreateRoutine' as never)}
            >
              <Text style={styles.emptyButtonText}>Crear Primera Rutina</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.routinesList}>
            {routines.map((routine) => (
              <RoutineCard key={routine.id} routine={routine} />
            ))}
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
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
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
    marginBottom: 32,
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
  routinesList: {
    paddingHorizontal: 24,
  },
  routineCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  routineInfo: {
    flex: 1,
    marginRight: 16,
  },
  routineName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  routineDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  routineActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routineStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  exercisesPreview: {
    marginBottom: 16,
  },
  exercisesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  exerciseItem: {
    fontSize: 14,
    marginBottom: 4,
  },
  moreExercises: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  routineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createdAt: {
    fontSize: 12,
  },
  publicBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  publicBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
