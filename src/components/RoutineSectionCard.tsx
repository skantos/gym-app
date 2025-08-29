import React, { useState, memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export type SectionExercise = { name: string; sets: number; reps: string | number; rest_seconds: number; notes?: string };

export type RoutineSectionCardProps = {
  title: string;
  description?: string;
  exercises: SectionExercise[];
  defaultExpanded?: boolean;
  onPress?: () => void;
};

function RoutineSectionCardComponent({ title, description, exercises, defaultExpanded = false, onPress }: RoutineSectionCardProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<boolean>(defaultExpanded);

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: '#333' }]}> 
      <TouchableOpacity style={styles.header} activeOpacity={0.8} onPress={onPress ? onPress : () => setExpanded((e) => !e)}>
        <View style={styles.headerTextWrap}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          {!!description && (
            <Text numberOfLines={expanded ? 0 : 2} style={[styles.description, { color: theme.colors.text + '99' }]}>
              {description}
            </Text>
          )}
        </View>
        <Ionicons name={onPress ? 'chevron-forward' : (expanded ? 'chevron-up' : 'chevron-down')} size={18} color={theme.colors.text} />
      </TouchableOpacity>

      {!onPress && expanded && (
        <View style={styles.exercisesList}>
          {exercises.map((ex, idx) => (
            <Text key={`${ex.name}-${idx}`} style={[styles.exerciseItem, { color: theme.colors.text + 'CC' }]}>• {ex.name} — {ex.sets}x{ex.reps} · descanso {ex.rest_seconds}s</Text>
          ))}
        </View>
      )}
    </View>
  );
}

export const RoutineSectionCard = memo(RoutineSectionCardComponent);

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  exercisesList: {
    marginTop: 10,
  },
  exerciseItem: {
    fontSize: 14,
    marginBottom: 4,
  },
});


