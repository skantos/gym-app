import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen/SplashScreen';
import MainTabNavigator from './MainTabNavigator';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import InitialSurveyScreen from '../screens/OnboardingScreen/InitialSurveyScreen';
import { useUser } from '../context/UserContext';
// import { supabase } from '../services/supabase';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [showSplash, setShowSplash] = useState(true);
  const { isAuthenticated, user } = useUser();

  useEffect(() => {
    // Mostrar splash por 3 segundos y luego cambiar a la app principal
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        user?.hasCompletedSurvey ? (
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="InitialSurvey" component={InitialSurveyScreen} options={{ gestureEnabled: false }} />
        )
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
