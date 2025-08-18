import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import AIRoutineScreen from '../screens/AIRoutineScreen/AIRoutineScreen';
import CommunityScreen from '../screens/CommunityScreen/CommunityScreen';
import ProfileScreen from '../screens/ProfileScreen/ProfileScreen';
import ObjectivesScreen from '../screens/GoalsScreen/ObjectivesScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const AnimatedTabIcon = ({ focused, route, theme }: { focused: boolean; route: any; theme: any }) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  const rotateValue = React.useRef(new Animated.Value(0)).current;
  const glowValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1.3,
          useNativeDriver: true,
          tension: 150,
          friction: 6,
        }),
        Animated.timing(rotateValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(glowValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(glowValue, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused]);

  const getIconName = () => {
    switch (route.name) {
      case 'Home': return 'home';
      case 'AI Routine': return 'flash';
      case 'Community': return 'people';
      case 'Profile': return 'person';
      case 'Objectives': return 'flag';
      default: return 'home';
    }
  };

  const getIconColor = () => {
    return focused ? theme.colors.accent : theme.colors.text;
  };

  return (
    <View style={styles.iconWrapper}>
      {focused && (
        <Animated.View
          style={[
            styles.glowBackground,
            {
              opacity: glowValue,
              backgroundColor: theme.colors.accent + '30',
            },
          ]}
        />
      )}
      
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [
              { scale: scaleValue },
              {
                rotate: rotateValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      >
        <Ionicons
          name={getIconName() as any}
          size={20}
          color={getIconColor()}
        />
      </Animated.View>
    </View>
  );
};

export default function MainTabNavigator() {
  const theme = useTheme();

  return (
    <>
      <View style={styles.separatorContainer}>
        <LinearGradient
          colors={[theme.colors.accent, `${theme.colors.accent}00`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientLine}
        />
      </View>
      
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 40,
            left: 20,
            right: 20,
            height: 75,
            backgroundColor: 'transparent',
            borderRadius: 25,
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            paddingHorizontal: 20,
            paddingBottom: 15,
            paddingTop: 15,
          },
          tabBarBackground: () => (
            <View style={[
              styles.tabBarBackground,
              { backgroundColor: theme.colors.card + '40' } 
            ]} />
          ),
          tabBarActiveTintColor: theme.colors.accent,
          tabBarInactiveTintColor: theme.colors.text,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 0.5,
            marginTop: 8,
          },
          tabBarIcon: ({ focused, color, size }) => (
            <AnimatedTabIcon focused={focused} route={route} theme={theme} />
          ),
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ tabBarLabel: 'Inicio' }}
        />
        <Tab.Screen 
          name="Objectives" 
          component={ObjectivesScreen}
          options={{ tabBarLabel: 'Objetivos' }}
        />
        <Tab.Screen 
          name="AI Routine" 
          component={AIRoutineScreen}
          options={{ tabBarLabel: 'IA Rutina' }}
        />
        <Tab.Screen 
          name="Community" 
          component={CommunityScreen}
          options={{ tabBarLabel: 'Comunidad' }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ tabBarLabel: 'Perfil' }}
        />
      </Tab.Navigator>
    </>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    position: 'relative',
  },
  glowBackground: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    top: 5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  separatorContainer: {
    position: 'absolute',
    bottom: 115, // Ajusta según la posición de tu TabBar
    left: 20,
    right: 20,
    height: 4,
    zIndex: 1,
    overflow: 'hidden',
  },
  gradientLine: {
    width: '100%',
    height: '100%',
  },
  tabBarBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});