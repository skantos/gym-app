import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const theme = useTheme();

  const StatCard = ({ value, label, icon }: { value: string; label: string; icon: string }) => (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color: theme.colors.accent }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.text }]}>{label}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.colors.text }]}>
            Buenos días
          </Text>
          <Text style={[styles.userName, { color: theme.colors.accent }]}>
            Atleta
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <StatCard icon="🔥" value="1,247" label="Calorías" />
          <StatCard icon="🏋️" value="23" label="Entrenamientos" />
          <StatCard icon="📅" value="7" label="Días seguidos" />
        </View>

        {/* Quick Start */}
        <TouchableOpacity style={styles.quickStartCard}>
          <LinearGradient
            colors={[theme.colors.accent + '15', theme.colors.secondaryAccent + '15']}
            style={styles.quickStartGradient}
          >
            <View style={styles.quickStartContent}>
              <View>
                <Text style={[styles.quickStartTitle, { color: theme.colors.text }]}>
                  Entrenamiento de hoy
                </Text>
                <Text style={[styles.quickStartSubtitle, { color: theme.colors.text }]}>
                  Fuerza • 45 min
                </Text>
              </View>
              <View style={[styles.playButton, { backgroundColor: theme.colors.accent }]}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Actividad reciente
          </Text>
          
          {[
            { exercise: 'Sentadilla', weight: '120 kg', sets: '4x8' },
            { exercise: 'Press banca', weight: '80 kg', sets: '3x10' },
            { exercise: 'Peso muerto', weight: '140 kg', sets: '3x5' },
          ].map((item, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: theme.colors.card }]}>
                <Text style={styles.activityIconText}>💪</Text>
              </View>
              <View style={styles.activityInfo}>
                <Text style={[styles.exerciseName, { color: theme.colors.text }]}>
                  {item.exercise}
                </Text>
                <Text style={[styles.exerciseDetails, { color: theme.colors.text }]}>
                  {item.weight} • {item.sets}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
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
    paddingTop: 60,
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '400',
    opacity: 0.8,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 40,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.7,
    textAlign: 'center',
  },
  quickStartCard: {
    marginHorizontal: 24,
    marginBottom: 40,
  },
  quickStartGradient: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  quickStartContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickStartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  quickStartSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  activitySection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  activityIconText: {
    fontSize: 16,
  },
  activityInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  exerciseDetails: {
    fontSize: 14,
    opacity: 0.7,
  },
});