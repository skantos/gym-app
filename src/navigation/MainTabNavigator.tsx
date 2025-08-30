import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import AIRoutineScreen from '../screens/AIRoutineScreen/AIRoutineScreen';
import RoutineDetailScreen from '../screens/RoutineDetailScreen/RoutineDetailScreen';
import CommunityScreen from '../screens/CommunityScreen/CommunityScreen';
import ProfileScreen from '../screens/ProfileScreen/ProfileScreen';
import ObjectivesScreen from '../screens/GoalsScreen/ObjectivesScreen';
import CreateRoutineScreen from '../screens/CreateRoutineScreen';
import MyRoutinesScreen from '../screens/MyRoutinesScreen';
import styles from './MainTabNavigator.styles';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const AINav = createStackNavigator();
const { width, height } = Dimensions.get('window');

const AnimatedTabIcon = ({
  focused,
  route,
  theme,
}: {
  focused: boolean;
  route: any;
  theme: any;
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;
  const glowValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
      case 'Home':
        return 'home';
      case 'AI Routine':
        return 'flash';
      case 'Community':
        return 'people';
      case 'Profile':
        return 'person';
      case 'Objectives':
        return 'flag';
      default:
        return 'home';
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
              backgroundColor: theme.colors.accent + '40',
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

function TabNavigator() {
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
            bottom: height * 0.02,
            left: width * 0.05,
            right: width * 0.05,
            height: 70,
            backgroundColor: 'transparent',
            borderRadius: 20,
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            paddingHorizontal: width * 0.03,
            paddingBottom: 10,
            paddingTop: 10,
            borderColor: theme.colors.borderNeon,
            borderWidth: 1,
          },
          tabBarBackground: () => (
            <View
              style={[
                styles.tabBarBackground,
                { 
                  backgroundColor: theme.colors.card + 'CC',
                  borderColor: theme.colors.borderNeon,
                },
              ]}
            />
          ),
          tabBarActiveTintColor: theme.colors.accent,
          tabBarInactiveTintColor: theme.colors.text + '99',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 0.5,
            marginTop: 5,
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
          component={AIRoutineStack}
          options={{ tabBarLabel: 'IA Rufins' }}
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

export default function MainTabNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TabsRoot" component={TabNavigator} />
      <Stack.Screen name="CreateRoutine" component={CreateRoutineScreen} options={{ presentation: 'modal', gestureEnabled: true }} />
      <Stack.Screen name="MyRoutines" component={MyRoutinesScreen} options={{ presentation: 'card', gestureEnabled: true }} />
      <Stack.Screen name="RoutineDetail" component={RoutineDetailScreen} options={{ presentation: 'card', gestureEnabled: true }} />
    </Stack.Navigator>
  );
}

function AIRoutineStack() {
  return (
    <AINav.Navigator screenOptions={{ headerShown: false }}>
      <AINav.Screen name="AIRoutineRoot" component={AIRoutineScreen} />
    </AINav.Navigator>
  );
}