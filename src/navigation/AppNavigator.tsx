import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen/SplashScreen';
import MainTabNavigator from './MainTabNavigator';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import InitialSurveyScreen from '../screens/OnboardingScreen/InitialSurveyScreen';
import { useUser } from '../context/UserContext';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, user } = useUser();

  // Si no hay autenticación, mostrar login/register
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : user?.hasCompletedSurvey ? (
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      ) : (
        <Stack.Screen name="InitialSurvey" component={InitialSurveyScreen} options={{ gestureEnabled: false }} />
      )}
    </Stack.Navigator>
  );
}