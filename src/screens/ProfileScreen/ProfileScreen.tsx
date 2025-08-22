import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, logout } = useUser();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert(
                'Error',
                'No se pudo cerrar sesión. Intenta de nuevo.'
              );
            }
          },
        },
      ]
    );
  };

  const ProfileCard = ({
    title,
    value,
    icon,
  }: {
    title: string;
    value: string;
    icon: string;
  }) => (
    <View style={styles.profileCard}>
      <Text style={styles.cardIcon}>{icon}</Text>
      <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.cardValue, { color: theme.colors.accent }]}>
        {value}
      </Text>
    </View>
  );

  const MenuItem = ({
    title,
    subtitle,
    icon,
    onPress,
  }: {
    title: string;
    subtitle: string;
    icon: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIcon}>
        <Text style={styles.menuIconText}>{icon}</Text>
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.menuSubtitle, { color: theme.colors.text }]}>
          {subtitle}
        </Text>
      </View>
      <Text style={[styles.menuArrow, { color: theme.colors.text }]}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 40 + 75 + 40 + insets.bottom }}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View
            style={[
              styles.avatarContainer,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {user?.name || 'Usuario'}
          </Text>
          <Text style={[styles.userLevel, { color: theme.colors.accent }]}>
            {user?.email}
          </Text>
          {user?.gender && (
            <View style={[styles.pill, { borderColor: theme.colors.card }]}>
              <Text style={[styles.pillText, { color: theme.colors.text }]}>
                Género: {user.gender === 'female' ? 'Mujer' : 'Hombre'}
              </Text>
            </View>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <ProfileCard title="Entrenamientos" value="156" icon="🏋️" />
          <ProfileCard title="Días activos" value="89" icon="📅" />
          <ProfileCard title="Calorías totales" value="124.7k" icon="🔥" />
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Acciones rápidas
          </Text>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('CreateRoutine' as never)}
          >
            <LinearGradient
              colors={[
                theme.colors.accent + '20',
                theme.colors.secondaryAccent + '20',
              ]}
              style={styles.actionGradient}
            >
              <View style={styles.actionContent}>
                <View style={styles.actionInfo}>
                  <Text
                    style={[styles.actionTitle, { color: theme.colors.text }]}
                  >
                    Crear rutina personalizada
                  </Text>
                  <Text
                    style={[
                      styles.actionSubtitle,
                      { color: theme.colors.text },
                    ]}
                  >
                    Diseña tu entrenamiento ideal
                  </Text>
                </View>
                <View
                  style={[
                    styles.actionButton,
                    { backgroundColor: theme.colors.accent },
                  ]}
                >
                  <Text style={styles.actionButtonText}>+</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Configuración
          </Text>

          <MenuItem
            title="Mis Rutinas"
            subtitle="Gestiona tus rutinas personalizadas"
            icon="🏋️"
            onPress={() => navigation.navigate('MyRoutines' as never)}
          />
          <MenuItem
            title="Metas personales"
            subtitle="Configura tus objetivos de fitness"
            icon="🎯"
            onPress={() => {}}
          />
          <MenuItem
            title="Historial completo"
            subtitle="Revisa todos tus entrenamientos"
            icon="📊"
            onPress={() => {}}
          />
          <MenuItem
            title="Preferencias"
            subtitle="Personaliza tu experiencia"
            icon="⚙️"
            onPress={() => {}}
          />
          <MenuItem
            title="Ayuda y soporte"
            subtitle="Obtén ayuda cuando la necesites"
            icon="❓"
            onPress={() => {}}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
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
  profileHeader: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#333',
  },
  avatarText: {
    fontSize: 32,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userLevel: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
    marginBottom: 6,
  },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 6,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 40,
    gap: 12,
  },
  profileCard: {
    width: '48%',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    minWidth: 150,
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  actionsSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  actionCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 24,
  },
  actionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuIconText: {
    fontSize: 18,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  menuArrow: {
    fontSize: 18,
    fontWeight: '300',
  },
  logoutButton: {
    marginHorizontal: 24,
    marginBottom: 40,
    paddingVertical: 16,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
});
