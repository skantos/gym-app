import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen/SplashScreen';
import MainTabNavigator from './MainTabNavigator';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import GenderQuestionScreen from '../screens/OnboardingScreen/GenderQuestionScreen';
import ObjectivesQuestionScreen from '../screens/OnboardingScreen/ObjectivesQuestionScreen';
import CurrentPhysiqueQuestionScreen from '../screens/OnboardingScreen/CurrentPhysiqueQuestionScreen';
import WeightHeightQuestionScreen from '../screens/OnboardingScreen/WeightHeightQuestionScreen';
import { useUser } from '../context/UserContext';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, user, forceLoginOnStart } = useUser();

  // Si no hay autenticación, mostrar login/register
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated || forceLoginOnStart ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : user?.hasCompletedSurvey ? (
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      ) : (
        <>
          <Stack.Screen name="GenderQuestion" component={GenderQuestionScreen} options={{ gestureEnabled: false }} />
          <Stack.Screen name="ObjectivesQuestion" component={ObjectivesQuestionScreen} options={{ gestureEnabled: false }} />
          <Stack.Screen name="CurrentPhysiqueQuestion" component={CurrentPhysiqueQuestionScreen} options={{ gestureEnabled: false }} />
          <Stack.Screen name="WeightHeightQuestion" component={WeightHeightQuestionScreen} options={{ gestureEnabled: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}